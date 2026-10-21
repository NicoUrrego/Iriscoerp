import { getBackend } from '../backend';
import { DomainError } from '../backend/domain/validation';
import type { Session } from '../backend';
export type { Session,User,Module } from '../backend';
let token=sessionStorage.getItem('iris.sqlite.token')??'';
export async function api<T=unknown>(path:string,method='GET',body?:unknown):Promise<T> {
  try { return await (await getBackend()).request(path,method,body,token) as T; }
  catch(error) { if (error instanceof DomainError&&error.status===401&&!path.startsWith('auth/')) window.dispatchEvent(new Event('iris:session-expired')); throw error; }
}
export async function login(username:string,password:string):Promise<Session> {
  const session=await api<Session>('auth/login','POST',{username,password});
  token=session.token;sessionStorage.setItem('iris.sqlite.token',token);return session;
}
export async function logout() {
  try {await api('auth/logout','POST');}finally{token='';sessionStorage.removeItem('iris.sqlite.token');}
}
export const errorMessage=(error:unknown)=>error instanceof Error?error.message:'No se pudo completar la operación';
