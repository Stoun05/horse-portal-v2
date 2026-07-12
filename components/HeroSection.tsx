"use client";

import Link from "next/link";
import { ArrowRight, Trophy, Network, Dna } from "lucide-react";
import { useHorseCatalog } from "../lib/useHorseCatalog";

export default function HeroSection() {
  const { horses } = useHorseCatalog();
  const champions = horses.filter((horse) => horse.champion).length;
  const lineages = new Set(horses.map((horse) => horse.lineage).filter(Boolean)).size;
  const relations = horses.reduce((sum, horse) => sum + Number(Boolean(horse.father)) + Number(Boolean(horse.mother)), 0);

  return (
    <section className="relative min-h-[720px] overflow-hidden rounded-3xl shadow-2xl md:min-h-[850px]">
      <img src="/horse-hero.png" alt="Ahalteke bedewi" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
      <div className="relative z-10 flex min-h-[720px] flex-col justify-between p-6 md:min-h-[850px] md:p-16">
        <div>
          <p className="mb-6 font-semibold uppercase tracking-wider text-yellow-300">Sanly atçylyk — geljegiň ugry</p>
          <h1 className="max-w-5xl text-4xl font-extrabold leading-tight text-white md:text-6xl xl:text-7xl">
            ATLARYŇ NESIL<br />MAGLUMATLARYNY<br />SANLY DOLANDYRYŞ<br />ULGAMY
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/90 md:mt-8 md:text-xl md:leading-9">
            24 sany Ahalteke bedewiniň hakyky maglumatlary, şejeresi we üstünlikleri bir ýerde.
          </p>
          <Link href="/atlar" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#0b5e3c] px-6 py-4 font-semibold text-white hover:bg-[#08462d]">
            Atlaryň katalogyna gir <ArrowRight size={19} />
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
          <StatCard icon="🐎" title="Jemi atlar" value={horses.length} />
          <StatCard icon={<Network size={30} />} title="Nesil baglanyşyklary" value={relations} />
          <StatCard icon={<Trophy size={30} />} title="Çempion atlar" value={champions} />
          <StatCard icon={<Dna size={30} />} title="Nesil ugurlary" value={lineages} />
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: number }) {
  return <div className="rounded-2xl bg-white/95 p-6 shadow-xl backdrop-blur-xl"><div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#0b5d3d] text-white">{icon}</div><p className="text-sm text-gray-500">{title}</p><h3 className="mt-2 text-4xl font-bold text-[#0b2f24]">{value}</h3></div>;
}
