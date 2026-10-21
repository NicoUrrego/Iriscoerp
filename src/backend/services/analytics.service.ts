import type { SqlExecutor } from '../database/contracts';
import type { Analytics,Movement } from '../domain/types';
import { date,choice,today,variation,fail } from '../domain/validation';
import { CatalogRepository } from '../repositories/catalog.repository';
import { OrdersRepository } from '../repositories/orders.repository';

/** Generates dated fixed-cost obligations without storing duplicate ledger entries. */
const ledger=`WITH RECURSIVE
limite AS (SELECT ? AS fin),
cuotas(id,concepto,categoria,monto,mes,dia,inicio,paso) AS (
  SELECT f.id,f.concepto,c.nombre,f.monto_centavos,date(f.inicio,'start of month'),f.dia_pago,f.inicio,
    CASE f.frecuencia WHEN 'Mensual' THEN 1 WHEN 'Bimestral' THEN 2 WHEN 'Trimestral' THEN 3 ELSE 12 END
  FROM costos_fijos f JOIN categorias c ON c.id=f.categoria_id WHERE f.inicio<=(SELECT fin FROM limite)
  UNION ALL
  SELECT id,concepto,categoria,monto,date(mes,'+'||paso||' months'),dia,inicio,paso FROM cuotas
  WHERE date(mes,'+'||paso||' months')<=date((SELECT fin FROM limite),'start of month')
),
vencimientos AS (
  SELECT id,concepto,categoria,monto,inicio,
    date(mes,'+'||(MIN(dia,CAST(strftime('%d',date(mes,'+1 month','-1 day')) AS INTEGER))-1)||' days') AS fecha FROM cuotas
),
movimientos AS (
  SELECT g.id,g.concepto,c.nombre AS categoria,g.monto_centavos AS monto,g.fecha,'GASTO' AS tipo FROM gastos g JOIN categorias c ON c.id=g.categoria_id
  UNION ALL
  SELECT p.id,'Venta '||p.id,'Ventas',v.total_centavos,p.fecha_venta,'INGRESO' FROM pedidos p JOIN v_pedidos_total v ON v.id=p.id WHERE p.estado='Completado'
  UNION ALL
  SELECT id||':'||fecha,concepto,categoria,monto,fecha,'GASTO' FROM vencimientos WHERE fecha>=inicio
)`;

export class AnalyticsService {
  constructor(private readonly sql:SqlExecutor) {}
  async summary(params:URLSearchParams):Promise<Analytics> {
    const end=date(params.get('hasta')??today()),d=new Date(end+'T12:00:00Z');
    const period=choice(params.get('periodo')??'mes',['mes','trimestre','ano'],'periodo'),span=period==='ano'?12:period==='trimestre'?3:1;
    const start=date(params.get('desde')??`${end.slice(0,4)}-${String(Math.floor(d.getUTCMonth()/span)*span+1).padStart(2,'0')}-01`);
    if (start>end) fail('Rango de fechas inválido');
    if (Number(end.slice(0,4))-Number(start.slice(0,4))>100) fail('El rango no puede superar 100 años');
    const totals=(await this.sql.query<{ingresos:number;gastos:number}>(ledger+` SELECT COALESCE(SUM(CASE WHEN tipo='INGRESO' THEN monto ELSE 0 END),0) AS ingresos,COALESCE(SUM(CASE WHEN tipo='GASTO' THEN monto ELSE 0 END),0) AS gastos FROM movimientos WHERE fecha BETWEEN ? AND ?`,[end,start,end]))[0];
    const movements=await this.sql.query<Movement>(ledger+` SELECT id,concepto,categoria,monto/100.0 AS monto,fecha,tipo FROM movimientos WHERE fecha BETWEEN ? AND ? ORDER BY fecha DESC,id DESC`,[end,start,end]);
    const categories=await this.sql.query<{nombre:string;monto:number}>(ledger+` SELECT categoria AS nombre,SUM(monto)/100.0 AS monto FROM movimientos WHERE tipo='GASTO' AND fecha BETWEEN ? AND ? GROUP BY categoria ORDER BY monto DESC`,[end,start,end]);
    const top=await this.sql.query<{nombre:string;cantidad:number;ingresos:number;costo:number}>(`SELECT MAX(d.nombre) AS nombre,SUM(d.cantidad) AS cantidad,SUM(d.subtotal_centavos)/100.0 AS ingresos,SUM(d.cantidad*d.costo_centavos)/100.0 AS costo FROM detalle_pedido d JOIN pedidos p ON p.id=d.pedido_id WHERE p.estado='Completado' AND p.fecha_venta BETWEEN ? AND ? GROUP BY d.producto_id ORDER BY cantidad DESC`,[start,end]);
    const cost=top.reduce((s,p)=>s+p.costo,0),units=top.reduce((s,p)=>s+p.cantidad,0);
    const monthly=await this.sql.query<{mes:string;ingresos:number;gastos:number}>(ledger+` SELECT substr(fecha,1,7) AS mes,SUM(CASE WHEN tipo='INGRESO' THEN monto ELSE 0 END)/100.0 AS ingresos,SUM(CASE WHEN tipo='GASTO' THEN monto ELSE 0 END)/100.0 AS gastos FROM movimientos WHERE fecha<=? GROUP BY substr(fecha,1,7)`,[end,end]);
    const months=Array.from({length:6},(_,i)=>{const mes=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()-5+i,1)).toISOString().slice(0,7);return monthly.find(x=>x.mes===mes)??{mes,ingresos:0,gastos:0};});
    const last=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()-1,1)).toISOString().slice(0,7),previous=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()-2,1)).toISOString().slice(0,7);
    const sales=(m:string)=>monthly.find(x=>x.mes===m)?.ingresos??0;
    const stock=async(boundary:string,inclusive:boolean)=>(await this.sql.query<{n:number}>(`SELECT COALESCE(SUM(delta),0) AS n FROM eventos_stock WHERE fecha${inclusive?'<=?':'<?'}`,[boundary]))[0].n;
    const active=async(boundary:string,inclusive:boolean)=>(await this.sql.query<{n:number}>(`SELECT COALESCE(SUM(delta),0) AS n FROM eventos_pedidos WHERE fecha${inclusive?'<=?':'<?'}`,[boundary]))[0].n;
    const stockNow=await stock(end,true),activeNow=await active(end,true),monthStart=end.slice(0,7)+'-01';
    const startDate=new Date(start+'T12:00:00Z'),priorStart=new Date(Date.UTC(startDate.getUTCFullYear(),startDate.getUTCMonth()-span,1)).toISOString().slice(0,10);
    const prior=(await this.sql.query<{n:number}>(ledger+` SELECT COALESCE(SUM(monto),0)/100.0 AS n FROM movimientos WHERE tipo='INGRESO' AND fecha>=? AND fecha<?`,[end,priorStart,start]))[0].n;
    const ingresos=totals.ingresos/100,gastos=totals.gastos/100;
    const catalog=new CatalogRepository(this.sql);
    return {desde:start,hasta:end,ingresos,gastos,gananciaNeta:ingresos-gastos,margen:ingresos?(ingresos-gastos)*100/ingresos:0,costoProduccion:cost,utilidadBruta:ingresos-cost,productividad:cost?ingresos/cost:null,crecimiento:variation(ingresos,prior),unidadesVendidas:units,
      ventasUltimoMes:sales(last),variacionVentas:variation(sales(last),sales(previous)),stock:stockNow,variacionStock:variation(stockNow,await stock(monthStart,false)),pedidosActivos:activeNow,variacionPedidos:variation(activeNow,await active(monthStart,false)),
      meses:months,gastosPorCategoria:categories,productosMasVendidos:top,pedidosRecientes:(await new OrdersRepository(this.sql).list()).slice(0,10),movimientos:movements,bajoStock:(await catalog.list('materiales')).filter(m=>m.cantidad<m.stockMinimo)};
  }
}
