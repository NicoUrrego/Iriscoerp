import type { SqlExecutor } from '../database/contracts';
import type { Order,OrderItem } from '../domain/types';
import { OrdersRepository } from '../repositories/orders.repository';
import { text,integer,num,cents,safeMoney,choice,email,object,today,fail } from '../domain/validation';

interface ProductRow { id:string; nombre:string; stock:number; precio:number; costo:number; descuento:number }
export class OrdersService {
  private repo:OrdersRepository;
  constructor(private readonly sql:SqlExecutor,private readonly userId:string) {this.repo=new OrdersRepository(sql);}
  private async restore(order:Order) {
    for (const i of order.items) {
      await this.sql.run('UPDATE productos SET stock=stock+? WHERE id=?',[i.cantidad,i.productoId]);
      await this.repo.stockEvent(i.productoId,i.cantidad,this.userId,today(),'Devolver reserva '+order.id);
    }
  }
  private async activeEvent(id:string,delta:number) {
    if (delta) await this.sql.run('INSERT INTO eventos_pedidos VALUES (?,?,?,?,?)',[crypto.randomUUID(),id,delta,today(),this.userId]);
  }
  async request(id:string|undefined,method:string,body:Record<string,unknown>,q:string):Promise<unknown> {
    if (method==='GET') return id?this.repo.get(id):this.repo.list(q);
    const old=id?await this.repo.get(id):undefined;
    if (method==='DELETE'&&old) {
      await this.restore(old); await this.activeEvent(old.id,old.estado!=='Completado'?-1:0);
      const customer=(await this.sql.query<{cliente_id:string}>('SELECT cliente_id FROM pedidos WHERE id=?',[old.id]))[0].cliente_id;
      await this.sql.run('DELETE FROM pedidos WHERE id=?',[old.id]); await this.sql.run('DELETE FROM clientes WHERE id=?',[customer]);
      return {ok:true};
    }
    if (!(method==='POST'&&!id || (method==='PUT'||method==='PATCH')&&id)) fail('Método no permitido',405);
    const b=method==='PATCH'?{...old,...body}:body;
    if (!Array.isArray(b.items)||!b.items.length||b.items.length>100) fail('Incluye entre 1 y 100 productos');
    if (old) await this.restore(old);
    const seen=new Set<string>(),items:OrderItem[]=[];
    for (const raw of b.items) {
      const i=object(raw),productId=text(i.productoId,'producto'),cantidad=integer(i.cantidad,'cantidad',1);
      if (seen.has(productId)) fail('El mismo producto no puede repetirse en varias líneas'); seen.add(productId);
      const p=(await this.sql.query<ProductRow>('SELECT id,nombre,stock,precio_centavos AS precio,costo_centavos AS costo,descuento FROM productos WHERE id=?',[productId]))[0]??fail('Producto no encontrado',404);
      const changes=await this.sql.run('UPDATE productos SET stock=stock-? WHERE id=? AND stock>=?',[cantidad,productId,cantidad]);
      if (changes!==1) fail('Stock insuficiente: '+p.nombre,409);
      const snapshot=old?.items.find(x=>x.productoId===productId);
      const precio=snapshot?cents(snapshot.precio,'precio histórico'):p.precio,costo=snapshot?cents(snapshot.costoProduccion,'costo histórico'):p.costo,descuento=snapshot?.descuento??p.descuento;
      const subtotal=safeMoney(Math.round(precio*cantidad*(1-descuento/100))); safeMoney(costo*cantidad);
      items.push({productoId:productId,nombre:snapshot?.nombre??p.nombre,cantidad,precio,costoProduccion:costo,descuento,subtotal});
      await this.repo.stockEvent(productId,-cantidad,this.userId,today(),'Reservar pedido '+(id??'nuevo'));
    }
    safeMoney(items.reduce((sum,i)=>sum+i.subtotal,0));
    const estado=choice(b.estado,['Pendiente','En proceso','Completado'],'estado'),formaPago=choice(b.formaPago,['Efectivo','Tarjeta','Transferencia'],'forma de pago');
    const customer=old?(await this.sql.query<{cliente_id:string}>('SELECT cliente_id FROM pedidos WHERE id=?',[old.id]))[0].cliente_id:crypto.randomUUID();
    await this.sql.run('INSERT INTO clientes VALUES (?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET nombre=excluded.nombre,telefono=excluded.telefono,correo=excluded.correo,direccion=excluded.direccion',[customer,text(b.cliente,'cliente'),text(b.telefono,'teléfono'),email(b.email),text(b.direccion,'dirección')]);
    const key=old?.id??crypto.randomUUID(),saleDate=estado==='Completado'?(old?.fechaVenta??today()):null;
    if (old) {
      await this.sql.run('UPDATE pedidos SET estado=?,forma_pago=?,fecha_venta=? WHERE id=?',[estado,formaPago,saleDate,key]);
      await this.sql.run('DELETE FROM detalle_pedido WHERE pedido_id=?',[key]);
    } else await this.sql.run('INSERT INTO pedidos VALUES (?,?,?,?,?,?)',[key,customer,today(),saleDate,estado,formaPago]);
    for (const [pos,i] of items.entries()) await this.sql.run('INSERT INTO detalle_pedido VALUES (?,?,?,?,?,?,?,?,?,?)',[crypto.randomUUID(),key,i.productoId,i.nombre,i.cantidad,i.precio,i.costoProduccion,i.descuento,i.subtotal,pos]);
    await this.activeEvent(key,Number(estado!=='Completado')-Number(old?old.estado!=='Completado':false));
    return this.repo.get(key);
  }
}
