import { Capacitor } from '@capacitor/core';
import schema from '../database/schema.sql?raw';
import seed from '../database/seed.sql?raw';
import { SqlDatabase } from './database/database';
import { ErpService } from './services/erp.service';

let instance:Promise<ErpService>|undefined;
export function getBackend():Promise<ErpService> {
  return instance ??= (async()=>{
    const demo=import.meta.env.MODE==='demo';
    const driver=Capacitor.isNativePlatform()
      ? new (await import('./database/drivers/native')).NativeSqliteDriver()
      : (await import('./database/drivers/browser-runtime')).createBrowserDriver(demo?'iris-sqlite-demo-web-v1':undefined);
    const db=new SqlDatabase(driver,[{version:1,sql:schema+'\n'+seed}]);
    if (demo) await (await import('./demo/seed')).seedDemo(db);
    return new ErpService(db);
  })().catch(error=>{instance=undefined;throw error;});
}
export type * from './domain/types';
