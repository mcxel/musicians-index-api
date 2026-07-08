"use client";
import {useEffect, useState} from 'react';

export function useHeartbeat(interval = 8000){
  const [data,setData] = useState<any>(null);
  const [count,setCount] = useState(0);
  useEffect(()=>{
    let mounted=true;
    async function tick(){
      try{
        const r = await fetch('/api/admin/health');
        if(!mounted) return;
        const j = await r.json();
        setData(j);
        setCount(c=>c+1);
      }catch(err){
        setData({status:'error',message: String(err)});
      }
    }
    tick();
    const id = setInterval(tick, interval);
    return ()=>{mounted=false;clearInterval(id)}
  },[interval]);
  return {data,count};
}

export default useHeartbeat;
