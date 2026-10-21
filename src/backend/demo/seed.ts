import type { SqlDatabase } from '../database/database';
import type { Product, Order, Role } from '../domain/types';
import { today } from '../domain/validation';
import { derive, randomHex } from '../services/crypto';
import { CatalogService } from '../services/catalog.service';
import { OrdersService } from '../services/orders.service';

export const DEMO_PASSWORD = 'IrisDemo2026!';

/** Demo-only, atomic and repeatable: never populates an existing business database. */
export async function seedDemo(db: SqlDatabase, anchor = today()): Promise<boolean> {
  const salt = randomHex(16), hash = await derive(DEMO_PASSWORD, salt);
  const base = new Date(anchor + 'T12:00:00Z');
  const day = (months: number, date: number) => {
    const value = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + months, date)).toISOString().slice(0, 10);
    return value > anchor ? anchor : value;
  };
  return db.transaction(async sql => {
    await sql.execute('CREATE TABLE IF NOT EXISTS demo_seed(version INTEGER PRIMARY KEY, created_at TEXT NOT NULL)');
    if ((await sql.query('SELECT version FROM demo_seed')).length) return false;
    if ((await sql.query('SELECT id FROM usuarios LIMIT 1')).length) return false;
    const admin = crypto.randomUUID();
    for (const [username, role] of [['admin.demo', 'ADMIN'], ['ventas.demo', 'VENTAS'], ['inventario.demo', 'INVENTARIO']] as [string, Role][]) {
      await sql.run('INSERT INTO usuarios VALUES (?,?,?,?,?,?,?)', [role === 'ADMIN' ? admin : crypto.randomUUID(), username, username + '@example.com', role, salt, hash, anchor]);
    }
    const catalog = new CatalogService(sql, admin), orders = new OrdersService(sql, admin);
    const products: Product[] = [];
    const productData = [
      ['Camisa Oxford azul', 'Camisas', 85000, 36000, 5, 180],
      ['Pantalón clásico negro', 'Pantalones', 115000, 48000, 0, 160],
      ['Vestido floral', 'Vestidos', 145000, 62000, 10, 140],
      ['Chaqueta denim', 'Chaquetas', 180000, 78000, 0, 140],
      ['Blusa blanca', 'Blusas', 65000, 26000, 0, 180],
      ['Camiseta básica', 'Camisas', 45000, 18000, 0, 220],
    ] as const;
    for (const [nombre, categoria, precio, costoProduccion, descuento, stock] of productData) {
      products.push(await catalog.request('productos', undefined, 'POST', {nombre, categoria, precio, costoProduccion, descuento, stock}, '') as Product);
    }
    await sql.run("UPDATE eventos_stock SET fecha=? WHERE motivo='Registro de producto'", [day(-5, 1)]);
    const materials = [
      ['Tela algodón azul', 'Telas', 85, 'metros', 20], ['Tela denim', 'Telas', 12, 'metros', 25],
      ['Tela estampada floral', 'Telas', 45.5, 'metros', 15], ['Hilo blanco', 'Hilos', 30, 'conos', 10],
      ['Hilo negro', 'Hilos', 4, 'conos', 10], ['Botones nacarados', 'Accesorios', 250, 'unidades', 100],
      ['Cremalleras de 20 cm', 'Accesorios', 18, 'unidades', 30], ['Etiquetas Iris', 'Accesorios', 500, 'unidades', 100],
    ] as const;
    for (const [nombre, categoria, cantidad, unidad, stockMinimo] of materials) {
      await catalog.request('materiales', undefined, 'POST', {nombre, categoria, cantidad, unidad, stockMinimo, ultimaCompra: day(0, 2)}, '');
    }
    const names = ['Cliente Demo Aurora', 'Cliente Demo Horizonte', 'Cliente Demo Textil Norte', 'Cliente Demo Primavera'];
    for (let month = -5; month <= 0; month++) {
      for (let n = 0; n < 4; n++) {
        const fecha = day(month, [3, 8, 13, 18][n]);
        const estado = month === 0 && n === 2 ? 'Pendiente' : month === 0 && n === 3 ? 'En proceso' : 'Completado';
        const order = await orders.request(undefined, 'POST', {
          cliente: names[n], telefono: '300000000' + n, email: 'cliente.demo.' + n + '@example.com', direccion: 'Dirección ficticia de prueba ' + (n + 1),
          formaPago: ['Efectivo', 'Tarjeta', 'Transferencia', 'Efectivo'][n], estado,
          items: [{productoId: products[n].id, cantidad: 3 + (month + 5) % 3}, {productoId: products[(n + 2) % 6].id, cantidad: 2}],
        }, '') as Order;
        await sql.run('UPDATE pedidos SET fecha=?,fecha_venta=? WHERE id=?', [fecha, estado === 'Completado' ? fecha : null, order.id]);
        await sql.run("UPDATE eventos_stock SET fecha=? WHERE motivo='Reservar pedido nuevo' AND fecha=?", [fecha, today()]);
        await sql.run('UPDATE eventos_pedidos SET fecha=? WHERE pedido_id=?', [fecha, order.id]);
      }
      for (const [concepto, categoria, monto] of [['Compra de telas demo', 'Materias primas', 280000 + (month + 5) * 18000], ['Trabajo de confección demo', 'Mano de obra', 210000], ['Transporte demo', 'Otros', 45000]] as const) {
        await catalog.request('gastos', undefined, 'POST', {concepto, categoria, monto, fecha: day(month, 6)}, '');
      }
    }
    for (const [concepto, monto, frecuencia, fechaPago] of [['Arriendo taller demo', 400000, 'Mensual', '1'], ['Servicios demo', 90000, 'Mensual', '5'], ['Internet demo', 60000, 'Mensual', '10'], ['Revisión técnica demo', 120000, 'Trimestral', '15']] as const) {
      await catalog.request('costos', undefined, 'POST', {concepto, categoria: 'Otros', monto, frecuencia, fechaPago, inicio: day(-5, 1)}, '');
    }
    for (const [n, rol] of ['Confección', 'Corte', 'Ventas', 'Administración'].entries()) {
      await catalog.request('empleados', undefined, 'POST', {nombre: ['Ana Demo', 'Carlos Demo', 'Laura Demo', 'Mateo Demo'][n], rol, salario: 1600000 + n * 100000, horario: 'Lunes a viernes 8:00 a 17:00', telefono: '310000000' + n, email: 'empleado.demo.' + n + '@example.com', fechaIngreso: day(-5, 1)}, '');
    }
    for (const [n, estado] of ['Activo', 'Mantenimiento', 'Reparación'].entries()) {
      await catalog.request('maquinaria', undefined, 'POST', {nombre: ['Máquina recta demo', 'Fileteadora demo', 'Cortadora demo'][n], tipo: ['Costura', 'Acabado', 'Corte'][n], estado, ubicacion: 'Taller demo · área ' + (n + 1), ultimoMantenimiento: day(-1, 10), proximoMantenimiento: new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + 1, 10)).toISOString().slice(0, 10), costoMantenimiento: 80000 + n * 20000}, '');
    }
    await sql.run('INSERT INTO demo_seed VALUES (?,?)', [1, anchor]);
    return true;
  });
}
