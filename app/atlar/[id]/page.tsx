"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { type ChangeEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  Camera,
  CalendarDays,
  Dna,
  FileDown,
  HeartPulse,
  MapPin,
  Network,
  Pencil,
  Save,
  ShieldCheck,
  Tag,
  Trash2,
  Trophy,
  Upload,
  X,
  ZoomIn,
} from "lucide-react";

import Breadcrumb from "../../../components/Breadcrumb";
import { assetPath } from "../../../lib/assetPath";
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

  const updateHorse = (changes: Partial<Horse>) => {
    if (!horse) return false;

    try {
      const saved = window.localStorage.getItem(HORSE_STORAGE_KEY);
      const horses = saved
        ? mergeHorseDefaults(JSON.parse(saved) as Horse[])
        : initialHorses;
      const updatedHorse = { ...horse, ...changes };
      const updatedHorses = horses.map((item) =>
        item.id === horse.id ? updatedHorse : item,
      );

      window.localStorage.setItem(HORSE_STORAGE_KEY, JSON.stringify(updatedHorses));
      setHorse(updatedHorse);
      return true;
    } catch {
      window.alert("Üýtgeşmäni saklamak başartmady. Täzeden synanyşyň.");
      return false;
    }
  };

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
            <HorseProfile
              horse={horse}
              onImageChange={(image) => updateHorse({ image })}
              onDescriptionChange={(description) => updateHorse({ description })}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function HorseProfile({
  horse,
  onImageChange,
  onDescriptionChange,
}: {
  horse: Horse;
  onImageChange: (image?: string) => boolean;
  onDescriptionChange: (description: string) => boolean;
}) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [sourceImage, setSourceImage] = useState("");
  const [zoom, setZoom] = useState(1);
  const [positionX, setPositionX] = useState(50);
  const [positionY, setPositionY] = useState(50);
  const [processing, setProcessing] = useState(false);
  const [editorError, setEditorError] = useState("");
  const [descriptionEditing, setDescriptionEditing] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState(horse.description ?? "");

  const openEditor = () => {
    setSourceImage(horse.image ?? "");
    setZoom(1);
    setPositionX(50);
    setPositionY(50);
    setEditorError("");
    setEditorOpen(true);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setEditorError("Diňe JPG, PNG ýa-da başga surat faýlyny saýlaň.");
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      setEditorError("Suratyň göwrümi 12 MB-dan uly bolmaly däl.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSourceImage(String(reader.result ?? ""));
      setZoom(1);
      setPositionX(50);
      setPositionY(50);
      setEditorError("");
    };
    reader.onerror = () => setEditorError("Suraty açmak başartmady.");
    reader.readAsDataURL(file);
  };

  const saveImage = async () => {
    if (!sourceImage) return;
    setProcessing(true);
    setEditorError("");

    try {
      const compressed = await cropAndCompressImage(
        sourceImage,
        zoom,
        positionX,
        positionY,
      );
      if (onImageChange(compressed)) setEditorOpen(false);
    } catch {
      setEditorError("Suraty taýýarlamak başartmady. Başga surat saýlap görüň.");
    } finally {
      setProcessing(false);
    }
  };

  const removeImage = () => {
    if (!window.confirm("Bu atyň esasy suratyny pozmalymy?")) return;
    if (onImageChange(undefined)) {
      setSourceImage("");
      setEditorOpen(false);
    }
  };

  const saveDescription = () => {
    if (onDescriptionChange(descriptionDraft.trim())) {
      setDescriptionEditing(false);
    }
  };

  const cancelDescriptionEdit = () => {
    setDescriptionDraft(horse.description ?? "");
    setDescriptionEditing(false);
  };

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
          <Link href={`/nesil?horse=${encodeURIComponent(horse.id)}`} className="inline-flex items-center gap-2 rounded-xl border border-[#0b5e3c] bg-white px-5 py-3 font-semibold text-[#0b5e3c] hover:bg-emerald-50">
            <Network size={18} /> Nesil daragty
          </Link>
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-[#0b5e3c] px-5 py-3 font-semibold text-white hover:bg-[#08462d]">
            <FileDown size={18} /> PDF / Çap et
          </button>
        </div>
      </div>

      <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
        <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr]">
          <div className="relative min-h-[360px] overflow-hidden bg-gradient-to-br from-[#0b2f24] via-[#0b5e3c] to-[#b58b2a] xl:min-h-[520px]">
            {horse.image ? (
              <Image src={assetPath(horse.image)} alt={horse.name} fill priority sizes="(max-width: 1280px) 100vw, 420px" className="object-cover" />
            ) : (
              <div className="flex min-h-[520px] items-center justify-center text-[12rem] font-black text-white/15">{horse.name.slice(0, 1)}</div>
            )}
            <button
              type="button"
              onClick={openEditor}
              className="absolute bottom-5 right-5 z-10 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 font-bold text-[#0b2f24] shadow-xl transition hover:bg-emerald-50 print:hidden"
              aria-label="Esasy suraty üýtget"
            >
              <Camera size={19} /> Suraty üýtget
            </button>
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
              <InfoCard icon={<MapPin />} label="Sanawdaky ýeri" value={horse.sourceSide && horse.sourceNumber ? `${horse.sourceSide} tarap — №${horse.sourceNumber}` : "Girizilmedik"} />
              <InfoCard icon={<ShieldCheck />} label="Beden ölçegleri" value={horse.bodyMeasurements ?? "Girizilmedik"} wide />
              <InfoCard icon={<Dna />} label="Tohumçylyk gymmaty" value={horse.breedingValue ?? "Girizilmedik"} />
              <InfoCard icon={<Trophy />} label="Klasy" value={horse.horseClass ?? "Girizilmedik"} />
            </div>

            <div className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
              <div className="mb-4 flex items-center gap-3">
                <Network className="text-[#0b5e3c]" />
                <h3 className="text-xl font-bold text-[#0b2f24]">Nesil maglumatlary</h3>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <PedigreeItem label="Nesil ugry" value={horse.lineage ?? "Girizilmedik"} />
                <PedigreeItem label="Atasy" value={horse.father ?? "Girizilmedik"} />
                <PedigreeItem label="Enesi" value={horse.mother ?? "Girizilmedik"} />
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50/70 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-bold text-[#0b2f24]">Bedew barada</h3>
                {!descriptionEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setDescriptionDraft(horse.description ?? "");
                      setDescriptionEditing(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-bold text-amber-800 hover:bg-amber-50 print:hidden"
                  >
                    <Pencil size={16} /> Üýtget
                  </button>
                )}
              </div>

              {descriptionEditing ? (
                <div className="mt-4 print:hidden">
                  <textarea
                    value={descriptionDraft}
                    onChange={(event) => setDescriptionDraft(event.target.value)}
                    rows={6}
                    maxLength={3000}
                    placeholder="Bedewiň taryhy, üstünlikleri we aýratynlyklary barada ýazyň..."
                    className="w-full resize-y rounded-xl border border-amber-200 bg-white px-4 py-3 leading-7 text-gray-900 outline-none focus:border-[#0b5e3c] focus:ring-2 focus:ring-emerald-100"
                  />
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-gray-500">
                      {descriptionDraft.length} / 3000 nyşan
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={cancelDescriptionEdit}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"
                      >
                        Ýatyr
                      </button>
                      <button
                        type="button"
                        onClick={saveDescription}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#0b5e3c] px-4 py-2 text-sm font-bold text-white hover:bg-[#08462d]"
                      >
                        <Save size={16} /> Sakla
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-3 whitespace-pre-wrap leading-7 text-gray-800">
                  {horse.description || "Bu bedew barada maglumat girizilmedik."}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <StatusCard icon={<HeartPulse />} title="Beden ölçegleri" value={horse.bodyMeasurements ?? "Girizilmedik"} detail="Çeşme: iberilen resmi sanaw" color="green" />
        <StatusCard icon={<Dna />} title="Nesil ugry" value={horse.lineage ?? "Girizilmedik"} detail="Şejere maglumatlary pasportda görkezilýär" color="blue" />
        <StatusCard icon={<ShieldCheck />} title="Sanawdaky belgisi" value={horse.code} detail="Portal üçin içerki sanaw belgisi" color="amber" />
      </div>

      {editorOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 print:hidden">
          <div className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-gray-200 p-5 sm:p-6">
              <div>
                <h2 className="text-2xl font-bold text-[#0b2f24]">Esasy suraty üýtget</h2>
                <p className="mt-1 text-sm text-gray-600">
                  {horse.name} üçin suraty saýlaň, ýerleşişini sazlaň we saklaň.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
                aria-label="Ýap"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
              <div>
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-[#0b2f24] via-[#0b5e3c] to-[#b58b2a]">
                  {sourceImage ? (
                    <img
                      src={sourceImage}
                      alt="Suratyň öňünden görnüşi"
                      className="h-full w-full object-cover transition-transform"
                      style={{
                        objectPosition: `${positionX}% ${positionY}%`,
                        transform: `scale(${zoom})`,
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-center text-white/80">
                      <div>
                        <Camera className="mx-auto mb-3" size={42} />
                        <p className="font-semibold">Surat saýlanmady</p>
                      </div>
                    </div>
                  )}
                </div>
                <p className="mt-3 text-sm text-gray-500">
                  Saklananda surat awtomatik 900 × 900 ölçegine getirilýär we gysylýar.
                </p>
              </div>

              <div className="space-y-5">
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0b5e3c] px-5 py-3 font-bold text-white hover:bg-[#08462d]">
                  <Upload size={19} />
                  Kompýuterden surat saýla
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>

                {editorError && (
                  <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">
                    {editorError}
                  </p>
                )}

                <PhotoRange
                  label="Ulaltmak / kiçeltmek"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.05}
                  onChange={setZoom}
                  icon={<ZoomIn size={18} />}
                />
                <PhotoRange
                  label="Çep / sag ýerleşişi"
                  value={positionX}
                  min={0}
                  max={100}
                  step={1}
                  onChange={setPositionX}
                />
                <PhotoRange
                  label="Ýokary / aşak ýerleşişi"
                  value={positionY}
                  min={0}
                  max={100}
                  step={1}
                  onChange={setPositionY}
                />

                <div className="grid gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-1">
                  <button
                    type="button"
                    onClick={saveImage}
                    disabled={!sourceImage || processing}
                    className="rounded-xl bg-[#0b5e3c] px-5 py-3 font-bold text-white hover:bg-[#08462d] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {processing ? "Taýýarlanýar..." : "Suraty sakla"}
                  </button>
                  {horse.image && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 font-bold text-red-700 hover:bg-red-100"
                    >
                      <Trash2 size={18} /> Suraty ýok et
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function PhotoRange({
  label,
  value,
  min,
  max,
  step,
  onChange,
  icon,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  icon?: React.ReactNode;
}) {
  return (
    <label className="block rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <span className="mb-3 flex items-center justify-between gap-3 font-semibold text-gray-800">
        <span className="flex items-center gap-2">{icon}{label}</span>
        <span className="text-sm text-[#0b5e3c]">
          {step < 1 ? value.toFixed(2) : Math.round(value)}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-[#0b5e3c]"
      />
    </label>
  );
}

async function cropAndCompressImage(
  source: string,
  zoom: number,
  positionX: number,
  positionY: number,
) {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const item = new window.Image();
    item.onload = () => resolve(item);
    item.onerror = reject;
    item.src = source;
  });

  const size = 900;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable");

  const baseScale = Math.max(size / image.naturalWidth, size / image.naturalHeight);
  const scale = baseScale * zoom;
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  const overflowX = Math.max(0, width - size);
  const overflowY = Math.max(0, height - size);
  const x = -overflowX * (positionX / 100);
  const y = -overflowY * (positionY / 100);

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, size, size);
  context.drawImage(image, x, y, width, height);

  return canvas.toDataURL("image/jpeg", 0.8);
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
