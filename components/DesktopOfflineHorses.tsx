"use client";
import {useCallback,useEffect,useState,type FormEvent} from "react";
type OfflineBridge={getStatus:()=>Promise<{lastSyncedAt:string|null;pendingCount:number}>;listHorses:()=>Promise<Record<string,unknown>>;listHorseVersions:()=>Promise<Record<string,number>>;createHorse:(id:string,payload:{name:string;code:string})=>Promise<{changeId:string}>;updateHorse:(id:string,baseVersion:number,payload:{name:string;code:string})=>Promise<{changeId:string}>;deleteHorse:(id:string,baseVersion:number)=>Promise<{changeId:string}>};
declare global {interface Window{atcylykOffline?:OfflineBridge}}
export default function DesktopOfflineHorses(){
 const [present,setPresent]=useState(false),[error,setError]=useState("");
 const [name,setName]=useState(""),[code,setCode]=useState("");
 const [items,setItems]=useState<Array<{id:string;name:string;code:string;version?:number}>>([]);
 const [pending,setPending]=useState<number|null>(null),[loading,setLoading]=useState(false);
 const [busyCreate,setBusyCreate]=useState(false);
 const refresh=useCallback(async()=>{
  const bridge=window.atcylykOffline;
  if(!bridge)return;
  setLoading(true);setError("");
  try{
   const [state,horses,versions]=await Promise.all([bridge.getStatus(),bridge.listHorses(),bridge.listHorseVersions()]);
   if(!horses||typeof horses!=="object"||Array.isArray(horses))throw Error("Invalid offline catalog");
   setItems(Object.entries(horses).map(([id,horse])=>{
    const record=horse&&typeof horse==="object"&&!Array.isArray(horse)?horse as Record<string,unknown>:{};
    return {id,name:typeof record.name==="string"?record.name:id,code:typeof record.code==="string"?record.code:"",version:Number.isSafeInteger(versions[id])?versions[id]:undefined};
   }));
   setPending(state.pendingCount);
  }catch{setItems([]);setPending(null);setError("Offline ammary açmak başartmady. Ilki Windows girişini barlaň.");}
  finally{setLoading(false);}
 },[]);
 useEffect(()=>{setPresent(Boolean(window.atcylykOffline));},[]);
 async function createHorse(event:FormEvent<HTMLFormElement>){
  event.preventDefault();const bridge=window.atcylykOffline;
  if(!bridge||!name.trim()||busyCreate)return;
  setBusyCreate(true);setError("");
  try{await bridge.createHorse(crypto.randomUUID(),{name:name.trim(),code:code.trim()});setName("");setCode("");await refresh();}
  catch{setError("At döretmek başartmady. Rugsatlary we giriş sessiýasyny barlaň.");}
  finally{setBusyCreate(false);}
 }
 async function editOrDelete(item:{id:string;name:string;code:string;version?:number},action:"update"|"delete"){
  const bridge=window.atcylykOffline;if(!bridge||!item.version||busyCreate)return;
  let name=item.name;
  if(action==="update"){const answer=window.prompt("Atyň täze ady",item.name);if(answer===null||!answer.trim())return;name=answer.trim();}
  else if(!window.confirm(`"${item.name}" atly aty pozmalymy?`))return;
  setBusyCreate(true);setError("");
  try{if(action==="update")await bridge.updateHorse(item.id,item.version,{name,code:item.code});else await bridge.deleteHorse(item.id,item.version);await refresh();}
  catch{setError("Üýtgeşme başartmady. Serwer wersiýasyny we garaşýan üýtgeşmeleri barlaň.");}
  finally{setBusyCreate(false);}
 }
 if(!present)return null;
 return <section className="mb-6 rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
  <div className="flex flex-wrap items-center justify-between gap-3">
   <div><h2 className="text-lg font-semibold text-emerald-950">Şifrlenen offline atlar</h2>
    <p className="text-sm text-gray-600">Şifrlenen ammar. Üýtgeşmeler nobata ýazylýar; aşakdaky brauzer katalogyndan aýratyn saklanýar.</p></div>
   <button type="button" disabled={loading} onClick={refresh} className="rounded-lg bg-emerald-800 px-4 py-2 text-sm text-white disabled:opacity-50">{loading?"Okalýar…":"Offline maglumatlary görkez"}</button>
  </div>
  <form onSubmit={createHorse} className="mt-4 flex flex-wrap items-end gap-2">
   <label className="text-sm">Atyň ady<input required maxLength={160} value={name} onChange={event=>setName(event.target.value)} className="mt-1 block rounded-lg border p-2"/></label>
   <label className="text-sm">Belgisi<input maxLength={80} value={code} onChange={event=>setCode(event.target.value)} className="mt-1 block rounded-lg border p-2"/></label>
   <button type="submit" disabled={busyCreate} className="rounded-lg bg-emerald-800 px-4 py-2 text-white disabled:opacity-50">Offline at goş</button>
  </form>
  {error&&<p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
  {pending!==null&&<><p className="mt-3 text-sm text-gray-700">Atlar: {items.length} · Sinhronlaşmaga garaşýan üýtgeşmeler: {pending}</p>
   <ul className="mt-3 divide-y">{items.map(item=><li key={item.id} className="py-2 text-sm"><strong>{item.name}</strong>{item.code? <span className="ml-2 text-gray-600">{item.code}</span>:null} {item.version?<span className="ml-2 text-gray-500">v{item.version}</span>:<span className="ml-2 text-gray-500">Sinhronlaşmadyk</span>}{item.version&&<span className="ml-3 inline-flex gap-2"><button disabled={busyCreate} onClick={()=>editOrDelete(item,"update")} className="text-emerald-800 underline">Üýtget</button><button disabled={busyCreate} onClick={()=>editOrDelete(item,"delete")} className="text-red-700 underline">Poz</button></span>}</li>)}</ul>
   {items.length===0&&<p className="mt-2 text-sm text-gray-600">Offline ammarda at ýok.</p>}</>}
 </section>;
}
