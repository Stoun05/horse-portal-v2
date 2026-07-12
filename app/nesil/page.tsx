"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Dna, ExternalLink, Network, Trophy } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import Breadcrumb from "../../components/Breadcrumb";
import { useHorseCatalog } from "../../lib/useHorseCatalog";
import type { Horse } from "../../lib/horses";

type Relative = { name: string; detail: string; sex: "male" | "female" };

function parseRelative(text: string | undefined, sex: Relative["sex"]): Relative {
  if (!text) return { name: "Maglumat ýok", detail: "Şejere maglumatlary girizilmedi", sex };
  const [namePart, ...rest] = text.split("—");
  return { name: namePart.trim(), detail: rest.join("—").trim() || text, sex };
}

function parseGrandparents(text: string | undefined): string[] {
  const match = text?.match(/\(([^)]+)\)/);
  return match ? match[1].split(/[–-]/).map((name) => name.trim()).filter(Boolean) : [];
}

export default function NesilPage() {
  const [open, setOpen] = useState(false);
  const { horses } = useHorseCatalog();
  const [selectedId, setSelectedId] = useState("gundogar-01-akyol");
  const horse = horses.find((item) => item.id === selectedId) ?? horses[0];
  const family = useMemo(() => {
    if (!horse) return null;
    const father = parseRelative(horse.father, "male");
    const mother = parseRelative(horse.mother, "female");
    const fatherParents = parseGrandparents(horse.father);
    const motherParents = parseGrandparents(horse.mother);
    return { father, mother, grandparents: [
      { name: fatherParents[0] || "Maglumat ýok", detail: "Atasynyň atasy", sex: "male" as const },
      { name: fatherParents[1] || "Maglumat ýok", detail: "Atasynyň enesi", sex: "female" as const },
      { name: motherParents[0] || "Maglumat ýok", detail: "Enesiniň atasy", sex: "male" as const },
      { name: motherParents[1] || "Maglumat ýok", detail: "Enesiniň enesi", sex: "female" as const },
    ] };
  }, [horse]);

  return (
    <div className="min-h-screen bg-[#f6f8f7] lg:flex">
      <Sidebar open={open} setOpen={setOpen} />
      <div className="min-w-0 flex-1 border-[#0b5e3c]/20 sm:border-x-4 lg:border-x-8">
        <Topbar setOpen={setOpen} />
        <main className="p-4 text-[#111827] sm:p-6 lg:p-8">
          <Breadcrumb />
          <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div><div className="flex items-center gap-3"><Network className="text-[#0b5e3c]" /><h1 className="text-3xl font-black tracking-tight text-[#10261d] lg:text-4xl">Nesil daragty</h1></div><p className="mt-2 font-semibold text-[#4b5b53]">Saýlanan atyň ata-ene we üçünji nesil baglanyşyklary</p></div>
            <label className="min-w-[280px] text-sm font-extrabold text-[#26352e]">Aty saýla<select value={horse?.id ?? ""} onChange={(e) => setSelectedId(e.target.value)} className="mt-2 w-full rounded-xl border-2 border-[#d9e2dd] bg-white px-4 py-3 font-bold shadow-sm outline-none focus:border-[#0b5e3c]">{horses.map((item) => <option key={item.id} value={item.id}>{item.name} — {item.code}</option>)}</select></label>
          </div>

          {horse && family && <>
            <HorseSummary horse={horse} />
            <section className="mt-6 overflow-x-auto rounded-2xl border border-[#dfe7e2] bg-white p-5 shadow-sm lg:p-7">
              <div className="mb-6 grid min-w-[980px] grid-cols-3 gap-8 text-center text-sm font-black text-[#2a4036]"><div>1-nji nesil<br/><span className="font-semibold text-gray-500">Saýlanan at</span></div><div>2-nji nesil<br/><span className="font-semibold text-gray-500">Atasy we enesi</span></div><div>3-nji nesil<br/><span className="font-semibold text-gray-500">Baba-mamalary</span></div></div>
              <div className="grid min-h-[470px] min-w-[980px] grid-cols-3 items-center gap-12">
                <TreeCard main horse={horse} />
                <div className="relative grid h-[390px] grid-rows-2 gap-16 before:absolute before:-left-12 before:top-1/2 before:h-px before:w-12 before:bg-[#90a99c] after:absolute after:-left-px after:top-[24%] after:h-[52%] after:w-px after:bg-[#90a99c]"><RelativeCard relative={family.father} /><RelativeCard relative={family.mother} /></div>
                <div className="relative grid h-[430px] grid-rows-4 gap-5 before:absolute before:-left-12 before:top-[12%] before:h-[76%] before:w-px before:bg-[#b4c6bd]">{family.grandparents.map((relative, index) => <div key={`${relative.name}-${index}`} className="relative before:absolute before:-left-12 before:top-1/2 before:h-px before:w-12 before:bg-[#b4c6bd]"><RelativeCard compact relative={relative} /></div>)}</div>
              </div>
              <div className="mt-5 flex flex-wrap gap-5 border-t pt-5 text-sm font-bold"><Legend color="bg-sky-100 border-sky-300" label="Atasy tarapyndan"/><Legend color="bg-rose-50 border-rose-200" label="Enesi tarapyndan"/><Legend color="bg-[#0b5e3c] border-[#0b5e3c]" label="Saýlanan at"/></div>
            </section>
          </>}
        </main>
      </div>
    </div>
  );
}

function HorseSummary({ horse }: { horse: Horse }) { return <section className="grid gap-5 rounded-2xl border border-[#dfe7e2] bg-white p-6 shadow-sm lg:grid-cols-[1fr_auto]"><div className="flex items-center gap-5"><div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0b5e3c] to-[#c59a3b] text-4xl font-black text-white">{horse.name[0]}</div><div><div className="flex flex-wrap items-center gap-3"><h2 className="text-3xl font-black text-[#10261d]">{horse.name}</h2><span className="rounded-lg bg-emerald-100 px-3 py-1 text-sm font-extrabold text-emerald-900">{horse.breed}</span></div><p className="mt-2 font-bold text-[#26352e]">{horse.sex} · {horse.year} · {horse.color}</p><p className="mt-1 font-semibold text-[#53645b]">ID: {horse.code} · {horse.lineage}</p></div></div><div className="flex items-center gap-4 rounded-xl bg-amber-50 px-5 py-4 text-amber-900"><Trophy className="text-amber-600"/><div><p className="font-black">{horse.champion ? "Çempion at" : horse.horseClass || "Naýbaşy"}</p><p className="font-semibold">Tohumçylyk: {horse.breedingValue || "—"}</p></div><Link href={`/atlar/${horse.id}`} className="rounded-lg bg-white p-2 shadow" title="Pasportyny aç"><ExternalLink size={18}/></Link></div></section> }
function TreeCard({ horse, main = false }: { horse: Horse; main?: boolean }) { return <Link href={`/atlar/${horse.id}`} className={`${main ? "bg-[#07553a] text-white shadow-xl" : "bg-white text-[#111827]"} relative rounded-2xl border-2 border-[#0b5e3c] p-5 transition hover:-translate-y-1`}><div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-3xl">🐎</div><h3 className="text-2xl font-black">{horse.name}</h3><p className="mt-1 font-bold">{horse.breed}</p><p className="mt-3 text-sm font-semibold">{horse.year} · {horse.color}</p><p className="text-sm font-semibold">{horse.code}</p></Link> }
function RelativeCard({ relative, compact = false }: { relative: Relative; compact?: boolean }) { const male=relative.sex==="male"; return <div className={`${male ? "border-sky-300 bg-sky-50" : "border-rose-200 bg-rose-50"} h-full rounded-xl border-2 ${compact ? "px-4 py-3" : "p-5"} shadow-sm`}><div className="flex items-center gap-3"><span className={`${male ? "text-sky-700" : "text-rose-600"} text-xl font-black`}>{male ? "♂" : "♀"}</span><div className="min-w-0"><h3 className={`${compact ? "text-lg" : "text-xl"} truncate font-black text-[#15251e]`}>{relative.name}</h3><p className="line-clamp-2 text-sm font-semibold text-[#526159]">{relative.detail}</p></div></div></div> }
function Legend({color,label}:{color:string;label:string}) { return <span className="flex items-center gap-2"><i className={`h-4 w-4 rounded-full border ${color}`}/>{label}</span> }
