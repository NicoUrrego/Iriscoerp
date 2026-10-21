import {Capacitor} from '@capacitor/core';
export async function exportJson(name:string,data:unknown) {
  const content=JSON.stringify(data,null,2);
  if(Capacitor.isNativePlatform()) {
    const [{Filesystem,Directory,Encoding},{Share}]=await Promise.all([import('@capacitor/filesystem'),import('@capacitor/share')]);
    const file=await Filesystem.writeFile({path:name,data:content,directory:Directory.Cache,encoding:Encoding.UTF8});
    await Share.share({title:'Exportación Iris ERP',url:file.uri,dialogTitle:'Guardar o compartir archivo'});
  } else {
    const url=URL.createObjectURL(new Blob([content],{type:'application/json'}));
    const anchor=document.createElement('a');anchor.href=url;anchor.download=name;anchor.click();
    setTimeout(()=>URL.revokeObjectURL(url),30000);
  }
}
