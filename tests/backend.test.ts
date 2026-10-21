import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import initSqlJs from 'sql.js';
import 'fake-indexeddb/auto';
import {BrowserSqliteDriver} from '../src/backend/database/drivers/browser';
import {SqlJsDriver} from '../src/backend/database/drivers/sqljs';
import {SqlDatabase} from '../src/backend/database/database';
import {ErpService} from '../src/backend/services/erp.service';
import {date,today} from '../src/backend/domain/validation';
import type {Session,Product,Order,Material,Analytics,Employee,Machine,FixedCost} from '../src/backend/domain/types';

const engine=initSqlJs({locateFile:name=>resolve('node_modules/sql.js/dist',name)});
const schema=await readFile(new URL('../src/database/schema.sql',import.meta.url),'utf8');
const seed=await readFile(new URL('../src/database/seed.sql',import.meta.url),'utf8');
const migrations=[{version:1,sql:schema+'\n'+seed}];
const make=(bytes?:Uint8Array)=>{
  const driver=new SqlJsDriver(()=>engine,bytes),db=new SqlDatabase(driver,migrations);
  return {driver,db,erp:new ErpService(db)};
};
async function fixture(){
  const f=make();
  await f.erp.request('auth/register','POST',{username:'admin',email:'admin@iris.co',password:'password123',role:'ADMIN'});
  const session=await f.erp.request('auth/login','POST',{username:'ADMIN',password:'password123'}) as Session;
  const call=<T=unknown>(path:string,method='GET',body?:unknown)=>f.erp.request(path,method,body,session.token) as Promise<T>;
  const product=await call<Product>('productos','POST',{nombre:'Camisa',categoria:'Camisas',precio:100,costoProduccion:40,descuento:10,stock:10});
  const order={cliente:'Ana',telefono:'12345',email:'ana@iris.co',direccion:'Calle 1',formaPago:'Efectivo',estado:'Pendiente',items:[{productoId:product.id,cantidad:2}]};
  return {...f,call,session,product,order};
}
test('migración inicial idempotente y archivo SQLite real que se puede reabrir',async()=>{
  const {driver,db,call,session,product}=await fixture();
  const versions=await db.transaction(sql=>sql.query<{n:number}>('SELECT COUNT(*) AS n FROM schema_migrations'));
  assert.equal(versions[0].n,1);
  const bytes=driver.exportBytes();
  assert.equal(new TextDecoder().decode(bytes.slice(0,15)),'SQLite format 3');
  const reopened=make(bytes);
  const restored=await reopened.erp.request('productos/'+product.id,'GET',undefined,session.token) as Product;
  assert.equal(restored.stock,10);assert.equal(restored.precio,100);
  assert.equal((await call<Product[]>('productos')).length,1);
});
test('claves foráneas, restricciones SQL y recuperación de la cola tras fallar',async()=>{
  const {db,call}=await fixture();
  await assert.rejects(db.transaction(sql=>sql.run('INSERT INTO productos VALUES (?,?,?,?,?,?,?)',['bad','bad',999999,1,1,0,1])),/FOREIGN KEY/);
  await assert.rejects(db.transaction(sql=>sql.run('UPDATE productos SET stock=-1')),/CHECK constraint/);
  assert.equal((await call<Product[]>('productos')).length,1);
});
test('pedidos relacionados, descuentos, instantáneas históricas, edición y devolución de stock',async()=>{
  const {call,product,order,db}=await fixture();
  const p=await call<Order>('pedidos','POST',order);assert.equal(p.total,180);
  assert.equal((await call<Product>('productos/'+product.id)).stock,8);
  await call('productos/'+product.id,'PATCH',{precio:200,descuento:0});
  const edited=await call<Order>('pedidos/'+p.id,'PATCH',{items:[{productoId:product.id,cantidad:3}],estado:'Completado'});
  assert.equal(edited.total,270);assert.equal(edited.items[0].precio,100);assert.equal(edited.fechaVenta,today());
  assert.equal((await call<Product>('productos/'+product.id)).stock,7);
  await assert.rejects(call('productos/'+product.id,'DELETE'),/asociado/);
  await call('pedidos/'+p.id,'DELETE');assert.equal((await call<Product>('productos/'+product.id)).stock,10);
  const rows=await db.transaction(sql=>sql.query<{n:number}>('SELECT COUNT(*) AS n FROM detalle_pedido'));assert.equal(rows[0].n,0);
});
test('fallo de una línea, duplicados y edición imposible revierten toda la transacción',async()=>{
  const {call,product,order}=await fixture();
  const second=await call<Product>('productos','POST',{nombre:'Pantalón',categoria:'Ropa',precio:100,costoProduccion:10,descuento:0,stock:1});
  await assert.rejects(call('pedidos','POST',{...order,items:[...order.items,{productoId:second.id,cantidad:5}]}),/Stock insuficiente/);
  assert.equal((await call<Product>('productos/'+product.id)).stock,10);
  await assert.rejects(call('pedidos','POST',{...order,items:[...order.items,...order.items]}),/no puede repetirse/);
  const p=await call<Order>('pedidos','POST',order);
  await assert.rejects(call('pedidos/'+p.id,'PATCH',{items:[{productoId:product.id,cantidad:30}]}),/Stock insuficiente/);
  assert.equal((await call<Product>('productos/'+product.id)).stock,8);assert.equal((await call<Order>('pedidos/'+p.id)).total,180);
});
test('concurrencia: no se sobrevende el stock y la reserva persiste',async()=>{
  const {call,order,product}=await fixture();
  const body={...order,items:[{productoId:product.id,cantidad:7}]};
  const results=await Promise.allSettled([call('pedidos','POST',body),call('pedidos','POST',body)]);
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal((await call<Product>('productos/'+product.id)).stock,3);
});
test('autenticación, duplicados, perfiles, expiración y revocación de sesión',async()=>{
  const {call,erp,product,db}=await fixture();
  await assert.rejects(erp.request('auth/login','POST',{username:'admin',password:'incorrecta123'}),/Credenciales/);
  await assert.rejects(erp.request('auth/register','POST',{username:'otro',email:'otro@iris.co',password:'password123'}),/Sesión/);
  await assert.rejects(call('auth/register','POST',{username:'ADMIN',email:'otro@iris.co',password:'password123'}),/ya existe/);
  await call('auth/register','POST',{username:'ventas',email:'ventas@iris.co',password:'password123',role:'VENTAS'});
  const sales=await erp.request('auth/login','POST',{username:'ventas',password:'password123'}) as Session;
  await assert.rejects(erp.request('finanzas','GET',undefined,sales.token),/permiso/);
  await assert.rejects(erp.request('productos/'+product.id,'PATCH',{stock:999},sales.token),/solo lectura/);
  await erp.request('auth/logout','POST',undefined,sales.token);
  await assert.rejects(erp.request('productos','GET',undefined,sales.token),/Sesión/);
  await db.transaction(sql=>sql.run('UPDATE sesiones SET vence_en=0'));
  await assert.rejects(call('productos'),/Sesión/);
});
test('intentos de login persistidos y restablecimiento después de vencer el bloqueo',async()=>{
  const {erp,db}=await fixture();
  for(let i=0;i<10;i++)await assert.rejects(erp.request('auth/login','POST',{username:'admin',password:'incorrecta123'}),/Credenciales/);
  await assert.rejects(erp.request('auth/login','POST',{username:'admin',password:'password123'}),/Demasiados/);
  await db.transaction(sql=>sql.run('UPDATE login_intentos SET hasta=0'));
  assert.ok((await erp.request('auth/login','POST',{username:'admin',password:'password123'}) as Session).token);
});
test('validaciones y consultas parametrizadas resisten texto con SQL',async()=>{
  const {call,product}=await fixture();
  const dangerous="Camisa'); DROP TABLE usuarios; --";
  await call('productos/'+product.id,'PATCH',{nombre:dangerous});
  assert.equal((await call<Product[]>('productos?q='+encodeURIComponent('DROP TABLE')))[0].nombre,dangerous);
  assert.ok((await call<unknown[]>('usuarios')).length);
  await assert.rejects(call('productos/'+product.id,'PATCH',{stock:1.5}),/entero/);
  await assert.rejects(call('productos/'+product.id,'PATCH',{descuento:101}),/inválido/);
  assert.throws(()=>date('2026-02-30'),/Fecha/);
});
test('inventario, empleados, maquinaria y cascada de mantenimiento',async()=>{
  const {call,db}=await fixture();
  const m=await call<Material>('materiales','POST',{nombre:'Tela',categoria:'Telas',cantidad:2.5,unidad:'metros',stockMinimo:5});
  assert.equal((await call<Material[]>('materiales/alertas'))[0].id,m.id);
  const employee=await call<Employee>('empleados','POST',{nombre:'Ana',rol:'Costura',salario:1000,horario:'8 a 5',telefono:'1234',email:'empleado@iris.co',fechaIngreso:'2026-01-01'});
  assert.equal(employee.salario,1000);
  const machine=await call<Machine>('maquinaria','POST',{nombre:'Máquina',tipo:'Costura',estado:'Activo',ubicacion:'Taller',ultimoMantenimiento:'2026-01-01',proximoMantenimiento:'2026-12-01',costoMantenimiento:50});
  assert.equal(machine.costoMantenimiento,50);await call('maquinaria/'+machine.id,'DELETE');
  assert.equal((await db.transaction(sql=>sql.query<{n:number}>('SELECT COUNT(*) AS n FROM mantenimientos_maquinaria')))[0].n,0);
});
test('finanzas SQL: fecha de venta, día 31, recurrencias y reportes sin doble conteo',async()=>{
  const {call,order,db}=await fixture();
  const p=await call<Order>('pedidos','POST',{...order,estado:'Completado'});
  await db.transaction(sql=>sql.run('UPDATE pedidos SET fecha_venta=? WHERE id=?',['2026-02-20',p.id]));
  await call('costos','POST',{concepto:'Local',categoria:'Alquiler',monto:100,frecuencia:'Mensual',fechaPago:'31',inicio:'2026-01-01'});
  await call('gastos','POST',{concepto:'Tela',categoria:'Materias primas',monto:50,fecha:'2026-02-10'});
  const result=await call<Analytics>('finanzas?hasta=2026-02-28');
  assert.equal(result.ingresos,180);assert.equal(result.gastos,150);assert.equal(result.gananciaNeta,30);assert.equal(result.costoProduccion,80);assert.equal(result.utilidadBruta,100);assert.equal(result.productividad,2.25);
  assert.ok(result.movimientos.find(r=>r.fecha==='2026-02-28'&&r.monto===100));
  const year=await call<Analytics>('finanzas?periodo=ano&hasta=2026-02-28');assert.equal(year.gastos,250);
  await call('pedidos/'+p.id,'PATCH',{estado:'Pendiente'});
  assert.equal((await call<Analytics>('finanzas?hasta=2026-02-28')).ingresos,0);
});
test('eventos reconstruyen stock y pedidos activos; respaldo excluye sesiones',async()=>{
  const {call,order}=await fixture();
  await call('pedidos','POST',order);
  const a=await call<Analytics>('dashboard');assert.equal(a.stock,8);assert.equal(a.pedidosActivos,1);
  const backup=await call<{tables:Record<string,unknown[]>}>('backup');
  assert.ok(backup.tables.detalle_pedido.length);assert.equal(backup.tables.sesiones,undefined);
});
test('una migración SQL defectuosa no deja tablas ni versiones aplicadas a medias',async()=>{
  const driver=new SqlJsDriver(()=>engine),db=new SqlDatabase(driver,[{version:1,sql:'CREATE TABLE temporal(id INTEGER); INVALID SQL;'}]);
  await assert.rejects(db.transaction(async()=>true),/syntax error/);
  assert.equal((await driver.query<{name:string}>("SELECT name FROM sqlite_master WHERE type='table'")).length,0);
});

test('adaptador de navegador: persiste SQLite, reabre y serializa dos instancias',async()=>{
  let tail:Promise<unknown>=Promise.resolve();
  const locks={request<T>(_name:string,work:()=>Promise<T>){const result=tail.then(work,work);tail=result.catch(()=>{});return result;}} as unknown as LockManager;
  const name='test-browser-'+crypto.randomUUID();
  const driver1=new BrowserSqliteDriver(()=>engine,name,()=>locks),db1=new SqlDatabase(driver1,migrations),erp1=new ErpService(db1);
  await erp1.request('auth/register','POST',{username:'admin',email:'a@iris.co',password:'password123'});
  const s=await erp1.request('auth/login','POST',{username:'admin',password:'password123'}) as Session;
  const p=await erp1.request('productos','POST',{nombre:'Camisa',categoria:'Ropa',precio:100,costoProduccion:50,stock:10},s.token) as Product;
  const driver2=new BrowserSqliteDriver(()=>engine,name,()=>locks),erp2=new ErpService(new SqlDatabase(driver2,migrations));
  assert.equal((await erp2.request('productos/'+p.id,'GET',undefined,s.token) as Product).stock,10);
  const order={cliente:'Ana',telefono:'1',email:'a@b.co',direccion:'Calle',estado:'Pendiente',formaPago:'Efectivo',items:[{productoId:p.id,cantidad:7}]};
  const result=await Promise.allSettled([erp1.request('pedidos','POST',order,s.token),erp2.request('pedidos','POST',order,s.token)]);
  assert.equal(result.filter(r=>r.status==='fulfilled').length,1);
  assert.equal((await erp1.request('productos/'+p.id,'GET',undefined,s.token) as Product).stock,3);
  assert.equal((await erp2.request('productos/'+p.id,'GET',undefined,s.token) as Product).stock,3);
});
test('un error al persistir en navegador no presenta éxito y recupera el último archivo guardado',async()=>{
  const locks={request<T>(_name:string,work:()=>Promise<T>){return work();}} as unknown as LockManager;
  class FailingDriver extends BrowserSqliteDriver {
    failNext=false;
    async persist(){if(this.failNext){this.failNext=false;throw new Error('Sin espacio para persistir');}await super.persist();}
  }
  const driver=new FailingDriver(()=>engine,'failure-'+crypto.randomUUID(),()=>locks),db=new SqlDatabase(driver,migrations);
  await db.transaction(async()=>true);
  driver.failNext=true;
  await assert.rejects(db.transaction(sql=>sql.run("INSERT INTO categorias(ambito,nombre) VALUES ('PRODUCTO','No guardado')")),/Sin espacio/);
  const rows=await db.transaction(sql=>sql.query("SELECT * FROM categorias WHERE nombre='No guardado'"));
  assert.equal(rows.length,0);
});
