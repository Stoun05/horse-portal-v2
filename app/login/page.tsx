"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

type DesktopUser={id:string;username?:string;role:string};
type DesktopAuth={
 login:(username:string,password:string)=>Promise<DesktopUser>;
 logout:()=>Promise<{success:boolean}>;
 getStatus:()=>Promise<{authenticated:boolean;user:DesktopUser|null}>;
};
declare global { interface Window { atcylykDesktopAuth?:DesktopAuth } }

export default function DesktopLoginPage(){
 const [available,setAvailable]=useState(false);
 const [username,setUsername]=useState("");
 const [password,setPassword]=useState("");
 const [user,setUser]=useState<DesktopUser|null>(null);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 useEffect(()=>{
  const bridge=window.atcylykDesktopAuth;
  if(!bridge)return;
  setAvailable(true);
  bridge.getStatus().then(status=>setUser(status.user)).catch(()=>setMessage("Giriş hyzmaty häzir elýeterli däl."));
 },[]);
 async function login(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  const bridge=window.atcylykDesktopAuth;
  if(!bridge||busy)return;
  setBusy(true);setMessage("");
  try{const next=await bridge.login(username,password);setUser(next);setPassword("");}
  catch{setMessage("Giriş başartmady. Hasabyňyzy ýa-da serwer sazlamalaryny barlaň.");}
  finally{setBusy(false);}
 }
 async function logout(){
  const bridge=window.atcylykDesktopAuth;
  if(!bridge||busy)return;
  setBusy(true);setMessage("");
  try{await bridge.logout();setUser(null);setPassword("");}
  catch{setMessage("Çykmak başartmady. Programmany täzeden açyp görüň.");}
  finally{setBusy(false);}
 }
 return <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
  <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
   <h1 className="text-2xl font-bold text-emerald-950">Atçylyk Portal — giriş</h1>
   <p className="mt-2 text-sm text-slate-600">Ýerli Windows programmasynyň goragly hasaby</p>
   {!available?<p className="mt-6 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Bu giriş diňe sazlanan Windows programmasynda elýeterlidir.</p>:
    user?<div className="mt-6 space-y-4">
     <p className="text-sm">Giriş edildi: <strong>{user.username||user.id}</strong> ({user.role})</p>
     <div className="flex gap-3"><Link href="/atlar" className="rounded-lg bg-emerald-800 px-4 py-2 text-white">Atlara geç</Link><button type="button" disabled={busy} onClick={logout} className="rounded-lg border px-4 py-2 disabled:opacity-50">Çykmak</button></div>
    </div>:
    <form onSubmit={login} className="mt-6 space-y-4">
     <label className="block text-sm font-medium">Ulanyjy ady<input required autoComplete="username" maxLength={100} value={username} onChange={e=>setUsername(e.target.value)} className="mt-1 w-full rounded-lg border p-3"/></label>
     <label className="block text-sm font-medium">Parol<input required type="password" autoComplete="current-password" maxLength={1024} value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full rounded-lg border p-3"/></label>
     <button disabled={busy} type="submit" className="w-full rounded-lg bg-emerald-800 p-3 text-white disabled:opacity-50">{busy?"Barlanýar…":"Giriş"}</button>
    </form>}
   {message&&<p role="alert" className="mt-4 text-sm text-red-700">{message}</p>}
   <Link href="/" className="mt-6 inline-block text-sm text-emerald-800 underline">Baş sahypa</Link>
  </section>
 </main>;
}
