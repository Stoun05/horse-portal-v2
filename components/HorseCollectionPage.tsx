"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Award,
  Eye,
  Landmark,
  MapPin,
  Network,
  Search,
  Trophy,
} from "lucide-react";

import Breadcrumb from "./Breadcrumb";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import {
  HORSE_STORAGE_KEY,
  initialHorses,
  mergeHorseDefaults,
  type Horse,
} from "../lib/horses";

type CollectionMode = "winners" | "arkadag";

export default function HorseCollectionPage({ mode }: { mode: CollectionMode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [horses, setHorses] = useState<Horse[]>(initialHorses);
  const [search, setSearch] = useState("");
  const [side, setSide] = useState<"Ählisi" | "Gündogar" | "Günbatar">("Ählisi");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(HORSE_STORAGE_KEY);
      if (saved) setHorses(mergeHorseDefaults(JSON.parse(saved) as Horse[]));
    } catch {
      setHorses(initialHorses);
    }
  }, []);

  const officialHorses = useMemo(
    () =>
      horses
        .filter((horse) => horse.sourceSide && horse.sourceNumber)
        .sort((a, b) => {
          if (a.sourceSide !== b.sourceSide) {
            return a.sourceSide === "Gündogar" ? -1 : 1;
          }
          return (a.sourceNumber ?? 0) - (b.sourceNumber ?? 0);
        }),
    [horses],
  );

  const collection = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("tk");
    return officialHorses.filter((horse) => {
      const modeMatches = mode === "winners" ? horse.champion : true;
      const sideMatches = side === "Ählisi" || horse.sourceSide === side;
      const searchMatches =
        !query ||
        horse.name.toLocaleLowerCase("tk").includes(query) ||
        horse.code.toLocaleLowerCase("tk").includes(query) ||
        horse.lineage?.toLocaleLowerCase("tk").includes(query) ||
        horse.description?.toLocaleLowerCase("tk").includes(query);
      return modeMatches && sideMatches && searchMatches;
    });
  }, [mode, officialHorses, search, side]);

  const isWinners = mode === "winners";
  const title = isWinners
    ? "Gözellik bäsleşiginiň ýeňijileri"
    : "Arkadag şäheriniň 24 aty";
  const subtitle = isWinners
    ? "Halkara we milli gözellik bäsleşiklerinde ýeňiji bolan ahalteke bedewleri."
    : "Arkadag şäherindäki seýilgähde ýerleşdirilen 24 sany ahalteke bedewiniň resmi sanawy.";

  return (
    <div className="min-h-screen bg-slate-100 lg:flex">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="min-w-0 flex-1 border-[#93c5fd] sm:border-x-4 lg:border-x-[15px]">
        <Topbar setOpen={setSidebarOpen} />

        <main className="p-4 sm:p-6 lg:p-8">
          <Breadcrumb />

          <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#052b1f] via-[#0b5e3c] to-[#b58b2a] p-6 text-white shadow-lg sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                  {isWinners ? <Award size={30} /> : <Landmark size={30} />}
                </div>
                <h1 className="text-3xl font-black sm:text-4xl">{title}</h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-white/85">{subtitle}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Stat label={isWinners ? "Ýeňijiler" : "Jemi atlar"} value={isWinners ? officialHorses.filter((horse) => horse.champion).length : officialHorses.length} />
                <Stat label="Nesil ugurlary" value={new Set(officialHorses.map((horse) => horse.lineage).filter(Boolean)).size} />
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-2xl bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <label className="relative block w-full lg:max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Atyň ady, ID-si ýa-da nesil ugry boýunça gözle..."
                  className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 text-gray-900 outline-none focus:border-[#0b5e3c] focus:ring-2 focus:ring-emerald-100"
                />
              </label>

              <div className="flex flex-wrap gap-2">
                {(["Ählisi", "Gündogar", "Günbatar"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setSide(item)}
                    className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                      side === item
                        ? "bg-[#0b5e3c] text-white"
                        : "border border-gray-200 bg-white text-gray-700 hover:bg-emerald-50"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <div className="mb-4 mt-6 flex items-center justify-between">
            <p className="font-semibold text-gray-600">
              Netije: <span className="text-[#0b5e3c]">{collection.length} at</span>
            </p>
            {!isWinners && (
              <p className="hidden text-sm font-semibold text-gray-500 sm:block">
                Gündogar 12 · Günbatar 12
              </p>
            )}
          </div>

          {collection.length ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {collection.map((horse) => (
                <HorseCard key={horse.id} horse={horse} showChampion={isWinners} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
              <Search className="mx-auto text-gray-300" size={44} />
              <h2 className="mt-4 text-xl font-bold text-[#0b2f24]">At tapylmady</h2>
              <p className="mt-2 text-gray-500">Gözleg sözüni ýa-da tarap saýlawyny üýtgedip görüň.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-[125px] rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-sm">
      <p className="text-3xl font-black">{value}</p>
      <p className="mt-1 text-sm font-semibold text-white/75">{label}</p>
    </div>
  );
}

function HorseCard({
  horse,
  showChampion,
}: {
  horse: Horse;
  showChampion: boolean;
}) {
  return (
    <article className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-[#0b2f24] via-[#0b5e3c] to-[#b58b2a]">
        {horse.image ? (
          <Image
            src={horse.image}
            alt={horse.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-7xl font-black text-white/20">
            {horse.name.slice(0, 1)}
          </div>
        )}
        {horse.champion && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-amber-950 shadow">
            <Trophy size={14} /> {showChampion ? "Ýeňiji" : "Çempion"}
          </span>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-slate-950/65 px-3 py-1 text-xs font-bold text-white backdrop-blur">
          {horse.sourceSide} №{horse.sourceNumber}
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-[#0b2f24]">{horse.name}</h2>
            <p className="mt-1 font-semibold text-[#0b5e3c]">{horse.lineage ?? "Nesil ugry girizilmedik"}</p>
          </div>
          <span className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-800">
            {horse.year}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-gray-600">
          <MapPin size={16} className="text-[#b58b2a]" />
          {horse.code} · {horse.color}
        </div>

        {showChampion && (
          <p className="mt-4 line-clamp-3 min-h-[60px] text-sm leading-5 text-gray-600">
            {horse.description || "Ýeňiş barada maglumat girizilmedik."}
          </p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Link
            href={`/atlar/${horse.id}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b5e3c] px-3 py-2.5 text-sm font-bold text-white hover:bg-[#08462d]"
          >
            <Eye size={17} /> Pasporty
          </Link>
          <Link
            href={`/nesil?horse=${encodeURIComponent(horse.id)}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#0b5e3c] px-3 py-2.5 text-sm font-bold text-[#0b5e3c] hover:bg-emerald-50"
          >
            <Network size={17} /> Nesil daragty
          </Link>
        </div>
      </div>
    </article>
  );
}
