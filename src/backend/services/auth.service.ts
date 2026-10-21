import type { SqlDatabase } from '../database/database';
import type { SqlExecutor } from '../database/contracts';
import { permissions,type User,type Account,type Role } from '../domain/types';
import { text,email,password,choice,fail,object } from '../domain/validation';
import { derive,digest,equal,randomHex } from './crypto';
import { accountByName,userSelect } from '../repositories/catalog.repository';

export const publicUser=(u:Account):User=>({id:u.id,username:u.username,email:u.email,role:u.role});
export async function requireUser(sql:SqlExecutor,hash:string):Promise<User> {
  const rows=await sql.query<User>(`SELECT u.id,u.nombre_usuario AS username,u.correo AS email,u.rol AS role FROM usuarios u JOIN sesiones s ON s.usuario_id=u.id WHERE s.token_hash=? AND s.vence_en>?`,[hash,Date.now()]);
  return rows[0]??fail('Sesión requerida o vencida',401);
}
export class AuthService {
  constructor(private readonly db:SqlDatabase) {}
  async setup() { return this.db.transaction(async sql=>({required:(await sql.query<{n:number}>('SELECT COUNT(*) AS n FROM usuarios'))[0].n===0})); }
  async register(body:unknown,hash:string) {
    const b=object(body),username=text(b.username,'usuario'),mail=email(b.email),pass=password(b.password);
    const salt=randomHex(16),passwordHash=await derive(pass,salt);
    return this.db.transaction(async sql=>{
      const first=(await sql.query<{n:number}>('SELECT COUNT(*) AS n FROM usuarios'))[0].n===0;
      if (!first && (await requireUser(sql,hash)).role!=='ADMIN') fail('Solo ADMIN puede crear cuentas',403);
      const role=choice<Role>(b.role??(first?'ADMIN':'VENTAS'),['ADMIN','VENTAS','INVENTARIO'],'rol');
      if (first && role!=='ADMIN') fail('La primera cuenta debe ser ADMIN');
      if ((await sql.query('SELECT id FROM usuarios WHERE nombre_usuario=? COLLATE NOCASE OR correo=? COLLATE NOCASE',[username,mail])).length) fail('El usuario o correo ya existe',409);
      const u:User={id:crypto.randomUUID(),username,email:mail,role};
      await sql.run('INSERT INTO usuarios VALUES (?,?,?,?,?,?,?)',[u.id,username,mail,role,salt,passwordHash,new Date().toISOString()]);
      return u;
    });
  }
  async login(body:unknown) {
    const b=object(body),username=text(b.username,'usuario'),pass=password(b.password),now=Date.now();
    const lookup=await this.db.transaction(async sql=>{
      const previous=(await sql.query<{cantidad:number;hasta:number}>('SELECT cantidad,hasta FROM login_intentos WHERE id=1'))[0];
      if (previous && previous.hasta>now && previous.cantidad>=10) return {blocked:true,account:undefined};
      const count=previous && previous.hasta>now ? previous.cantidad+1:1,until=previous && previous.hasta>now ? previous.hasta:now+60000;
      await sql.run('INSERT INTO login_intentos VALUES (1,?,?) ON CONFLICT(id) DO UPDATE SET cantidad=excluded.cantidad,hasta=excluded.hasta',[count,until]);
      return {blocked:false,account:await accountByName(sql,username)};
    });
    if (lookup.blocked) fail('Demasiados intentos; espera un minuto',429);
    const computed=await derive(pass,lookup.account?.salt??'invalid-salt');
    if (!lookup.account || !equal(computed,lookup.account.passwordHash)) fail('Credenciales inválidas',401);
    const token=randomHex(32),hash=await digest(token),account=lookup.account;
    return this.db.transaction(async sql=>{
      const current=(await sql.query<Account>(userSelect+' WHERE id=?',[account.id]))[0];
      if (!current || current.passwordHash!==account.passwordHash) fail('La cuenta ha cambiado; inicia sesión otra vez',401);
      await sql.run('DELETE FROM sesiones WHERE vence_en<=?',[Date.now()]);
      await sql.run('INSERT INTO sesiones VALUES (?,?,?)',[hash,account.id,Date.now()+8*3600000]);
      await sql.run('DELETE FROM login_intentos WHERE id=1');
      return {token,user:publicUser(current),modules:permissions[current.role]};
    });
  }
}
