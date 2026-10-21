import { useCallback,useEffect,useRef,useState } from 'react';
import { api,errorMessage } from '../api';
import { toast } from 'sonner';

export function useRecords<T extends {id:string}>(resource:string) {
  const [records,setRecords]=useState<T[]>([]),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const pending=useRef(false);
  const reload=useCallback(async()=>{const rows=await api<T[]>(resource);setRecords(rows);setError('');},[resource]);
  useEffect(()=>{let active=true;setLoading(true);api<T[]>(resource).then(rows=>{if(active){setRecords(rows);setError('');}}).catch(e=>{if(active)setError(errorMessage(e));}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[resource]);
  const save=async(body:unknown,id?:string):Promise<boolean>=>{
    if(pending.current)return false;pending.current=true;
    setBusy(true);try{const record=await api<T>(resource+(id?'/'+id:''),id?'PUT':'POST',body);setRecords(rows=>id?rows.map(row=>row.id===id?record:row):[record,...rows]);setError('');toast.success('Registro guardado');return true;}
    catch(e){setError(errorMessage(e));toast.error(errorMessage(e));return false;}finally{pending.current=false;setBusy(false);}
  };
  const remove=async(id:string):Promise<boolean>=>{
    if(pending.current)return false;
    if(!window.confirm('¿Eliminar este registro?'))return false;
    pending.current=true;
    setBusy(true);try{await api(resource+'/'+id,'DELETE');setRecords(rows=>rows.filter(row=>row.id!==id));setError('');toast.success('Registro eliminado');return true;}
    catch(e){setError(errorMessage(e));toast.error(errorMessage(e));return false;}finally{pending.current=false;setBusy(false);}
  };
  return {records,loading,busy,error,reload,save,remove};
}
