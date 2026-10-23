"use client";
import {useCallback,useEffect,useState} from "react";
type OfflineBridge={getStatus:()=>Promise<{lastSyncedAt:string|null;pendingCount:number}>;listHorses:()=>Promise<Record<string,unknown>>};
declare global {interface Window{atcylykOffline?:OfflineBridge}}
export default function DesktopOfflineHorses(){
 const [present,setPresent]=useState(false),[error,setError]=useState("");
 const [items,setItems]=useState<Array<{id:string;name:string;code:string}>>([]);
 const [pending,setPending]=useState<number|null>(null),[loading,setLoading]=useState(false);
 const refresh=useCallback(async()=>{
  const bridge=window.atcylykOffline;
  if(!bridge)return;
  setLoading(true);setError("");
  try{
   const [state,horses]=await Promise.all([bridge.getStatus(),bridge.listHorses()]);
   if(!horses||typeof horses!=="object"||Array.isArray(horses))throw Error("Invalid offline catalog");
   setItems(Object.entries(horses).map(([id,horse])=>{
    const record=horse&&typeof horse==="object"&&!Array.isArray(horse)?horse as Record<string,unknown>:{};
    return {id,name:typeof record.name==="string"?record.name:id,code:typeof record.code==="string"?record.code:""};
   }));
   setPending(state.pendingCount);
  }catch{setItems([]);setPending(null);setError("Offline ammary açmak başartmady. Ilki Windows girişini barlaň.");}
  finally{setLoading(false);}
 },[]);
 useEffect(()=>{setPresent(Boolean(window.atcylykOffline));},[]);
 if(!present)return null;
 return <section className="mb-6 rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
  <div className="flex flex-wrap items-center justify-between gap-3">
   <div><h2 className="text-lg font-semibold text-emerald-950">Şifrlenen offline atlar</h2>
    <p className="text-sm text-gray-600">Diňe okamak üçin. Aşakdaky ýerli brauzer katalogy bilen garyşdyrylmaýar.</p></div>
   <button type="button" disabled={loading} onClick={refresh} className="rounded-lg bg-emerald-800 px-4 py-2 text-sm text-white disabled:opacity-50">{loading?"Okalýar…":"Offline maglumatlary görkez"}</button>
  </div>
  {error&&<p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
  {pending!==null&&<><p className="mt-3 text-sm text-gray-700">Atlar: {items.length} · Sinhronlaşmaga garaşýan üýtgeşmeler: {pending}</p>
   <ul className="mt-3 divide-y">{items.map(item=><li key={item.id} className="py-2 text-sm"><strong>{item.name}</strong>{item.code? <span className="ml-2 text-gray-600">{item.code}</span>:null}</li>)}</ul>
   {items.length===0&&<p className="mt-2 text-sm text-gray-600">Offline ammarda at ýok.</p>}</>}
 </section>;
}
