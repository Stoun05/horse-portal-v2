"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import Breadcrumb from "../../components/Breadcrumb";
import { useHorseCatalog } from "../../lib/useHorseCatalog";

export default function NesilPage() {
  const [open, setOpen] = useState(false);
  const { horses } = useHorseCatalog();
  const [selectedId, setSelectedId] = useState("gundogar-01-akyol");
  const horse = horses.find((item) => item.id === selectedId) ?? horses[0];
  return <div className="min-h-screen bg-gray-100 lg:flex"><Sidebar open={open} setOpen={setOpen} /><div className="min-w-0 flex-1 border-[#93c5fd] sm:border-x-4 lg:border-x-[15px]"><Topbar setOpen={setOpen} /><main className="p-4 sm:p-6 lg:p-8"><Breadcrumb /><div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-4xl font-bold text-[#0b2f24]">Nesil maglumatlary</h1><p className="mt-2 text-gray-500">Katalogdaky aty saýlap, onuň hakyky ata-enesini görüň.</p></div><select value={horse?.id ?? ""} onChange={(e) => setSelectedId(e.target.value)} className="rounded-xl border bg-white px-4 py-3">{horses.map((item) => <option key={item.id} value={item.id}>{item.name} — {item.code}</option>)}</select></div>{horse && <><section className="rounded-2xl bg-[#0b5e3c] p-6 text-white shadow"><p className="text-sm text-white/70">Saýlanan at</p><h2 className="mt-1 text-3xl font-bold">{horse.name}</h2><p className="mt-2">{horse.year} · {horse.color} · {horse.lineage ?? "Nesil ugry görkezilmedi"}</p><Link href={`/atlar/${horse.id}`} className="mt-5 inline-block rounded-lg bg-white px-4 py-2 font-semibold text-[#0b5e3c]">Pasportyny aç</Link></section><div className="my-5 text-center text-3xl text-gray-400">↓</div><div className="grid gap-5 md:grid-cols-2"><Parent title="Atasy" value={horse.father} /><Parent title="Enesi" value={horse.mother} /></div></>}</main></div></div>;
}
function Parent({ title, value }: { title: string; value?: string }) { return <section className="rounded-2xl border bg-white p-6 shadow-sm"><p className="text-sm font-semibold uppercase text-emerald-700">{title}</p><p className="mt-3 text-lg font-medium text-[#0b2f24]">{value || "Maglumat girizilmedi"}</p></section>; }
