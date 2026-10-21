import type { SqlExecutor } from '../database/contracts';
import { CatalogRepository,tables,type Resource } from '../repositories/catalog.repository';
import { OrdersRepository } from '../repositories/orders.repository';
import { text,num,integer,cents,choice,date,email,today,fail } from '../domain/validation';

type Body=Record<string,unknown>;
export class CatalogService {
  private repo:CatalogRepository;
  constructor(private readonly sql:SqlExecutor,private readonly userId:string) { this.repo=new CatalogRepository(sql); }
  async request(kind:Resource,id:string|undefined,method:string,body:Body,query:string):Promise<unknown> {
    if (method==='GET') return id?this.repo.get(kind,id):this.repo.list(kind,query);
    const old=id?await this.repo.get(kind,id):undefined;
    if (method==='DELETE' && id) {
      if (kind==='productos') {
        if ((await this.sql.query('SELECT id FROM detalle_pedido WHERE producto_id=? LIMIT 1',[id])).length) fail('Producto asociado a pedidos; no se puede eliminar',409);
        await new OrdersRepository(this.sql).stockEvent(id,-('stock' in old! ? old.stock:0),this.userId,today(),'Eliminar producto');
      }
      await this.repo.remove(kind,id); return {ok:true};
    }
    if (!(method==='POST'&&!id || (method==='PUT'||method==='PATCH')&&id)) fail('Método no permitido',405);
    const b:Body=method==='PATCH'?{...old,...body}:body;
    const key=id??crypto.randomUUID(),exists=!!old;
    if (kind==='productos') {
      const fields={nombre:text(b.nombre,'nombre'),categoria_id:await this.repo.category('PRODUCTO',text(b.categoria,'categoría')),precio_centavos:cents(b.precio,'precio'),costo_centavos:cents(b.costoProduccion,'costo de producción'),descuento:num(b.descuento??0,'descuento',0,100),stock:integer(b.stock,'stock')};
      await this.repo.save('productos',key,fields,exists);
      await new OrdersRepository(this.sql).stockEvent(key,fields.stock-(old&&'stock' in old?old.stock:0),this.userId,today(),exists?'Ajuste de stock':'Registro de producto');
    } else if (kind==='materiales') {
      await this.repo.save('materiales',key,{nombre:text(b.nombre,'nombre'),categoria_id:await this.repo.category('MATERIAL',text(b.categoria,'categoría')),cantidad:num(b.cantidad,'cantidad'),unidad:text(b.unidad,'unidad'),stock_minimo:num(b.stockMinimo,'stock mínimo'),ultima_compra:date(b.ultimaCompra??(old&&'ultimaCompra' in old?old.ultimaCompra:today()))},exists);
    } else if (kind==='costos') {
      await this.repo.save('costos_fijos',key,{concepto:text(b.concepto,'concepto'),categoria_id:await this.repo.category('FINANZA',text(b.categoria,'categoría')),monto_centavos:cents(b.monto,'monto'),frecuencia:choice(b.frecuencia,['Mensual','Bimestral','Trimestral','Anual'],'frecuencia'),dia_pago:integer(Number(b.fechaPago),'día de pago',1,31),inicio:date(b.inicio??(old&&'inicio' in old?old.inicio:today()))},exists);
    } else if (kind==='gastos') {
      const monto=cents(b.monto,'monto'); if (!monto) fail('El gasto debe ser mayor que cero');
      await this.repo.save('gastos',key,{concepto:text(b.concepto,'concepto'),categoria_id:await this.repo.category('FINANZA',choice(b.categoria,['Materias primas','Mano de obra','Otros'],'categoría')),monto_centavos:monto,fecha:date(b.fecha??today())},exists);
    } else if (kind==='empleados') {
      const mail=email(b.email);
      if ((await this.sql.query('SELECT id FROM empleados WHERE correo=? COLLATE NOCASE AND id<>?',[mail,key])).length) fail('El correo del empleado ya existe',409);
      await this.repo.save('empleados',key,{nombre:text(b.nombre,'nombre'),rol:text(b.rol,'cargo'),salario_centavos:cents(b.salario,'salario'),horario:text(b.horario,'horario'),telefono:text(b.telefono,'teléfono'),correo:mail,fecha_ingreso:date(b.fechaIngreso??today())},exists);
    } else {
      const last=date(b.ultimoMantenimiento),next=date(b.proximoMantenimiento);
      if (next<last) fail('El próximo mantenimiento debe ser posterior al último');
      await this.repo.save('maquinaria',key,{nombre:text(b.nombre,'nombre'),tipo:text(b.tipo,'tipo'),estado:choice(b.estado,['Activo','Mantenimiento','Reparación'],'estado'),ubicacion:text(b.ubicacion,'ubicación')},exists);
      await this.sql.run('INSERT INTO mantenimientos_maquinaria VALUES (?,?,?,?,?) ON CONFLICT(maquinaria_id) DO UPDATE SET ultima_fecha=excluded.ultima_fecha,proxima_fecha=excluded.proxima_fecha,costo_centavos=excluded.costo_centavos',[crypto.randomUUID(),key,last,next,cents(b.costoMantenimiento,'costo de mantenimiento')]);
    }
    return this.repo.get(kind,key);
  }
}
