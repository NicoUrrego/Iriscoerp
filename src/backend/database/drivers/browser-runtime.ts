import initSqlJs from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import {BrowserSqliteDriver} from './browser';
let engine:ReturnType<typeof initSqlJs>|undefined;
export const createBrowserDriver=(name?:string)=>new BrowserSqliteDriver(()=>engine??=initSqlJs({locateFile:()=>wasmUrl}),name);
