import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import initSqlJs from 'sql.js';
import {SqlJsDriver} from '../src/backend/database/drivers/sqljs';
import {SqlDatabase} from '../src/backend/database/database';
import {ErpService} from '../src/backend/services/erp.service';
import {seedDemo,DEMO_PASSWORD} from '../src/backend/demo/seed';
import type {Analytics,Session} from '../src/backend/domain/types';

const engine=initSqlJs({locateFile:name=>resolve('node_modules/sql.js/dist',name)});
const schema=await readFile(new URL('../src/database/schema.sql',import.meta.url),'utf8');
const seed=await readFile(new URL('../src/database/seed.sql',import.meta.url),'utf8');
function make(bytes?:Uint8Array) {
  const driver=new SqlJsDriver(()=>engine,bytes);
  const db=new SqlDatabase(driver,[{version:1,sql:schema+'\n'+seed}]);
  return {driver,db,erp:new ErpService(db)};
}
test('demo completa: seis meses, stock consistente, credenciales y permisos',async()=>{
  const {db,erp}=make();
  assert.equal(await seedDemo(db,'2026-10-20'),true);
  const counts=await db.transaction(async sql=>{
    const result:Record<string,number>={};
    for(const name of ['usuarios','productos','materiales','pedidos','gastos','costos_fijos','empleados','maquinaria']) {
      result[name]=(await sql.query<{n:number}>(`SELECT COUNT(*) AS n FROM ${name}`))[0].n;
    }
    const totals=(await sql.query<{stock:number;events:number}>('SELECT (SELECT SUM(stock) FROM productos) AS stock,(SELECT SUM(delta) FROM eventos_stock) AS events'))[0];
    assert.equal(totals.stock,totals.events);
    assert.equal((await sql.query('PRAGMA foreign_key_check')).length,0);
    assert.equal((await sql.query("SELECT id FROM pedidos WHERE estado<>'Completado'")).length,2);
    return result;
  });
  assert.deepEqual(counts,{usuarios:3,productos:6,materiales:8,pedidos:24,gastos:18,costos_fijos:4,empleados:4,maquinaria:3});
  const session=await erp.request('auth/login','POST',{username:'admin.demo',password:DEMO_PASSWORD}) as Session;
  const analytics=await erp.request('reportes?hasta=2026-10-20','GET',undefined,session.token) as Analytics;
  assert.equal(analytics.meses.length,6);
  assert.ok(analytics.meses.every(m=>m.ingresos>0 && m.gastos>0));
  assert.equal(analytics.bajoStock.length,3);
  assert.equal(analytics.pedidosActivos,2);
  for(const username of ['ventas.demo','inventario.demo']) {
    const role=await erp.request('auth/login','POST',{username,password:DEMO_PASSWORD}) as Session;
    await assert.rejects(erp.request('backup','GET',undefined,role.token),/permiso/);
  }
});
test('demo no duplica ni repone registros eliminados al reabrir',async()=>{
  const {db,driver}=make();
  await seedDemo(db,'2026-10-20');
  await db.transaction(sql=>sql.run('DELETE FROM materiales WHERE id=(SELECT id FROM materiales LIMIT 1)'));
  const reopened=make(driver.exportBytes());
  assert.equal(await seedDemo(reopened.db,'2026-11-20'),false);
  const rows=await reopened.db.transaction(sql=>sql.query<{n:number}>('SELECT COUNT(*) AS n FROM materiales'));
  assert.equal(rows[0].n,7);
});
test('demo no agrega datos a una instalación que ya tenga cuentas',async()=>{
  const {db,erp}=make();
  await erp.request('auth/register','POST',{username:'propietario',email:'owner@example.com',password:'Password123!',role:'ADMIN'});
  assert.equal(await seedDemo(db),false);
  const rows=await db.transaction(sql=>sql.query<{n:number}>('SELECT COUNT(*) AS n FROM productos'));
  assert.equal(rows[0].n,0);
});
test('un fallo intermedio revierte la carga demo completa y permite reintentar',async()=>{
  class FailingDriver extends SqlJsDriver {
    fail=true;
    override async run(sql:string,values?:Parameters<SqlJsDriver['run']>[1]) {
      if(this.fail && sql.startsWith('INSERT INTO gastos'))throw new Error('Fallo de almacenamiento simulado');
      return super.run(sql,values);
    }
  }
  const driver=new FailingDriver(()=>engine);
  const db=new SqlDatabase(driver,[{version:1,sql:schema+'\n'+seed}]);
  await assert.rejects(seedDemo(db,'2026-10-20'),/simulado/);
  const rows=await db.transaction(sql=>sql.query<{n:number}>('SELECT COUNT(*) AS n FROM usuarios'));
  assert.equal(rows[0].n,0);
  driver.fail=false;
  assert.equal(await seedDemo(db,'2026-10-20'),true);
});
