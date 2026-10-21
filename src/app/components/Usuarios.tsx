import {useEffect,useState,type FormEvent} from 'react';
import {api,errorMessage} from '../api';
import type {User} from '../../backend';
export default function Usuarios() {
  const [rows,setRows]=useState<User[]>([]),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  const [form,setForm]=useState({username:'',email:'',password:'',role:'VENTAS'});
  const load=()=>api<User[]>('usuarios').then(setRows);
  useEffect(()=>{load().catch(e=>setError(errorMessage(e)));},[]);
  async function submit(e:FormEvent){e.preventDefault();setBusy(true);try{await api('auth/register','POST',form);await load();setForm({username:'',email:'',password:'',role:'VENTAS'});setError('');}catch(e){setError(errorMessage(e));}finally{setBusy(false);}}
  return <div className="p-4 md:p-8 max-w-7xl mx-auto"><h1>Usuarios</h1><p className="text-muted-foreground mb-6">Cuentas y permisos de esta instalación</p>
    <form onSubmit={submit} className="bg-white border border-border rounded-xl p-6 mb-6 space-y-4"><h2>Crear cuenta</h2>{error&&<p role="alert" className="text-red-600">{error}</p>}<div className="grid sm:grid-cols-2 gap-4">
      <label>Usuario<input required value={form.username} onChange={e=>setForm({...form,username:e.target.value})} className="block w-full p-2 border border-border rounded-lg mt-1"/></label>
      <label>Correo<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="block w-full p-2 border border-border rounded-lg mt-1"/></label>
      <label>Contraseña<input required type="password" minLength={8} maxLength={256} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className="block w-full p-2 border border-border rounded-lg mt-1"/></label>
      <label>Rol<select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} className="block w-full p-2 border border-border rounded-lg mt-1">{['ADMIN','VENTAS','INVENTARIO'].map(r=><option key={r}>{r}</option>)}</select></label>
    </div><button disabled={busy} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg">{busy?'Creando…':'Crear usuario'}</button></form>
    <div className="space-y-3">{rows.map(r=><div key={r.id} className="bg-white border border-border rounded-xl p-4"><strong>{r.username}</strong><p>{r.email} · {r.role}</p></div>)}</div>
  </div>;
}
