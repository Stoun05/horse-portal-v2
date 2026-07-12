"use client";

import { useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import Breadcrumb from "../../components/Breadcrumb";
import { useHorseCatalog } from "../../lib/useHorseCatalog";

export default function SeljermePage() {
  const [open, setOpen] = useState(false);
  const { horses } = useHorseCatalog();
  const champions = horses.filter((h) => h.champion);
  const lineages = useMemo(() => Object.entries(horses.reduce<Record<string, number>>((a, h) => { const key=h.lineage || "Görkezilmedik"; a[key]=(a[key]||0)+1; return a; }, {})).sort((a,b)=>b[1]-a[1]), [horses]);
  const years = useMemo(() => Object.entries(horses.reduce<Record<string, number>>((a,h)=>{a[h.year]=(a[h.year]||0)+1;return a;},{})).sort((a,b)=>Number(a[0])-Number(b[0])), [horses]);
  return <div className="min-h-screen bg-gray-100 lg:flex"><Sidebar open={open} setOpen={setOpen}/><div className="min-w-0 flex-1 border-[#93c5fd] sm:border-x-4 lg:border-x-[15px]"><Topbar setOpen={setOpen}/><main className="p-4 sm:p-6 lg:p-8"><Breadcrumb/><h1 className="text-4xl font-bold text-[#0b2f24]">Hakyky maglumatlaryň seljermesi</h1><p className="mt-2 text-gray-500">Netijeler katalogdaky maglumatlardan awtomatik hasaplanýar.</p><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Stat label="Jemi at" value={horses.length}/><Stat label="Çempion" value={champions.length}/><Stat label="Nesil ugry" value={lineages.length}/><Stat label="Ata-ene ýazgysy" value={horses.reduce((n,h)=>n+Number(!!h.father)+Number(!!h.mother),0)}/></div><div className="mt-8 grid gap-6 xl:grid-cols-2"><Panel title="Nesil ugurlary">{lineages.map(([name,count])=><Bar key={name} label={name} value={count} max={horses.length}/>)}</Panel><Panel title="Doglan ýyllary">{years.map(([year,count])=><Bar key={year} label={year} value={count} max={Math.max(...years.map(([,n])=>n))}/>)}</Panel><Panel title="Çempion atlar">{champions.map(h=><a className="flex justify-between border-b py-3 hover:text-emerald-700" key={h.id} href={`/atlar/${h.id}`}><b>{h.name}</b><span>{h.year} · {h.code}</span></a>)}</Panel><Panel title="Soňky maglumatlar">{[...horses].sort((a,b)=>b.year-a.year).slice(0,8).map(h=><div className="flex justify-between border-b py-3" key={h.id}><b>{h.name}</b><span>{h.lineage}</span></div>)}</Panel></div></main></div></div>;
}
function Stat({label,value}:{label:string;value:number}){return <div className="rounded-2xl bg-white p-6 shadow"><p className="text-gray-500">{label}</p><b className="mt-2 block text-4xl text-[#0b5e3c]">{value}</b></div>}
function Panel({title,children}:{title:string;children:React.ReactNode}){return <section className="rounded-2xl bg-white p-6 shadow"><h2 className="mb-5 text-2xl font-bold text-[#0b2f24]">{title}</h2>{children}</section>}
function Bar({label,value,max}:{label:string;value:number;max:number}){return <div className="mb-4"><div className="mb-1 flex justify-between gap-3 text-sm"><span>{label}</span><b>{value}</b></div><div className="h-2 rounded bg-gray-100"><div className="h-2 rounded bg-[#0b5e3c]" style={{width:`${Math.max(4,value/max*100)}%`}}/></div></div>}
