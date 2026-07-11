"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Dna,
  FileDown,
  HeartPulse,
  MapPin,
  Network,
  ShieldCheck,
  Tag,
  Trophy,
} from "lucide-react";

import Breadcrumb from "../../../components/Breadcrumb";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";
import {
  HORSE_STORAGE_KEY,
  initialHorses,
  mergeHorseDefaults,
  type Horse,
} from "../../../lib/horses";

export default function AtProfilePage() {
  const params = useParams<{ id: string }>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [horse, setHorse] = useState<Horse | null | undefined>(undefined);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(HORSE_STORAGE_KEY);
      const horses = saved
        ? mergeHorseDefaults(JSON.parse(saved) as Horse[])
        : initialHorses;
      setHorse(horses.find((item) => item.id === params.id) ?? null);
    } catch {
      setHorse(initialHorses.find((item) => item.id === params.id) ?? null);
    }
  }, [params.id]);

  return (
    <div className="min-h-screen bg-slate-100 lg:flex">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="min-w-0 flex-1 border-[#93c5fd] sm:border-x-4 lg:border-x-[15px]">
        <Topbar setOpen={setSidebarOpen} />

        <main className="p-4 sm:p-6 lg:p-8">
          <Breadcrumb />

          {horse === undefined ? (
            <ProfileSkeleton />
          ) : horse === null ? (
            <NotFoundState />
          ) : (
            <HorseProfile horse={horse} />
          )}
        </main>
      </div>
    </div>
  );
}

function HorseProfile({ horse }: { horse: Horse }) {
  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/atlar" className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-[#0b5e3c] hover:underline">
            <ArrowLeft size={17} /> Atlar katalogyna dolan
          </Link>
          <h1 className="text-3xl font-bold text-[#0b2f24] lg:text-4xl">At pasporty</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/nesil" className="inline-flex items-center gap-2 rounded-xl border border-[#0b5e3c] bg-white px-5 py-3 font-semibold text-[#0b5e3c] hover:bg-emerald-50">
            <Network size={18} /> Nesil daragty
          </Link>
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-[#0b5e3c] px-5 py-3 font-semibold text-white hover:bg-[#08462d]">
            <FileDown size={18} /> PDF / Çap et
          </button>
        </div>
      </div>

      <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
        <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr]">
          <div className="relative min-h-[360px] bg-slate-200 xl:min-h-[520px]">
            <Image src={horse.image} alt={horse.name} fill priority sizes="(max-width: 1280px) 100vw, 420px" className="object-cover" />
            {horse.champion && (
              <span className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-sm font-bold text-amber-950 shadow-lg">
                <Trophy size={18} /> Çempion at
              </span>
            )}
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="mb-8 flex flex-col gap-4 border-b border-gray-100 pb-7 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-[#b58b2a]">{horse.code}</p>
                <h2 className="text-4xl font-bold text-[#0b2f24] sm:text-5xl">{horse.name}</h2>
                <p className="mt-3 text-lg font-semibold text-[#0b5e3c]">{horse.breed}</p>
              </div>
              <span className="w-fit rounded-xl bg-emerald-50 px-4 py-2 font-bold text-emerald-800">{horse.sex}</span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <InfoCard icon={<CalendarDays />} label="Doglan ýyly" value={String(horse.year)} />
              <InfoCard icon={<Tag />} label="Reňki" value={horse.color} />
              <InfoCard icon={<MapPin />} label="Doglan ýeri" value={horse.birthPlace ?? "Girizilmedik"} />
              <InfoCard icon={<ShieldCheck />} label="Mikroçip belgisi" value={horse.microchip ?? "Girizilmedik"} wide />
              <InfoCard icon={<Dna />} label="DNK ýagdaýy" value="Hasaba alnan" />
            </div>

            <div className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
              <div className="mb-4 flex items-center gap-3">
                <Network className="text-[#0b5e3c]" />
                <h3 className="text-xl font-bold text-[#0b2f24]">Nesil maglumatlary</h3>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <PedigreeItem label="Kakasy" value={horse.father ?? "Girizilmedik"} />
                <PedigreeItem label="Ejesi" value={horse.mother ?? "Girizilmedik"} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <StatusCard icon={<HeartPulse />} title="Saglyk ýagdaýy" value="Gowy" detail="Soňky barlag: maglumat girizilmedik" color="green" />
        <StatusCard icon={<Dna />} title="Genetiki maglumat" value="DNK profili bar" detail="Nesil seljermesine taýýar" color="blue" />
        <StatusCard icon={<ShieldCheck />} title="Hasaba alyş" value="Işjeň" detail={`Resmi ID: ${horse.code}`} color="amber" />
      </div>
    </>
  );
}

function InfoCard({ icon, label, value, wide = false }: { icon: React.ReactNode; label: string; value: string; wide?: boolean }) {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-gray-50 p-4 ${wide ? "xl:col-span-2" : ""}`}>
      <div className="mb-3 text-[#0b5e3c]">{icon}</div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 break-words font-bold text-gray-900">{value}</p>
    </div>
  );
}

function PedigreeItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-[#0b2f24]">{value}</p>
    </div>
  );
}

function StatusCard({ icon, title, value, detail, color }: { icon: React.ReactNode; title: string; value: string; detail: string; color: "green" | "blue" | "amber" }) {
  const colors = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
  };
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl border ${colors[color]}`}>{icon}</div>
      <h3 className="font-semibold text-gray-500">{title}</h3>
      <p className="mt-2 text-xl font-bold text-[#0b2f24]">{value}</p>
      <p className="mt-2 text-sm text-gray-500">{detail}</p>
    </section>
  );
}

function NotFoundState() {
  return (
    <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-20 text-center shadow-sm">
      <h1 className="text-3xl font-bold text-[#0b2f24]">At tapylmady</h1>
      <p className="mx-auto mt-3 max-w-md text-gray-500">Bu at pozulan ýa-da salgysy nädogry bolup biler.</p>
      <Link href="/atlar" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0b5e3c] px-5 py-3 font-semibold text-white hover:bg-[#08462d]">
        <ArrowLeft size={18} /> Kataloga dolan
      </Link>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-3xl bg-white shadow-sm">
      <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr]">
        <div className="min-h-[420px] bg-slate-200" />
        <div className="space-y-5 p-8">
          <div className="h-5 w-32 rounded bg-slate-200" />
          <div className="h-12 w-64 rounded bg-slate-200" />
          <div className="grid grid-cols-2 gap-4 pt-8">
            {[1, 2, 3, 4].map((item) => <div key={item} className="h-28 rounded-2xl bg-slate-100" />)}
          </div>
        </div>
      </div>
    </div>
  );
}
