import type { SqlDatabase } from '../database/database';
import { permissions,type Module } from '../domain/types';
import { object,fail } from '../domain/validation';
import { digest } from './crypto';
import { AuthService,requireUser } from './auth.service';
import { CatalogService } from './catalog.service';
import { OrdersService } from './orders.service';
import { AnalyticsService } from './analytics.service';
import { CatalogRepository,type Resource } from '../repositories/catalog.repository';

export class ErpService {
  private auth:AuthService;
  constructor(private readonly db:SqlDatabase) {this.auth=new AuthService(db);}
  async request(path:string,method='GET',body?:unknown,token=''):Promise<unknown> {
    const url=new URL(path,'https://iris.local/'),[kind,id,extra]=url.pathname.split('/').filter(Boolean);
    if (!kind||extra) fail('Ruta no encontrada',404);
    if (!['GET','POST','PUT','PATCH','DELETE'].includes(method)) fail('Método no permitido',405);
    const b=body===undefined?{}:object(body),hash=token?await digest(token):'';
    if (kind==='auth'&&method==='GET'&&id==='setup') return this.auth.setup();
    if (kind==='auth'&&method==='POST'&&id==='register') return this.auth.register(b,hash);
    if (kind==='auth'&&method==='POST'&&id==='login') return this.auth.login(b);
    return this.db.transaction(async sql=>{
      const user=await requireUser(sql,hash);
      if (kind==='auth') {
        if (id==='me'&&method==='GET') return {user,modules:permissions[user.role]};
        if (id==='logout'&&method==='POST') {await sql.run('DELETE FROM sesiones WHERE token_hash=?',[hash]);return {ok:true};}
        fail('Ruta de autenticación no encontrada',404);
      }
      if (!permissions[user.role].includes(kind as Module)) fail('No tienes permiso para este módulo',403);
      if (kind==='productos'&&user.role==='VENTAS'&&method!=='GET') fail('Productos de solo lectura para VENTAS',403);
      if (kind==='usuarios'&&method==='GET'&&!id) return sql.query('SELECT id,nombre_usuario AS username,correo AS email,rol AS role FROM usuarios ORDER BY creado_en');
      if (kind==='backup'&&method==='GET'&&!id) {
        const names=['schema_migrations','usuarios','categorias','productos','materiales','clientes','pedidos','detalle_pedido','costos_fijos','gastos','empleados','maquinaria','mantenimientos_maquinaria','eventos_stock','eventos_pedidos'];
        const tables:Record<string,unknown[]>={}; for (const table of names) tables[table]=await sql.query(`SELECT * FROM ${table}`);
        return {format:'iris-sqlite-backup',version:1,exportedAt:new Date().toISOString(),tables};
      }
      if (['dashboard','finanzas','reportes'].includes(kind)&&method==='GET'&&!id) return new AnalyticsService(sql).summary(url.searchParams);
      if (kind==='pedidos') return new OrdersService(sql,user.id).request(id,method,b,url.searchParams.get('q')??'');
      if (kind==='materiales'&&id==='alertas'&&method==='GET') return (await new CatalogRepository(sql).list('materiales')).filter(m=>m.cantidad<m.stockMinimo);
      if (['productos','materiales','costos','gastos','empleados','maquinaria'].includes(kind)) return new CatalogService(sql,user.id).request(kind as Resource,id,method,b,url.searchParams.get('q')??'');
      fail('Ruta no encontrada',404);
    });
  }
}
