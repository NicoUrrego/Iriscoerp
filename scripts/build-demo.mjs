import {spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, copyFileSync, readFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const env={...process.env,IRIS_DEMO:'true'};
if (process.platform==='win32' && existsSync('C:/Program Files/Android/Android Studio/jbr/bin/java.exe')) {
  env.JAVA_HOME='C:/Program Files/Android/Android Studio/jbr';
  const pathKey=Object.keys(env).find(key=>key.toLowerCase()==='path')??'PATH';
  env[pathKey]=env.JAVA_HOME+'/bin;'+(env[pathKey]??'');
}
function run(command,args,cwd=root) {
  const result=spawnSync(command,args,{cwd,env,stdio:'inherit'});
  if(result.error)throw result.error;
  if(result.status!==0)process.exit(result.status??1);
}
run(process.execPath,[resolve(root,'node_modules/vite/bin/vite.js'),'build','--mode','demo']);
const cap=JSON.parse(readFileSync(resolve(root,'node_modules/@capacitor/cli/package.json'),'utf8'));
run(process.execPath,[resolve(root,'node_modules/@capacitor/cli',typeof cap.bin==='string'?cap.bin:cap.bin.cap),'sync','android']);
if(process.platform==='win32')run(env.ComSpec??resolve(env.SystemRoot??'C:/Windows','System32/cmd.exe'),['/d','/s','/c','gradlew.bat assembleDebug -PirisDemo=true --no-daemon'],resolve(root,'android'));
else run('./gradlew',['assembleDebug','-PirisDemo=true','--no-daemon'],resolve(root,'android'));
const output=resolve(root,'releases/Iris-ERP-SQLite-Demo.apk');
mkdirSync(dirname(output),{recursive:true});
copyFileSync(resolve(root,'android/app/build/outputs/apk/debug/app-debug.apk'),output);
console.log('\nAPK demo: '+output);
