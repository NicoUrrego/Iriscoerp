import {useState} from 'react';
import {api,errorMessage} from '../api';
import {exportJson} from '../utils/export';
export default function Respaldo() {
  const [error,setError]=useState(''),[busy,setBusy]=useState(false);
  async function download(){setBusy(true);try{await exportJson('iris-sqlite-respaldo.json',await api('backup'));setError('');}catch(e){setError(errorMessage(e));}finally{setBusy(false);}}
  return <div className="p-4 md:p-8 max-w-7xl mx-auto"><h1>Respaldo</h1><section className="bg-white border border-border rounded-xl p-6 mt-6 space-y-4"><p>Exporta las tablas y la versión del esquema como JSON. En Android puedes guardar o compartir el archivo; en el navegador se descarga.</p><p>El archivo contiene datos personales y verificadores de contraseñas. Guárdalo protegido. Las sesiones no se exportan.</p><p>Esta versión permite exportar; todavía no incorpora restauración automática. No borres la instalación confiando en una restauración que no existe.</p>{error&&<p role="alert" className="text-red-600">{error}</p>}<button disabled={busy} onClick={download} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg">{busy?'Exportando…':'Exportar respaldo JSON'}</button></section></div>;
}
