import type {SqlJsStatic} from 'sql.js';
import { SqlJsDriver } from './sqljs';

export class BrowserSqliteDriver extends SqlJsDriver {
  private store?: Promise<IDBDatabase>;
  constructor(engine:()=>Promise<SqlJsStatic>,private readonly name='iris-sqlite-web-v1',private readonly locks:()=>LockManager|undefined=()=>navigator.locks) { super(engine); }
  private storage() {
    return this.store ??= new Promise<IDBDatabase>((resolve,reject)=>{
      const request=indexedDB.open(this.name,1);
      request.onupgradeneeded=()=>request.result.createObjectStore('files');
      request.onsuccess=()=>{request.result.onversionchange=()=>{request.result.close();this.store=undefined;};resolve(request.result);};
      request.onerror=()=>{this.store=undefined;reject(request.error);};
      request.onblocked=()=>{this.store=undefined;reject(new Error('Cierra otras pestañas de Iris para abrir la base'));};
    });
  }
  async exclusive<T>(work:()=>Promise<T>):Promise<T> {
    const manager=this.locks();
    if (!manager) throw new Error('Usa un navegador actualizado con Web Locks en localhost o HTTPS');
    return manager.request(this.name,work);
  }
  async refresh() {
    const db=await this.storage();
    const bytes=await new Promise<Uint8Array|undefined>((resolve,reject)=>{
      const tx=db.transaction('files','readonly'); const r=tx.objectStore('files').get('iris.sqlite');
      let result:Uint8Array|undefined;
      r.onsuccess=()=>{result=r.result as Uint8Array|undefined;};
      tx.oncomplete=()=>resolve(result); tx.onabort=()=>reject(tx.error); tx.onerror=()=>reject(tx.error);
    });
    this.database?.close(); this.database=new (await this.engine()).Database(bytes); await this.execute('PRAGMA foreign_keys=ON;');
  }
  async persist() {
    const db=await this.storage(),bytes=this.exportBytes();
    await new Promise<void>((resolve,reject)=>{
      const tx=db.transaction('files','readwrite'); tx.objectStore('files').put(bytes,'iris.sqlite');
      tx.oncomplete=()=>resolve(); tx.onabort=()=>reject(tx.error??new Error('No se guardó el archivo SQLite')); tx.onerror=()=>reject(tx.error);
    });
    // Export can reset SQLite connection pragmas; enforce them before the next operation too.
    await this.execute('PRAGMA foreign_keys=ON;');
  }
}
