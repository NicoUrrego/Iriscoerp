import type { SqlExecutor, SqlValue } from '../database/contracts';
import { fail } from '../domain/validation';
import type { Product,Material,FixedCost,Expense,Employee,Machine,Account } from '../domain/types';

export type Resource = 'productos'|'materiales'|'costos'|'gastos'|'empleados'|'maquinaria';
export const selects = {
  productos: `SELECT p.id,p.nombre,c.nombre AS categoria,p.precio_centavos/100.0 AS precio,p.costo_centavos/100.0 AS costoProduccion,p.descuento,p.stock FROM productos p JOIN categorias c ON c.id=p.categoria_id`,
  materiales: `SELECT m.id,m.nombre,c.nombre AS categoria,m.cantidad,m.unidad,m.stock_minimo AS stockMinimo,m.ultima_compra AS ultimaCompra FROM materiales m JOIN categorias c ON c.id=m.categoria_id`,
  costos: `SELECT f.id,f.concepto,c.nombre AS categoria,f.monto_centavos/100.0 AS monto,f.frecuencia,printf('%02d',f.dia_pago) AS fechaPago,f.inicio FROM costos_fijos f JOIN categorias c ON c.id=f.categoria_id`,
  gastos: `SELECT g.id,g.concepto,c.nombre AS categoria,g.monto_centavos/100.0 AS monto,g.fecha FROM gastos g JOIN categorias c ON c.id=g.categoria_id`,
  empleados: `SELECT e.id,e.nombre,e.rol,e.salario_centavos/100.0 AS salario,e.horario,e.telefono,e.correo AS email,e.fecha_ingreso AS fechaIngreso FROM empleados e`,
  maquinaria: `SELECT m.id,m.nombre,m.tipo,m.estado,m.ubicacion,t.ultima_fecha AS ultimoMantenimiento,t.proxima_fecha AS proximoMantenimiento,t.costo_centavos/100.0 AS costoMantenimiento FROM maquinaria m JOIN mantenimientos_maquinaria t ON t.maquinaria_id=m.id`,
} satisfies Record<Resource,string>;
export interface ResourceTypes { productos:Product; materiales:Material; costos:FixedCost; gastos:Expense; empleados:Employee; maquinaria:Machine }
const aliases:Record<Resource,string>={productos:'p',materiales:'m',costos:'f',gastos:'g',empleados:'e',maquinaria:'m'};
export const tables:Record<Resource,string>={productos:'productos',materiales:'materiales',costos:'costos_fijos',gastos:'gastos',empleados:'empleados',maquinaria:'maquinaria'};

export class CatalogRepository {
  constructor(private readonly sql:SqlExecutor) {}
  async list<K extends Resource>(kind:K,query=''):Promise<ResourceTypes[K][]> {
    const fields:Record<Resource,string[]>={productos:['p.nombre','c.nombre','p.id'],materiales:['m.nombre','c.nombre','m.id'],costos:['f.concepto','c.nombre','f.id'],gastos:['g.concepto','c.nombre','g.id'],empleados:['e.nombre','e.rol','e.correo','e.id'],maquinaria:['m.nombre','m.tipo','m.id']};
    const where=query?' WHERE '+fields[kind].map(column=>`LOWER(${column}) LIKE LOWER(?)`).join(' OR '):'';
    return this.sql.query<ResourceTypes[K]>(selects[kind]+where+` ORDER BY ${aliases[kind]}.rowid DESC`,query?fields[kind].map(()=>'%'+query+'%'):[]);
  }
  async get<K extends Resource>(kind:K,id:string):Promise<ResourceTypes[K]> {
    return (await this.sql.query<ResourceTypes[K]>(selects[kind]+` WHERE ${aliases[kind]}.id=?`,[id]))[0]??fail('Registro no encontrado',404);
  }
  async category(scope:string,name:string):Promise<number> {
    await this.sql.run('INSERT INTO categorias(ambito,nombre) VALUES (?,?) ON CONFLICT(ambito,nombre) DO NOTHING',[scope,name]);
    return (await this.sql.query<{id:number}>('SELECT id FROM categorias WHERE ambito=? AND nombre=?',[scope,name]))[0].id;
  }
  async save(table:string,id:string,fields:Record<string,SqlValue>,exists:boolean) {
    // Table/column names come exclusively from service constants, never from user input.
    const keys=Object.keys(fields),values=Object.values(fields);
    if (exists) await this.sql.run(`UPDATE ${table} SET ${keys.map(k=>`${k}=?`).join(',')} WHERE id=?`,[...values,id]);
    else await this.sql.run(`INSERT INTO ${table}(id,${keys.join(',')}) VALUES (${keys.map(()=>'?').join(',')},?)`,[id,...values]);
  }
  async remove(kind:Resource,id:string) { await this.sql.run(`DELETE FROM ${tables[kind]} WHERE id=?`,[id]); }
}
export const userSelect = `SELECT id,nombre_usuario AS username,correo AS email,rol AS role,salt,password_hash AS passwordHash FROM usuarios`;
export async function accountByName(sql:SqlExecutor,name:string):Promise<Account|undefined> { return (await sql.query<Account>(userSelect+' WHERE nombre_usuario=? COLLATE NOCASE',[name]))[0]; }
