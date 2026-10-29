"use client";
import {useState} from "react";
import {fetchRemoteHorseCatalog, type RemoteHorseResult} from "../lib/remoteHorseCatalog";

/* Opt-in, read-only remote preview. Never merges or writes browser horse storage. */
export default function RemoteHorsePanel(){
 const [open,setOpen]=useState(false);
 const [username,setUsername]=useState("");
 const [password,setPassword]=useState("");
 const [result,setResult]=useState<RemoteHorseResult|null>(null);
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
 async function readRemote(){
  setBusy(true);setError("");setResult(null);
  const origin="http://127.0.0.1:4100";
  let token:string|undefined;
  try{
   const login=await fetch(origin+"/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username,password}),cache:"no-store",signal:AbortSignal.timeout(10000)});
   if(!login.ok){setError(login.status===401?"Giriş maglumatlary nädogry.":"Serwere girip bolmady.");return;}
   const body:unknown=await login.json();
   if(!body||typeof body!=="object"||!("token" in body)||typeof body.token!=="string"||!/^[a-f0-9]{64}$/.test(body.token)){
    setError("Serwerden nädogry sessiýa jogaby geldi.");return;
   }
   token=body.token;
   setResult(await fetchRemoteHorseCatalog(origin,token));
  }catch{setError("Ýerli serwer elýeterli däl.");}
  finally{
   setPassword("");
   if(token){
    try{await fetch(origin+"/api/auth/logout",{method:"POST",headers:{Authorization:"Bearer "+token},signal:AbortSignal.timeout(5000)});}catch{}
   }
   setBusy(false);
  }
 }
 return <section className="mb-6 rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
  <button type="button" className="font-bold text-emerald-900 underline" onClick={()=>setOpen(v=>!v)}>
   Merkezi serweriň katalogyny görkez (diňe okamak)
  </button>
  {open&&<div className="mt-4 space-y-3">
   <p className="text-sm text-slate-600">Ýerli serwer: 127.0.0.1:4100. Bu sanaw aýratyn görkezilýär; häzirki atlaryňyz üýtgemeýär.</p>
   <label className="block text-sm">Ulanyjy ady<input className="mt-1 block w-full rounded border p-2" autoComplete="off" value={username} onChange={e=>setUsername(e.target.value)}/></label>
   <label className="block text-sm">Parol<input className="mt-1 block w-full rounded border p-2" type="password" autoComplete="off" value={password} onChange={e=>setPassword(e.target.value)}/></label>
   <button type="button" disabled={busy||!username||!password} className="rounded bg-emerald-800 px-4 py-2 text-white disabled:opacity-50" onClick={readRemote}>{busy?"Barlanýar...":"Serwerden oka"}</button>
   {error&&<p role="alert" className="text-red-700">{error}</p>}
   {result&&(result.ok?<div><p className="font-semibold">Serwerden {result.horses.length} ýazgy okaldy (iň köp 100).</p><ul className="mt-2 max-h-60 overflow-y-auto list-inside list-disc text-sm">{result.horses.map(h=><li key={h.id}>{h.name} — {h.code??h.id}</li>)}</ul></div>:<p role="status">Okap bolmady: {result.reason}</p>)}
  </div>}
 </section>;
}
