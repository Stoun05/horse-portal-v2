"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import Breadcrumb from "../../components/Breadcrumb";
import { BookOpen, HeartPulse, Network, FileText, Laptop, Info, ShieldCheck } from "lucide-react";

const features = [
  { icon: BookOpen, title: "Atlar katalogy", description: "Atlaryň esasy maglumatlaryny bir ýerde görmek we dolandyrmak." },
  { icon: Network, title: "Nesil daragty", description: "Atlaryň gelip çykyşyny we nesil baglanyşyklaryny öwrenmek." },
  { icon: HeartPulse, title: "Saglyk taryhy", description: "Weterinariýa we saglyk maglumatlary bilen işlemek." },
  { icon: FileText, title: "Hasabatlar", description: "Portal maglumatlary boýunça hasabatlary görmek." },
];

export default function ProgrammaBaradaPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4f7f5] lg:flex">
      <Sidebar open={open} setOpen={setOpen} />
      <div className="min-w-0 flex-1 border-x-0 border-[#93c5fd] sm:border-x-4 lg:border-x-[15px]">
        <Topbar setOpen={setOpen} />
        <main className="p-4 sm:p-6 lg:p-8">
          <Breadcrumb />
          <header className="mb-7">
            <h1 className="text-3xl font-black text-[#082f24] lg:text-4xl">Programma barada</h1>
            <p className="mt-2 font-medium text-slate-600">Atçylyk portalynyň maksady, mümkinçilikleri we tehniki maglumatlary.</p>
          </header>

          <section className="mb-7 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl bg-[#e8f3ed] p-3 text-[#0b5e3c]"><Info size={30} /></div>
              <div>
                <h2 className="text-2xl font-extrabold text-[#082f24]">Atçylyk Portal</h2>
                <p className="font-semibold text-slate-600">Wersiýa 1.1.0-beta.3 (integration)</p>
              </div>
            </div>
            <p className="mt-5 max-w-3xl leading-7 text-slate-700">
              Atçylyk Portal — Ahalteke atlarynyň katalogyny, elektron pasportlaryny,
              nesil daragtyny we saglyk maglumatlaryny bitewi interfeýsde dolandyrmak
              üçin taýýarlanan sanly programma.
            </p>
          </section>

          <h2 className="mb-4 text-xl font-extrabold text-[#082f24]">Esasy mümkinçilikler</h2>
          <section className="mb-7 grid gap-4 sm:grid-cols-2">
            {features.map(({ icon: Icon, title, description }) => (
              <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <Icon className="mb-3 text-[#0b5e3c]" size={27} />
                <h3 className="font-extrabold text-[#082f24]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              </article>
            ))}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-extrabold text-[#082f24]">Tehniki maglumatlar</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3"><Laptop className="mt-1 shrink-0 text-[#0b5e3c]" size={22} /><div><h3 className="font-bold text-slate-800">Platforma</h3><p className="text-sm text-slate-600">Web interfeýsi we Windows desktop programma</p></div></div>
              <div className="flex items-start gap-3"><ShieldCheck className="mt-1 shrink-0 text-[#0b5e3c]" size={22} /><div><h3 className="font-bold text-slate-800">Tehnologiýalar</h3><p className="text-sm text-slate-600">Next.js, React, TypeScript, Electron</p></div></div>
            </div>
            <p className="mt-5 border-t border-slate-100 pt-4 text-xs text-slate-500">Programmany ulanmazdan ozal möhüm maglumatlaryň ätiýaçlyk nusgasyny saklamak maslahat berilýär.</p>
          </section>
        </main>
      </div>
    </div>
  );
}
