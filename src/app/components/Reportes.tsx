import {useState} from 'react';
import {Download} from 'lucide-react';
import {LineChart,Line,BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer} from 'recharts';
import {useAnalytics} from '../hooks/useAnalytics';
import {errorMessage} from '../api';
import {exportJson} from '../utils/export';

export default function Reportes() {
  const [period,setPeriod]=useState('mes'),[exportError,setExportError]=useState('');
  const {data,error}=useAnalytics('reportes',period);
  async function download(){try{await exportJson('iris-reporte.json',data);setExportError('');}catch(e){setExportError(errorMessage(e));}}
  if(error)return <p role="alert" className="p-8 text-red-700">{error}</p>;
  if(!data)return <p role="status" className="p-8">Generando reportes SQL…</p>;
  const money=(n:number)=>'$'+n.toLocaleString('es-CO',{maximumFractionDigits:2});
  const metrics=[['Ingresos',money(data.ingresos)],['Costo de producción vendido',money(data.costoProduccion)],['Utilidad bruta',money(data.utilidadBruta)],['Productividad ingreso / costo',data.productividad===null?'Sin base de costo':data.productividad.toFixed(2)],['Crecimiento de ingresos',data.crecimiento===null?'Sin base anterior':data.crecimiento.toFixed(1)+'%'],['Unidades vendidas',String(data.unidadesVendidas)]];
  return <div className="p-4 md:p-8 max-w-7xl mx-auto">
    <div className="flex flex-wrap gap-4 items-center justify-between mb-6"><div><h1>Reportes</h1><p className="text-muted-foreground">Productividad y crecimiento calculados desde SQLite</p></div><button onClick={download} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex gap-2"><Download size={18}/>Exportar JSON</button></div>
    <div className="flex gap-2 mb-6">{[['mes','Mes'],['trimestre','Trimestre'],['ano','Año']].map(([id,label])=><button key={id} onClick={()=>setPeriod(id)} className={'px-4 py-2 rounded-lg '+(period===id?'bg-primary text-primary-foreground':'bg-white border border-border')}>{label}</button>)}</div>
    {exportError&&<p role="alert" className="p-3 text-red-600">{exportError}</p>}<p className="mb-4 text-muted-foreground">{data.desde} — {data.hasta}</p>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">{metrics.map(([label,value])=><article key={label} className="bg-white border border-border rounded-xl p-6"><p className="text-sm text-muted-foreground mb-2">{label}</p><p className="text-2xl">{value}</p></article>)}</div>
    <div className="grid lg:grid-cols-2 gap-6 mb-6">
      <section className="bg-white border border-border rounded-xl p-6"><h3 className="mb-6">Ingresos y gastos de los últimos seis meses</h3><ResponsiveContainer width="100%" height={280}><LineChart data={data.meses}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="mes"/><YAxis/><Tooltip/><Line dataKey="ingresos" stroke="#10b981"/><Line dataKey="gastos" stroke="#ef4444"/></LineChart></ResponsiveContainer></section>
      <section className="bg-white border border-border rounded-xl p-6"><h3 className="mb-6">Unidades vendidas por producto del periodo</h3><ResponsiveContainer width="100%" height={280}><BarChart data={data.productosMasVendidos}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="nombre"/><YAxis/><Tooltip/><Bar dataKey="cantidad" fill="#3b82f6" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></section>
    </div>
    <section className="bg-white border border-border rounded-xl p-6 overflow-auto"><h3 className="mb-4">Rentabilidad por producto vendido</h3><table className="w-full text-left"><thead><tr><th className="p-3">Producto</th><th className="p-3">Unidades</th><th className="p-3">Ingresos</th><th className="p-3">Costo</th><th className="p-3">Utilidad bruta</th></tr></thead><tbody>{data.productosMasVendidos.map(p=><tr key={p.nombre} className="border-t border-border"><td className="p-3">{p.nombre}</td><td className="p-3">{p.cantidad}</td><td className="p-3">{money(p.ingresos)}</td><td className="p-3">{money(p.costo)}</td><td className="p-3">{money(p.ingresos-p.costo)}</td></tr>)}</tbody></table>{!data.productosMasVendidos.length&&<p>No hay ventas completadas en este periodo.</p>}</section>
    <p className="text-sm text-muted-foreground mt-4">Productividad = ingresos / costo de producción vendido. El crecimiento compara el periodo actual hasta hoy con el periodo calendario anterior completo.</p>
  </div>;
}
