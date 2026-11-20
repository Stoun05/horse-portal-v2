"use client";

import Link from "next/link";
import AdminLogout from "../../components/AdminLogout";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, Database, FileText, HeartPulse, Images, Network, Settings, ShieldAlert, Users, BookOpen } from "lucide-react";
import { HORSE_STORAGE_KEY, initialHorses, mergeHorseDefaults, type Horse } from "../../lib/horses";

const areas = [
  { title: "Atlary dolandyrmak", desc: "Atlary goşmak, üýtgetmek we sanawy tertiplemek", href: "/admin/atlar", icon: BookOpen },
  { title: "Ulanyjylar", desc: "Rollar we ulanyjy ýazgylary", href: "/admin/ulanyjylar", icon: Users },
  { title: "Nesil daragty", desc: "Atlaryň nesil maglumatlary", href: "/nesil", icon: Network },
  { title: "Saglyk taryhy", desc: "Weterinariýa ýazgylary", href: "/saglyk", icon: HeartPulse },
  { title: "Suratlar we wideolar", desc: "Media maglumatlaryny dolandyrmak", href: "/media", icon: Images },
  { title: "Hasabatlar", desc: "Hasabatlary görmek", href: "/hasabatlar", icon: FileText },
  { title: "Sazlamalar", desc: "Portal sazlamalary we rugsatlaryň prototipi", href: "/admin/sazlamalar", icon: Settings },
];

export default function AdminPage() {
  const [horseCount, setHorseCount] = useState<number | null>(null);
  const [userCount, setUserCount] = useState<number | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(HORSE_STORAGE_KEY);
      const horses: Horse[] = stored ? mergeHorseDefaults(JSON.parse(stored) as Horse[]) : initialHorses;
      setHorseCount(horses.length);
    } catch {
      setHorseCount(initialHorses.length);
    }
    try {
      const stored = window.localStorage.getItem("horse-portal-users-v1");
      const users: unknown = stored ? JSON.parse(stored) : [];
      setUserCount(Array.isArray(users) ? users.length : 0);
    } catch {
      setUserCount(0);
    }
  }, []);

  return (
    <main className="min-h-screen bg-[#f3f6f3] px-4 py-8 text-[#082f24] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-emerald-900 hover:underline">
          <ArrowLeft size={18} /> Portala dolan
        </Link>
        <div className="mb-4 flex justify-end"><AdminLogout /></div>
        <header className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#052b1f] via-[#0a503c] to-[#92702e] px-6 py-8 text-white sm:px-9">
          <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-amber-200">Atçylyk portal · Dolandyryş prototipi</p>
          <h1 className="text-3xl font-black sm:text-4xl">Admin panel</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85">Ulgamyň maglumatlaryny we bölümlerini bir ýerden dolandyrmak üçin başlangyç panel.</p>
        </header>

        <section role="status" className="mb-8 flex gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-950">
          <ShieldAlert className="mt-0.5 shrink-0" size={23} />
          <div>
            <h2 className="font-black">Üns beriň: häzirki etap diňe interfeýs prototipi</h2>
            <p className="mt-1 text-sm leading-6">Hakyky login, serwer tarapyndaky rugsat barlagy we merkezi maglumat bazasy entek birleşdirilmedi. Bu sahypa gizlin ýa-da goralan admin bölümi däldir. Aşakdaky baglanyşyklar häzirki ýerli maglumatly sahypalara eltýär.</p>
          </div>
        </section>

        <section aria-label="Ýerli görkezijiler" className="mb-8 grid gap-4 sm:grid-cols-3">
          <Stat label="Bu brauzerdäki atlar" value={horseCount === null ? "…" : String(horseCount)} />
          <Stat label="Bu brauzerdäki ulanyjylar" value={userCount === null ? "…" : String(userCount)} />
          <Stat label="Maglumatlaryň çeşmesi" value="Ýerli" />
        </section>

        <div className="mb-4 flex items-center gap-2">
          <Database size={21} />
          <h2 className="text-xl font-black">Dolandyryş bölümleri</h2>
        </div>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Dolandyryş ugurlary">
          {areas.map((area) => {
            const Icon = area.icon;
            return (
              <Link key={area.href} href={area.href} className="group rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-700/30 hover:shadow-md">
                <div className="mb-5 flex items-start justify-between">
                  <span className="rounded-xl bg-emerald-50 p-3 text-emerald-900"><Icon size={25} /></span>
                  <ArrowUpRight size={20} className="text-emerald-800/50 transition group-hover:text-emerald-800" />
                </div>
                <h3 className="font-black">{area.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{area.desc}</p>
              </Link>
            );
          })}
        </section>
        <p className="mt-8 text-xs leading-5 text-slate-600">Indiki tapgyr: serwer loginini, Admin/Operator/Weterinar/Gözegçi rollaryny we API rugsat barlaglaryny goşmak. Şondan soň diňe rugsatly adamlara redaktirleme mümkinçilikleri görkeziler.</p>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-600">{label}</p>
      <p className="mt-2 text-2xl font-black text-[#082f24]">{value}</p>
    </div>
  );
}
