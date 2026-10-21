import type { SqlExecutor } from '../database/contracts';
import type { Order,OrderItem } from '../domain/types';
import { fail } from '../domain/validation';

export class OrdersRepository {
  constructor(private readonly sql:SqlExecutor) {}
  async list(query=''):Promise<Order[]> {
    const where=query?` WHERE LOWER(c.nombre) LIKE LOWER(?) OR LOWER(p.id) LIKE LOWER(?) OR EXISTS(SELECT 1 FROM detalle_pedido d WHERE d.pedido_id=p.id AND LOWER(d.nombre) LIKE LOWER(?))`:'';
    const rows=await this.sql.query<Omit<Order,'items'|'productos'>>(`SELECT p.id,c.nombre AS cliente,c.telefono,c.correo AS email,c.direccion,p.fecha,p.fecha_venta AS fechaVenta,p.estado,p.forma_pago AS formaPago,v.total_centavos/100.0 AS total,v.cantidad FROM pedidos p JOIN clientes c ON c.id=p.cliente_id JOIN v_pedidos_total v ON v.id=p.id`+where+' ORDER BY p.rowid DESC',query?Array(3).fill('%'+query+'%'):[]);
    const items=await this.sql.query<OrderItem & {pedidoId:string}>(`SELECT pedido_id AS pedidoId,producto_id AS productoId,nombre,cantidad,precio_centavos/100.0 AS precio,costo_centavos/100.0 AS costoProduccion,descuento,subtotal_centavos/100.0 AS subtotal FROM detalle_pedido ORDER BY posicion`);
    return rows.map(p=>{const lines=items.filter(i=>i.pedidoId===p.id).map(({pedidoId,...i})=>i);return {...p,items:lines,productos:lines.map(i=>i.nombre).join(', ')};});
  }
  async get(id:string):Promise<Order> { return (await this.list()).find(p=>p.id===id)??fail('Pedido no encontrado',404); }
  async stockEvent(productId:string,delta:number,userId:string,fecha:string,motivo:string) {
    await this.sql.run('INSERT INTO eventos_stock VALUES (?,?,?,?,?,?)',[crypto.randomUUID(),productId,delta,fecha,userId,motivo]);
  }
}
