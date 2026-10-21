import {useEffect,useState} from 'react';
import {api,errorMessage} from '../api';
import type {Analytics} from '../../backend';
export function useAnalytics(resource:string,period='mes') {
  const [data,setData]=useState<Analytics|null>(null),[error,setError]=useState('');
  useEffect(()=>{let active=true;setData(null);api<Analytics>(resource+'?periodo='+period).then(r=>{if(active){setData(r);setError('');}}).catch(e=>{if(active)setError(errorMessage(e));});return()=>{active=false;};},[resource,period]);
  return {data,error};
}
