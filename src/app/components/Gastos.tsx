import {useState,type FormEvent} from 'react';
import {Plus,Edit2,Trash2,X} from 'lucide-react';
import {useRecords} from '../hooks/useRecords';
import type {Expense} from '../../backend';
import {today} from '../../backend/domain/validation';

export default function Gastos() {
  const {records,save,remove,busy,error,loading}=useRecords<Expense>('gastos');
  const [editing,setEditing]=useState(''),[open,setOpen]=useState(false);
  const [form,setForm]=useState({concepto:'',categoria:'Materias primas',monto:'',fecha:today()});
  const edit=(r?:Expense)=>{setEditing(r?.id??'');setForm(r?{...r,monto:String(r.monto)}:{concepto:'',categoria:'Materias primas',monto:'',fecha:today()});setOpen(true);};
  async function submit(e:FormEvent){e.preventDefault();if(await save({...form,monto:Number(form.monto)},editing||undefined))setOpen(false);}
  return <div className="p-4 md:p-8 max-w-7xl mx-auto">
    <div className="flex items-center justify-between mb-6"><div><h1>Gastos</h1><p className="text-muted-foreground">Compra de materiales, mano de obra y otros gastos reales</p></div><button disabled={busy} onClick={()=>edit()} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex gap-2"><Plus size={18}/>Nuevo gasto</button></div>
    {loading&&<p role="status">Cargando gastos…</p>}{error&&<p role="alert" className="p-3 bg-red-50 text-red-700">{error}</p>}
    <p className="mb-4">Los costos fijos se calculan desde su propio módulo; evita registrarlos de nuevo aquí.</p>
    <div className="space-y-3">{records.map(r=><article key={r.id} className="bg-white border border-border rounded-xl p-5 flex flex-wrap items-center justify-between gap-4"><div><h3>{r.concepto}</h3><p className="text-sm text-muted-foreground">{r.fecha} · {r.categoria}</p></div><strong>${r.monto.toLocaleString('es-CO')}</strong><div className="flex gap-3"><button aria-label={'Editar '+r.concepto} disabled={busy} onClick={()=>edit(r)}><Edit2 size={18}/></button><button aria-label={'Eliminar '+r.concepto} disabled={busy} onClick={()=>remove(r.id)} className="text-red-600"><Trash2 size={18}/></button></div></article>)}</div>
    {!loading&&!records.length&&<p>No hay gastos registrados.</p>}
    {open&&<div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4"><form onSubmit={submit} className="bg-white rounded-xl p-6 w-full max-w-md space-y-4"><div className="flex justify-between"><h2>{editing?'Editar gasto':'Nuevo gasto'}</h2><button type="button" onClick={()=>setOpen(false)} aria-label="Cerrar"><X/></button></div>{error&&<p role="alert" className="text-red-600">{error}</p>}
      <label className="block">Concepto<input required value={form.concepto} onChange={e=>setForm({...form,concepto:e.target.value})} className="w-full p-2 border border-border rounded-lg mt-1"/></label>
      <label className="block">Categoría<select value={form.categoria} onChange={e=>setForm({...form,categoria:e.target.value})} className="w-full p-2 border border-border rounded-lg mt-1">{['Materias primas','Mano de obra','Otros'].map(c=><option key={c}>{c}</option>)}</select></label>
      <label className="block">Monto<input required type="number" min="0.01" step="0.01" value={form.monto} onChange={e=>setForm({...form,monto:e.target.value})} className="w-full p-2 border border-border rounded-lg mt-1"/></label>
      <label className="block">Fecha<input required type="date" value={form.fecha} onChange={e=>setForm({...form,fecha:e.target.value})} className="w-full p-2 border border-border rounded-lg mt-1"/></label>
      <button disabled={busy} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg">Guardar</button>
    </form></div>}
  </div>;
}
