"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import HeroSection from "../components/HeroSection";
import Breadcrumb from "../components/Breadcrumb";
import { useHorseCatalog } from "../lib/useHorseCatalog";

export default function Home() {
  const [open, setOpen] = useState(false);
  const { horses } = useHorseCatalog();
  const newest = [...horses].sort((a, b) => b.year - a.year).slice(0, 4);
  return <div className="min-h-screen bg-gray-100 lg:flex"><Sidebar open={open} setOpen={setOpen} /><div className="flex-1 border-[#93c5fd] sm:border-x-4 lg:border-x-[15px]"><Topbar setOpen={setOpen} /><main className="px-3 py-4 sm:px-5 lg:p-8"><Breadcrumb /><HeroSection /><div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3"><section className="rounded-2xl bg-white p-6 shadow xl:col-span-2"><h2 className="mb-5 text-2xl font-bold text-[#0b2f24]">Katalogdaky täze nesiller</h2><div className="space-y-3">{newest.map((horse) => <a key={horse.id} href={`/atlar/${horse.id}`} className="flex items-center justify-between border-b pb-3 hover:text-[#0b5e3c]"><span><b>{horse.name}</b><small className="ml-2 text-gray-500">{horse.code}</small></span><span>{horse.year}</span></a>)}</div></section><section className="rounded-2xl bg-white p-6 shadow"><h2 className="mb-5 text-2xl font-bold text-[#0b2f24]">Çalt hereketler</h2><div className="space-y-3"><Quick href="/atlar" label="➕ Täze at goş" /><Quick href="/nesil" label="🌳 Nesil maglumatlary" /><Quick href="/seljerme" label="📊 Hakyky seljerme" /><Quick href="/tohumçylyk" label="🧬 Tohumçylyk" /></div></section></div></main></div></div>;
}

function Quick({ href, label }: { href: string; label: string }) { return <a href={href} className="block rounded-xl bg-emerald-50 px-5 py-4 font-semibold text-[#0b2f24] hover:bg-emerald-100">{label}</a>; }
