"use client";

import Link from "next/link";
import { ArrowRight, Trophy, Network, Dna } from "lucide-react";
import { useHorseCatalog } from "../lib/useHorseCatalog";
import { assetPath } from "../lib/assetPath";

export default function HeroSection() {
  const { horses } = useHorseCatalog();
  const champions = horses.filter((horse) => horse.champion).length;
  const lineages = new Set(horses.map((horse) => horse.lineage).filter(Boolean)).size;
  const relations = horses.reduce((sum, horse) => sum + Number(Boolean(horse.father)) + Number(Boolean(horse.mother)), 0);

  return (
    <section className="relative min-h-[610px] overflow-hidden rounded-[32px] border border-white/10 shadow-[0_22px_70px_-25px_rgba(2,40,27,0.55)] md:min-h-[700px]">
      <img src={assetPath("/horse-hero.png")} alt="Ahalteke bedewi" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#031f1a]/95 via-[#042c23]/80 to-[#0b3325]/25" />
      <div className="relative z-10 flex min-h-[610px] flex-col justify-between p-6 md:min-h-[700px] md:p-12 xl:p-14">
        <div>
          <p className="mb-5 inline-flex rounded-full border border-amber-300/25 bg-amber-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-200">Sanly atçylyk — geljegiň ugry</p>
          <h1 className="max-w-5xl text-4xl font-black leading-[1.12] tracking-tight text-white md:text-5xl xl:text-6xl">
            ATLARYŇ NESIL<br />MAGLUMATLARYNY<br />SANLY DOLANDYRYŞ<br />ULGAMY
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-white/80 md:text-lg">
            24 sany Ahalteke bedewiniň hakyky maglumatlary, şejeresi we üstünlikleri bir ýerde.
          </p>
          <Link href="/atlar" className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-amber-400 px-6 py-4 font-extrabold text-[#052b1f] shadow-[0_12px_28px_-12px_rgba(251,191,36,0.85)] transition hover:-translate-y-0.5 hover:bg-amber-300">
            Atlaryň katalogyna gir <ArrowRight size={19} />
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4 md:gap-4">
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
  return <div className="rounded-2xl border border-white/20 bg-white/10 p-4 shadow-lg backdrop-blur-xl md:p-5"><div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-300/20 text-amber-200">{icon}</div><p className="text-sm text-white/70">{title}</p><h3 className="mt-2 text-3xl font-extrabold text-white md:text-4xl">{value}</h3></div>;
}
