"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import Breadcrumb from "../../components/Breadcrumb";
import { useHorseCatalog } from "../../lib/useHorseCatalog";
import {
  FileVideo,
  Image as ImageIcon,
  Maximize2,
  Play,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";

type MediaKind = "image" | "video";

type StoredMedia = {
  id: string;
  horseId: string;
  title: string;
  kind: MediaKind;
  file: Blob;
  fileName: string;
  createdAt: string;
};

type MediaItem = StoredMedia & { url: string; source?: "github" | "local" };
type GitHubMedia = { id: string; slug: string; kind: MediaKind; title: string; fileName: string; url: string };

const DB_NAME = "horse-portal-media";
const STORE_NAME = "media";
const DB_VERSION = 1;

export default function MediaPage() {
  const [open, setOpen] = useState(false);
  const { horses, hydrated: horsesHydrated } = useHorseCatalog();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [mediaHydrated, setMediaHydrated] = useState(false);
  const [query, setQuery] = useState("");
  const [horseFilter, setHorseFilter] = useState("all");
  const [kindFilter, setKindFilter] = useState<"all" | MediaKind>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [horseId, setHorseId] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [lightbox, setLightbox] = useState<MediaItem | null>(null);

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      loadMedia(),
      fetch("https://api.github.com/repos/Stoun05/horse-portal-v2/git/trees/main?recursive=1").then(async (response) => {
        if (!response.ok) throw new Error("GitHub media list unavailable");
        const data = (await response.json()) as { tree?: { path: string; type: string }[]; truncated?: boolean };
        if (data.truncated) throw new Error("GitHub file list incomplete");
        const imageExt = /\.(png|jpe?g|webp|gif|avif)$/i;
        const videoExt = /\.(mp4|webm|mov|m4v)$/i;
        const media: GitHubMedia[] = (data.tree ?? []).filter((entry) =>
          entry.type === "blob" && entry.path.startsWith("public/horses/")
        ).flatMap((entry) => {
          const relative = entry.path.slice("public/horses/".length);
          const parts = relative.split("/");
          const filename = parts[parts.length - 1];
          const kind: MediaKind | null = imageExt.test(filename) ? "image" : videoExt.test(filename) ? "video" : null;
          if (!kind) return [];
          if (parts.length !== 1 && !(parts.length === 3 && (parts[1] === "photos" || parts[1] === "videos"))) return [];
          if (parts.length === 3 && ((parts[1] === "photos" && kind !== "image") || (parts[1] === "videos" && kind !== "video"))) return [];
          const slug = parts.length === 1 ? filename.replace(/\.[^.]+$/, "").toLowerCase() : parts[0].toLowerCase();
          return [{
            id: "github:" + entry.path,
            slug,
            kind,
            title: filename.replace(/\.[^.]+$/, ""),
            fileName: filename,
            url: "https://raw.githubusercontent.com/Stoun05/horse-portal-v2/main/" + entry.path.split("/").map(encodeURIComponent).join("/"),
          }];
        });
        return { items: media };
      }),
    ]).then(([local, remote]) => {
      if (!active) return;
      const saved = local.status === "fulfilled"
        ? local.value.map((item) => ({ ...item, url: URL.createObjectURL(item.file), source: "local" as const }))
        : [];
      const github = remote.status === "fulfilled"
        ? remote.value.items.map((item) => ({
            id: item.id,
            horseId: item.slug === "akhan" ? "media-akhan" : "slug:" + item.slug,
            title: item.title,
            kind: item.kind,
            file: new Blob(),
            fileName: item.fileName,
            createdAt: "",
            url: item.url,
            source: "github" as const,
          }))
        : [];
      setItems([...saved, ...github]);
      setMediaHydrated(true);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!horseId && horses.length) setHorseId(horses[0].id);
  }, [horseId, horses]);

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightbox(null);
        setModalOpen(false);
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  const horseForItem = (item: MediaItem) => {
    if (item.horseId.startsWith("slug:")) {
      const slug = item.horseId.slice(5);
      return horses.find((horse) => horse.id.endsWith("-" + slug));
    }
    return horses.find((horse) => horse.id === item.horseId);
  };
  const getHorseName = (item: MediaItem) =>
    item.horseId === "media-akhan" ? "Akhan" : horseForItem(item)?.name || item.horseId.replace(/^slug:/, "");

  const availableFilters = useMemo(() => {
    const extra = items.filter((item) => item.source === "github").map((item) => ({
      id: item.horseId,
      label: getHorseName(item),
    }));
    return [...new Map(extra.map((item) => [item.id, item])).values()];
  }, [items, horses]);

  const visibleItems = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("tk");
    return items.filter((item) => {
      const horse = horseForItem(item);
      const matchesHorse = horseFilter === "all" ||
        item.horseId === horseFilter ||
        (item.horseId.startsWith("slug:") && horse?.id === horseFilter);
      const matchesKind = kindFilter === "all" || item.kind === kindFilter;
      const matchesQuery =
        !normalized ||
        [item.title, item.fileName, getHorseName(item), horse?.code]
          .join(" ")
          .toLocaleLowerCase("tk")
          .includes(normalized);
      return matchesHorse && matchesKind && matchesQuery;
    });
  }, [horseFilter, horses, items, kindFilter, query]);

  const openUpload = () => {
    setHorseId(horseFilter !== "all" ? horseFilter : horses[0]?.id || "");
    setTitle("");
    setFile(null);
    setModalOpen(true);
  };

  const saveMedia = async (event: FormEvent) => {
    event.preventDefault();
    if (!file || !horseId) return;
    const kind: MediaKind = file.type.startsWith("video/") ? "video" : "image";
    const record: StoredMedia = {
      id: crypto.randomUUID(),
      horseId,
      title: title.trim() || file.name,
      kind,
      file,
      fileName: file.name,
      createdAt: new Date().toISOString(),
    };
    setSaving(true);
    try {
      await putMedia(record);
      const next = { ...record, url: URL.createObjectURL(file) };
      setItems((current) => [next, ...current]);
      setModalOpen(false);
    } catch {
      window.alert("Faýly saklamak başartmady. Brauzeriň boş ýerini barlaň.");
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (item: MediaItem) => {
    if (item.source === "github") return;
    if (!window.confirm("Bu media faýlyny pozmalymy?")) return;
    await removeMedia(item.id);
    URL.revokeObjectURL(item.url);
    setItems((current) => current.filter((entry) => entry.id !== item.id));
    if (lightbox?.id === item.id) setLightbox(null);
  };

  const imageCount = items.filter((item) => item.kind === "image").length;
  const videoCount = items.filter((item) => item.kind === "video").length;

  return (
    <div className="min-h-screen bg-[#f4f7f5] lg:flex">
      <Sidebar open={open} setOpen={setOpen} />
      <div className="min-w-0 flex-1 border-x-0 border-[#93c5fd] sm:border-x-4 lg:border-x-[15px]">
        <Topbar setOpen={setOpen} />

        <main className="p-4 sm:p-6 lg:p-8">
          <Breadcrumb />

          <header className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-3xl font-black text-[#082f24] lg:text-4xl">Wideo / Suratlar</h1>
              <p className="mt-2 font-medium text-slate-600">
                Her at boýunça GitHub suratlaryny we brauzerdäki media faýllaryny görüň.
              </p>
            </div>
            <button
              onClick={openUpload}
              disabled={!horses.length}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b5e3c] px-5 py-3 font-bold text-white hover:bg-[#08462d] disabled:opacity-50"
            >
              <Upload size={18} /> Media goş
            </button>
          </header>

          <section className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat icon={<ImageIcon />} title="Suratlar" value={imageCount} />
            <Stat icon={<FileVideo />} title="Wideolar" value={videoCount} />
            <Stat icon={<Upload />} title="Jemi media" value={items.length} />
            <Stat icon={<Search />} title="Media goşulan atlar" value={new Set(items.map((item) => item.horseId)).size} />
          </section>

          <section className="mb-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_220px]">
              <label className="relative block">
                <span className="sr-only">Gözle</span>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="At ady, ID ýa-da media ady boýunça gözle..."
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-3 text-slate-950 outline-none placeholder:text-slate-400 focus:border-[#0b5e3c] focus:ring-2 focus:ring-emerald-100"
                />
              </label>
              <select
                value={horseFilter}
                onChange={(event) => setHorseFilter(event.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-3 font-semibold text-slate-950 outline-none focus:border-[#0b5e3c]"
              >
                <option value="all">Ähli atlar ({horses.length})</option>
                {horses.map((horse) => (
                  <option key={horse.id} value={horse.id}>{horse.name} — {horse.code}</option>
                ))}
                {availableFilters.filter((item) => item.id === "media-akhan" || (item.id.startsWith("slug:") && !horses.some((horse) => horse.id.endsWith("-" + item.id.slice(5))))).map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
              <select
                value={kindFilter}
                onChange={(event) => setKindFilter(event.target.value as "all" | MediaKind)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-3 font-semibold text-slate-950 outline-none focus:border-[#0b5e3c]"
              >
                <option value="all">Surat we wideo</option>
                <option value="image">Diňe suratlar</option>
                <option value="video">Diňe wideolar</option>
              </select>
            </div>
          </section>

          {!horsesHydrated || !mediaHydrated ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-14 text-center font-semibold text-slate-600">
              Media maglumatlary ýüklenýär...
            </div>
          ) : visibleItems.length ? (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-black text-[#082f24]">Media galereýasy</h2>
                <p className="text-sm font-semibold text-slate-600">{visibleItems.length} faýl</p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {visibleItems.map((item) => {
                  const horse = horseForItem(item);
                  return (
                    <article key={item.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                      <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
                        {item.kind === "image" ? (
                          <button onClick={() => setLightbox(item)} className="h-full w-full cursor-zoom-in" aria-label="Suraty uly aç">
                            <img src={item.url} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                          </button>
                        ) : (
                          <video src={item.url} controls preload="metadata" className="h-full w-full object-contain">
                            Brauzeriňiz wideony görkezip bilenok.
                          </video>
                        )}
                        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-slate-950/75 px-3 py-1 text-xs font-black text-white">
                          {item.kind === "image" ? <ImageIcon size={14} /> : <Play size={14} />}
                          {item.kind === "image" ? "Surat" : "Wideo"}
                        </span>
                        {item.kind === "image" && (
                          <button onClick={() => setLightbox(item)} className="absolute bottom-3 right-3 rounded-lg bg-white/90 p-2 text-slate-900 shadow hover:bg-white" aria-label="Uly görnüş">
                            <Maximize2 size={17} />
                          </button>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-lg font-black text-slate-950">{item.title}</h3>
                            <p className="mt-1 font-bold text-[#0b5e3c]">{getHorseName(item)}</p>
                            <p className="mt-1 text-xs font-semibold text-slate-500">
                              {horse?.code || (item.source === "github" ? "GitHub" : "ID ýok")} · {item.source === "github" ? "GitHub faýly" : formatDate(item.createdAt)}
                            </p>
                          </div>
                          {item.source !== "github" && <button onClick={() => deleteItem(item)} className="shrink-0 rounded-lg border border-rose-200 p-2 text-rose-700 hover:bg-rose-50" aria-label="Media poz">
                            <Trash2 size={17} />
                          </button>}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : (
            <section className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
              <ImageIcon className="mx-auto text-emerald-700" size={48} />
              <h2 className="mt-4 text-2xl font-black text-slate-950">Media tapylmady</h2>
              <p className="mx-auto mt-2 max-w-xl text-slate-600">
                Demo suratlar we wideolar aýryldy. Saýlanan at üçin hakyky surat ýa-da wideo goşuň.
              </p>
              <button onClick={openUpload} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0b5e3c] px-5 py-3 font-bold text-white">
                <Upload size={18} /> Ilkinji media faýlyny goş
              </button>
            </section>
          )}
        </main>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-2xl font-black text-[#082f24]">Media goş</h2>
                <p className="text-sm text-slate-600">Suraty ýa-da wideony degişli ata baglaň.</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-2 text-slate-700 hover:bg-slate-100"><X /></button>
            </div>
            <form onSubmit={saveMedia} className="space-y-4 p-5">
              <Field label="At">
                <select required value={horseId} onChange={(event) => setHorseId(event.target.value)} className={inputClass}>
                  {horses.map((horse) => <option key={horse.id} value={horse.id}>{horse.name} — {horse.code}</option>)}
                </select>
              </Field>
              <Field label="Media ady">
                <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Mysal: Akýol — türgenleşik" className={inputClass} />
              </Field>
              <Field label="Surat ýa-da wideo faýly">
                <input
                  required
                  type="file"
                  accept="image/*,video/*"
                  onChange={(event) => setFile(event.target.files?.[0] || null)}
                  className="w-full rounded-xl border border-dashed border-slate-400 bg-slate-50 p-4 text-sm font-semibold text-slate-800 file:mr-4 file:rounded-lg file:border-0 file:bg-[#0b5e3c] file:px-4 file:py-2 file:font-bold file:text-white"
                />
              </Field>
              {file && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-950">
                  {file.name} · {formatBytes(file.size)}
                </div>
              )}
              <p className="text-xs leading-5 text-slate-500">
                Faýl şu brauzeriň IndexedDB ammarynda saklanýar. Örän uly wideo üçin brauzerde ýeterlik boş ýer bolmaly.
              </p>
              <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-800">Ýatyr</button>
                <button disabled={saving || !file} type="submit" className="rounded-xl bg-[#0b5e3c] px-6 py-3 font-bold text-white disabled:opacity-50">
                  {saving ? "Saklanýar..." : "Ýatda sakla"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 p-4" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} className="absolute right-5 top-5 rounded-full bg-white/15 p-3 text-white hover:bg-white/25" aria-label="Ýap"><X /></button>
          <div className="max-h-full max-w-6xl" onClick={(event) => event.stopPropagation()}>
            <img src={lightbox.url} alt={lightbox.title} className="max-h-[82vh] max-w-full rounded-xl object-contain" />
            <div className="mt-4 text-center text-white">
              <h3 className="text-xl font-black">{lightbox.title}</h3>
              <p className="mt-1 text-sm text-white/75">{getHorseName(lightbox)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputClass = "w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-950 outline-none placeholder:text-slate-400 focus:border-[#0b5e3c] focus:ring-2 focus:ring-emerald-100";

function Stat({ icon, title, value }: { icon: ReactNode; title: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-[#0b5e3c]">{icon}</div>
      <p className="text-sm font-semibold text-slate-600">{title}</p>
      <p className="mt-1 text-3xl font-black text-[#082f24]">{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-800">{label}</span>
      {children}
    </label>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tk-TM", { dateStyle: "medium" }).format(new Date(value));
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function loadMedia() {
  const database = await openDatabase();
  return new Promise<StoredMedia[]>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result as StoredMedia[]);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
  });
}

async function putMedia(item: StoredMedia) {
  const database = await openDatabase();
  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(item);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => reject(transaction.error);
  });
}

async function removeMedia(id: string) {
  const database = await openDatabase();
  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).delete(id);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => reject(transaction.error);
  });
}
