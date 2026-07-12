"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Download, ExternalLink, Minus, Network, Plus, Printer, RotateCcw, Search, Trophy } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import Breadcrumb from "../../components/Breadcrumb";
import { useHorseCatalog } from "../../lib/useHorseCatalog";
import type { Horse } from "../../lib/horses";

type Sex = "male" | "female";
type TreeNode = { name: string; detail: string; sex: Sex; horseId?: string };

const emptyNode = (sex: Sex, detail = "Şejere maglumatlary girizilmedi"): TreeNode => ({ name: "Maglumat ýok", detail, sex });
const normalize = (value: string) => value.toLocaleLowerCase("tk").replace(/[^a-zäçňöşüýž]/gi, "");

function relativeFrom(text: string | undefined, sex: Sex, horses: Horse[]): TreeNode {
  if (!text) return emptyNode(sex);
  const [namePart, ...rest] = text.split("—");
  const name = namePart.trim();
  const found = horses.find((horse) => normalize(horse.name) === normalize(name));
  return { name, detail: rest.join("—").trim() || text, sex, horseId: found?.id };
}

function grandparentNames(text: string | undefined) {
  const match = text?.match(/\(([^)]+)\)/);
  return match ? match[1].split(/[–-]/).map((name) => name.trim()).filter(Boolean) : [];
}

function namedNode(name: string | undefined, sex: Sex, detail: string, horses: Horse[]): TreeNode {
  if (!name) return emptyNode(sex, detail);
  const found = horses.find((horse) => normalize(horse.name) === normalize(name));
  return { name, detail, sex, horseId: found?.id };
}

export default function NesilPage() {
  const [open, setOpen] = useState(false);
  const { horses } = useHorseCatalog();
  const [selectedId, setSelectedId] = useState("gundogar-01-akyol");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [generations, setGenerations] = useState<3 | 4 | 5>(3);
  const [zoom, setZoom] = useState(1);
  const horse = horses.find((item) => item.id === selectedId) ?? horses[0];

  useEffect(() => {
    const requestedId = new URLSearchParams(window.location.search).get("horse");
    if (requestedId && horses.some((item) => item.id === requestedId)) setSelectedId(requestedId);
  }, [horses]);

  const searchResults = useMemo(() => {
    const value = query.trim().toLocaleLowerCase("tk");
    if (!value) return [];
    return horses.filter((item) => item.name.toLocaleLowerCase("tk").includes(value) || item.code.toLocaleLowerCase("tk").includes(value)).slice(0, 8);
  }, [query, horses]);

  const selectHorse = (id: string) => {
    setSelectedId(id);
    setQuery("");
    setSearchOpen(false);
    window.history.replaceState(null, "", `/nesil?horse=${encodeURIComponent(id)}`);
  };

  const columns = useMemo(() => {
    if (!horse) return [];
    const father = relativeFrom(horse.father, "male", horses);
    const mother = relativeFrom(horse.mother, "female", horses);
    const fatherParents = grandparentNames(horse.father);
    const motherParents = grandparentNames(horse.mother);
    const third = [
      namedNode(fatherParents[0], "male", "Atasynyň atasy", horses),
      namedNode(fatherParents[1], "female", "Atasynyň enesi", horses),
      namedNode(motherParents[0], "male", "Enesiniň atasy", horses),
      namedNode(motherParents[1], "female", "Enesiniň enesi", horses),
    ];
    const result: TreeNode[][] = [[father, mother], third];
    if (generations >= 4) result.push(Array.from({ length: 8 }, (_, index) => emptyNode(index % 2 ? "female" : "male", "4-nji nesil maglumatlary ýok")));
    if (generations >= 5) result.push(Array.from({ length: 16 }, (_, index) => emptyNode(index % 2 ? "female" : "male", "5-nji nesil maglumatlary ýok")));
    return result;
  }, [horse, horses, generations]);

  const chooseNode = (node: TreeNode) => { if (node.horseId) selectHorse(node.horseId); };
  const printTree = (pdf = false) => {
    const oldTitle = document.title;
    document.title = `${horse?.name || "At"} — nesil daragty${pdf ? " PDF" : ""}`;
    window.print();
    window.setTimeout(() => { document.title = oldTitle; }, 500);
  };

  return <div className="min-h-screen bg-[#f6f8f7] lg:flex">
    <Sidebar open={open} setOpen={setOpen} />
    <div className="min-w-0 flex-1 border-[#0b5e3c]/20 sm:border-x-4 lg:border-x-8">
      <div className="print:hidden"><Topbar setOpen={setOpen} /></div>
      <main className="p-4 text-[#111827] sm:p-6 lg:p-8">
        <div className="print:hidden"><Breadcrumb /></div>
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between print:hidden">
          <div><div className="flex items-center gap-3"><Network className="text-[#0b5e3c]" /><h1 className="text-3xl font-black tracking-tight text-[#10261d] lg:text-4xl">Nesil daragty</h1></div><p className="mt-2 font-semibold text-[#4b5b53]">Kartoçka basylanda katalogda bar bolan at esasy at hökmünde saýlanýar.</p></div>
          <div className="grid w-full gap-3 md:grid-cols-2 xl:w-auto">
            <label className="relative min-w-[300px] text-sm font-extrabold text-[#26352e]">Ady ýa-da ID boýunça gözle
              <Search className="absolute bottom-3.5 left-4 text-[#53645b]" size={19}/>
              <input value={query} onFocus={() => setSearchOpen(true)} onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }} placeholder="Mysal: Parasat ýa-da GÜNDOGAR-02" className="mt-2 w-full rounded-xl border-2 border-[#d9e2dd] bg-white py-3 pl-11 pr-4 font-bold shadow-sm outline-none focus:border-[#0b5e3c]"/>
              {searchOpen && query.trim() && <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-72 overflow-auto rounded-xl border-2 border-[#d9e2dd] bg-white p-2 shadow-xl">{searchResults.length ? searchResults.map((item) => <button type="button" key={item.id} onMouseDown={(e) => e.preventDefault()} onClick={() => selectHorse(item.id)} className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left hover:bg-emerald-50"><span className="font-black text-[#10261d]">{item.name}</span><span className="text-sm font-bold text-[#53645b]">{item.code}</span></button>) : <p className="p-4 text-center font-bold text-gray-500">At tapylmady</p>}</div>}
            </label>
            <label className="min-w-[280px] text-sm font-extrabold text-[#26352e]">Aty saýla<select value={horse?.id ?? ""} onChange={(e) => selectHorse(e.target.value)} className="mt-2 w-full rounded-xl border-2 border-[#d9e2dd] bg-white px-4 py-3 font-bold shadow-sm outline-none focus:border-[#0b5e3c]">{horses.map((item) => <option key={item.id} value={item.id}>{item.name} — {item.code}</option>)}</select></label>
          </div>
        </div>

        {horse && <>
          <HorseSummary horse={horse} />
          <section className="mt-6 rounded-2xl border border-[#dfe7e2] bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4 print:hidden">
              <div className="flex flex-wrap items-center gap-2"><label className="font-black">Görkezilýän nesil:</label><select value={generations} onChange={(e) => setGenerations(Number(e.target.value) as 3 | 4 | 5)} className="rounded-lg border-2 px-3 py-2 font-bold"><option value={3}>3 nesil</option><option value={4}>4 nesil</option><option value={5}>5 nesil</option></select></div>
              <div className="flex flex-wrap items-center gap-2"><Tool onClick={() => setZoom((z) => Math.max(.65, +(z - .1).toFixed(2)))} icon={<Minus size={18}/>} label="Kiçelt"/><span className="min-w-16 text-center font-black">{Math.round(zoom*100)}%</span><Tool onClick={() => setZoom((z) => Math.min(1.4, +(z + .1).toFixed(2)))} icon={<Plus size={18}/>} label="Ulalt"/><Tool onClick={() => setZoom(1)} icon={<RotateCcw size={18}/>} label="100%"/><Tool onClick={() => printTree(false)} icon={<Printer size={18}/>} label="Çap et"/><button onClick={() => printTree(true)} className="inline-flex items-center gap-2 rounded-lg bg-[#07553a] px-4 py-2.5 font-black text-white hover:bg-[#043d2a]"><Download size={18}/> PDF eksport</button></div>
            </div>

            <div className="overflow-auto p-5 lg:p-7" style={{ minHeight: generations === 5 ? 1250 * zoom : generations === 4 ? 760 * zoom : 520 * zoom }}>
              <div className="origin-top-left transition-transform duration-200" style={{ transform: `scale(${zoom})`, width: `${100/zoom}%` }}>
                <div className="mb-5 grid gap-8 text-center text-sm font-black text-[#2a4036]" style={{gridTemplateColumns:`repeat(${generations}, minmax(210px, 1fr))`, minWidth:`${generations*250}px`}}>{Array.from({length:generations},(_,i)=><div key={i}>{i+1}-nji nesil<br/><span className="font-semibold text-gray-500">{i===0?"Saýlanan at":i===1?"Atasy we enesi":i===2?"Baba-mamalary":"Maglumat ýok"}</span></div>)}</div>
                <div className="grid items-stretch gap-10" style={{gridTemplateColumns:`repeat(${generations}, minmax(210px, 1fr))`, minWidth:`${generations*250}px`}}>
                  <div className="flex items-center"><MainCard horse={horse}/></div>
                  {columns.map((nodes,columnIndex)=><div key={columnIndex} className="relative flex flex-col justify-around gap-3 border-l border-[#b4c6bd] pl-5">{nodes.map((node,index)=><div key={`${columnIndex}-${index}-${node.name}`} className="relative before:absolute before:-left-5 before:top-1/2 before:h-px before:w-5 before:bg-[#b4c6bd]"><RelativeCard node={node} compact={columnIndex>0} onClick={() => chooseNode(node)}/></div>)}</div>)}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-5 border-t p-5 text-sm font-bold print:hidden"><Legend color="bg-sky-100 border-sky-300" label="Atasy tarapyndan"/><Legend color="bg-rose-50 border-rose-200" label="Enesi tarapyndan"/><Legend color="bg-[#0b5e3c] border-[#0b5e3c]" label="Saýlanan at"/><span className="text-gray-500">Basyp bolýan kartoçkalarda katalogdaky at bar.</span></div>
          </section>
        </>}
      </main>
    </div>
  </div>;
}

function HorseSummary({horse}:{horse:Horse}) { return <section className="grid gap-5 rounded-2xl border border-[#dfe7e2] bg-white p-6 shadow-sm lg:grid-cols-[1fr_auto]"><div className="flex items-center gap-5"><div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0b5e3c] to-[#c59a3b] text-4xl font-black text-white">{horse.name[0]}</div><div><div className="flex flex-wrap items-center gap-3"><h2 className="text-3xl font-black text-[#10261d]">{horse.name}</h2><span className="rounded-lg bg-emerald-100 px-3 py-1 text-sm font-extrabold text-emerald-900">{horse.breed}</span></div><p className="mt-2 font-bold text-[#26352e]">{horse.sex} · {horse.year} · {horse.color}</p><p className="mt-1 font-semibold text-[#53645b]">ID: {horse.code} · {horse.lineage}</p></div></div><div className="flex items-center gap-4 rounded-xl bg-amber-50 px-5 py-4 text-amber-900"><Trophy className="text-amber-600"/><div><p className="font-black">{horse.champion?"Çempion at":horse.horseClass||"Naýbaşy"}</p><p className="font-semibold">Tohumçylyk: {horse.breedingValue||"—"}</p></div><Link href={`/atlar/${horse.id}`} className="rounded-lg bg-white p-2 shadow print:hidden" title="Pasportyny aç"><ExternalLink size={18}/></Link></div></section> }
function MainCard({horse}:{horse:Horse}) { return <div className="w-full rounded-2xl border-2 border-[#07553a] bg-[#07553a] p-5 text-white shadow-xl"><div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-3xl">🐎</div><h3 className="text-2xl font-black">{horse.name}</h3><p className="font-bold">{horse.breed}</p><p className="mt-3 text-sm font-semibold">{horse.year} · {horse.color}</p><p className="text-sm font-semibold">{horse.code}</p></div> }
function RelativeCard({node,compact,onClick}:{node:TreeNode;compact:boolean;onClick:()=>void}) { const male=node.sex==="male"; const available=Boolean(node.horseId); return <button type="button" onClick={onClick} disabled={!available} title={available?`${node.name} atly aty saýla`:"Bu at katalogda ýok"} className={`${male?"border-sky-300 bg-sky-50":"border-rose-200 bg-rose-50"} w-full rounded-xl border-2 text-left shadow-sm ${compact?"px-3 py-2":"p-4"} ${available?"cursor-pointer hover:-translate-y-1 hover:border-[#07553a] hover:shadow-lg":"cursor-default opacity-90"}`}><div className="flex items-center gap-3"><span className={`${male?"text-sky-700":"text-rose-600"} text-xl font-black`}>{male?"♂":"♀"}</span><div className="min-w-0"><h3 className={`${compact?"text-base":"text-xl"} truncate font-black text-[#15251e]`}>{node.name}</h3><p className="line-clamp-2 text-xs font-semibold text-[#526159]">{node.detail}</p>{available&&<span className="mt-1 block text-xs font-black text-[#07553a]">Saýlamak üçin bas</span>}</div></div></button> }
function Tool({onClick,icon,label}:{onClick:()=>void;icon:React.ReactNode;label:string}) { return <button onClick={onClick} title={label} className="inline-flex items-center gap-2 rounded-lg border-2 border-[#d9e2dd] bg-white px-3 py-2 font-black hover:bg-emerald-50">{icon}<span className="hidden sm:inline">{label}</span></button> }
function Legend({color,label}:{color:string;label:string}) { return <span className="flex items-center gap-2"><i className={`h-4 w-4 rounded-full border ${color}`}/>{label}</span> }
