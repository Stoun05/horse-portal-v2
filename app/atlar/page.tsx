"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Eye,
  Network,
  Pencil,
  Plus,
  Search,
  Trash2,
  Trophy,
  X,
} from "lucide-react";

import Breadcrumb from "../../components/Breadcrumb";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import {
  HORSE_STORAGE_KEY,
  initialHorses,
  mergeHorseDefaults,
  type Horse,
  type HorseForm,
} from "../../lib/horses";

const emptyForm: HorseForm = {
  name: "",
  breed: "Ahalteke",
  sex: "At",
  color: "Mele",
  year: new Date().getFullYear(),
  code: "",
  image: "",
  champion: false,
};

export default function AtlarPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [horses, setHorses] = useState<Horse[]>(initialHorses);
  const [hydrated, setHydrated] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<HorseForm>(emptyForm);
  const [search, setSearch] = useState("");
  const [breed, setBreed] = useState("Ähli tohumlar");
  const [sex, setSex] = useState("Ähli jynslar");
  const [color, setColor] = useState("Ähli reňkler");
  const [sort, setSort] = useState("name");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(HORSE_STORAGE_KEY);
      if (saved) setHorses(mergeHorseDefaults(JSON.parse(saved) as Horse[]));
    } catch {
      // Nädogry lokal maglumat bolsa başlangyç sanaw ulanylýar.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(HORSE_STORAGE_KEY, JSON.stringify(horses));
  }, [horses, hydrated]);

  const visibleHorses = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("tk");
    const result = horses.filter((horse) => {
      const matchesSearch =
        !query ||
        horse.name.toLocaleLowerCase("tk").includes(query) ||
        horse.code.toLocaleLowerCase("tk").includes(query) ||
        horse.breed.toLocaleLowerCase("tk").includes(query) ||
        horse.lineage?.toLocaleLowerCase("tk").includes(query) ||
        horse.father?.toLocaleLowerCase("tk").includes(query) ||
        horse.mother?.toLocaleLowerCase("tk").includes(query);
      return (
        matchesSearch &&
        (breed === "Ähli tohumlar" || horse.breed === breed) &&
        (sex === "Ähli jynslar" || horse.sex === sex) &&
        (color === "Ähli reňkler" || horse.color === color)
      );
    });

    return result.sort((a, b) => {
      if (sort === "year-new") return b.year - a.year;
      if (sort === "year-old") return a.year - b.year;
      if (sort === "breed") return a.breed.localeCompare(b.breed, "tk");
      return a.name.localeCompare(b.name, "tk");
    });
  }, [horses, search, breed, sex, color, sort]);

  function openCreateModal() {
    setEditingId(null);
    setForm({ ...emptyForm, code: `AT-${new Date().getFullYear()}-` });
    setModalOpen(true);
  }

  function openEditModal(horse: Horse) {
    const { id, ...values } = horse;
    setEditingId(id);
    setForm(values);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function saveHorse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (editingId) {
      setHorses((current) =>
        current.map((horse) =>
          horse.id === editingId ? { id: editingId, ...form } : horse,
        ),
      );
    } else {
      setHorses((current) => [
        { id: crypto.randomUUID(), ...form },
        ...current,
      ]);
    }
    closeModal();
  }

  function deleteHorse(horse: Horse) {
    if (window.confirm(`${horse.name} atly aty sanawdan pozmalymy?`)) {
      setHorses((current) => current.filter((item) => item.id !== horse.id));
    }
  }

  function resetFilters() {
    setSearch("");
    setBreed("Ähli tohumlar");
    setSex("Ähli jynslar");
    setColor("Ähli reňkler");
    setSort("name");
  }

  return (
    <div className="min-h-screen bg-slate-100 lg:flex">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="min-w-0 flex-1 border-[#93c5fd] sm:border-x-4 lg:border-x-[15px]">
        <Topbar setOpen={setSidebarOpen} />

        <main className="p-4 sm:p-6 lg:p-8">
          <Breadcrumb />

          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#0b2f24]">Atlar katalogy</h1>
              <p className="mt-2 text-gray-500">
                Jemi atlar: <b className="text-[#0b5e3c]">{horses.length}</b>
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateModal}
              className="flex w-fit items-center gap-2 rounded-xl bg-[#0b5e3c] px-5 py-3 font-semibold text-white transition hover:bg-[#08462d] focus:outline-none focus:ring-4 focus:ring-emerald-200"
            >
              <Plus size={19} /> Täze at goş
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
            <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-2xl font-bold text-[#0b2f24]">Filtrler</h2>
              <div className="space-y-5">
                <FilterSelect label="Tohum" value={breed} onChange={setBreed} options={["Ähli tohumlar", ...Array.from(new Set(horses.map((horse) => horse.breed)))]} />
                <FilterSelect label="Görnüşi" value={sex} onChange={setSex} options={["Ähli jynslar", ...Array.from(new Set(horses.map((horse) => horse.sex)))]} />
                <FilterSelect label="Reňk" value={color} onChange={setColor} options={["Ähli reňkler", ...Array.from(new Set(horses.map((horse) => horse.color)))]} />
                <button type="button" onClick={resetFilters} className="w-full rounded-xl border border-[#b58b2a] py-3 font-semibold text-[#9b741d] transition hover:bg-amber-50">
                  Täzeden başla
                </button>
              </div>
            </aside>

            <section className="min-w-0">
              <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <label className="relative block w-full md:max-w-[440px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Ady, ID ýa-da tohumy boýunça gözle..."
                    className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-5 text-gray-900 outline-none focus:border-[#0b5e3c] focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
                <select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-gray-800 outline-none focus:border-[#0b5e3c]">
                  <option value="name">Ady boýunça (A–Ý)</option>
                  <option value="year-new">Täze doglanlar ilki</option>
                  <option value="year-old">Köne doglanlar ilki</option>
                  <option value="breed">Tohumy boýunça</option>
                </select>
              </div>

              <p className="mb-4 text-sm font-medium text-gray-500">
                Netije: {visibleHorses.length} at
              </p>

              {visibleHorses.length ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {visibleHorses.map((horse) => (
                    <article key={horse.id} className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-[#0b2f24] via-[#0b5e3c] to-[#b58b2a]">
                        {horse.image ? (
                          <Image src={horse.image} alt={horse.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw" className="object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-7xl font-black text-white/20">{horse.name.slice(0, 1)}</div>
                        )}
                        {horse.champion && (
                          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-amber-950 shadow">
                            <Trophy size={14} /> Çempion
                          </span>
                        )}
                      </div>

                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-xl font-bold text-[#0b2f24]">{horse.name}</h3>
                            <p className="font-medium text-green-700">{horse.breed}</p>
                          </div>
                          <span className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800">{horse.sex}</span>
                        </div>
                        <div className="mt-3 flex justify-between text-sm text-gray-600">
                          <span>{horse.color}</span>
                          <span>{horse.year}</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">ID: {horse.code}</p>

                        <div className="mt-5 grid grid-cols-4 gap-2">
                          <ActionLink href={`/atlar/${horse.id}`} label="Gör" icon={<Eye size={18} />} />
                          <ActionLink href={`/nesil?horse=${encodeURIComponent(horse.id)}`} label={`${horse.name} — nesil daragty`} icon={<Network size={18} />} />
                          <ActionButton label="Redaktirle" onClick={() => openEditModal(horse)} icon={<Pencil size={18} />} />
                          <ActionButton label="Poz" onClick={() => deleteHorse(horse)} icon={<Trash2 size={18} />} danger />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
                  <Search className="mx-auto mb-4 text-gray-300" size={44} />
                  <h3 className="text-xl font-bold text-[#0b2f24]">At tapylmady</h3>
                  <p className="mt-2 text-gray-500">Gözleg sözüni ýa-da filtrleri üýtgedip görüň.</p>
                  <button type="button" onClick={resetFilters} className="mt-5 font-semibold text-[#0b5e3c] hover:underline">Filtrleri arassala</button>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {modalOpen && (
        <HorseModal
          form={form}
          editing={Boolean(editingId)}
          onChange={setForm}
          onClose={closeModal}
          onSubmit={saveHorse}
        />
      )}
    </div>
  );
}

function HorseModal({ form, editing, onChange, onClose, onSubmit }: { form: HorseForm; editing: boolean; onChange: (form: HorseForm) => void; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="horse-modal-title" className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-5">
          <div>
            <h2 id="horse-modal-title" className="text-2xl font-bold text-[#0b2f24]">{editing ? "Aty redaktirlemek" : "Täze at goşmak"}</h2>
            <p className="mt-1 text-sm text-gray-500">At barada esasy maglumatlary dolduryň.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Ýap" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"><X /></button>
        </div>

        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
          <FormInput label="Atyň ady" required value={form.name} onChange={(value) => onChange({ ...form, name: value })} placeholder="Mysal: Galkynyş" />
          <FormInput label="Hasaba alyş ID" required value={form.code} onChange={(value) => onChange({ ...form, code: value })} placeholder="AT-2026-001" />
          <FormSelect label="Tohumy" value={form.breed} onChange={(value) => onChange({ ...form, breed: value })} options={["Ahalteke"]} />
          <FormSelect label="Görnüşi" value={form.sex} onChange={(value) => onChange({ ...form, sex: value as Horse["sex"] })} options={["At", "Aýgyr", "Baýtal"]} />
          <FormSelect label="Reňki" value={form.color} onChange={(value) => onChange({ ...form, color: value as Horse["color"] })} options={["Mele", "Gyr", "Dor", "Gara", "Al", "Çakan", "Gurt mele", "Akýal mele", "Altynsow mele"]} />
          <FormInput label="Doglan ýyly" required type="number" min="1980" max={String(new Date().getFullYear())} value={String(form.year)} onChange={(value) => onChange({ ...form, year: Number(value) })} />
          <div className="md:col-span-2">
            <FormInput label="Suratyň ýoly (hökmany däl)" value={form.image ?? ""} onChange={(value) => onChange({ ...form, image: value })} placeholder="/horses/at.png" />
          </div>
          <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 md:col-span-2">
            <input type="checkbox" checked={form.champion} onChange={(event) => onChange({ ...form, champion: event.target.checked })} className="h-5 w-5 accent-[#0b5e3c]" />
            <span className="font-semibold text-gray-800">Çempion at hökmünde bellemek</span>
          </label>
          <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end md:col-span-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50">Ýatyr</button>
            <button type="submit" className="rounded-xl bg-[#0b5e3c] px-6 py-3 font-semibold text-white hover:bg-[#08462d]">{editing ? "Üýtgeşmeleri ýatda sakla" : "Aty goş"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-gray-700">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-800 outline-none focus:border-[#0b5e3c]">
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function FormInput({ label, value, onChange, type = "text", ...props }: { label: string; value: string; onChange: (value: string) => void; type?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type">) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-gray-700">{label}</span>
      <input {...props} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-[#0b5e3c] focus:ring-2 focus:ring-emerald-100" />
    </label>
  );
}

function FormSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-gray-700">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-[#0b5e3c]">
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function ActionLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return <Link href={href} aria-label={label} title={label} className="flex items-center justify-center rounded-lg border border-gray-200 py-2.5 text-gray-600 transition hover:border-[#0b5e3c] hover:bg-emerald-50 hover:text-[#0b5e3c]">{icon}</Link>;
}

function ActionButton({ label, icon, onClick, danger = false }: { label: string; icon: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return <button type="button" onClick={onClick} aria-label={label} title={label} className={`flex items-center justify-center rounded-lg border py-2.5 transition ${danger ? "border-red-100 text-red-500 hover:border-red-300 hover:bg-red-50" : "border-gray-200 text-gray-600 hover:border-[#0b5e3c] hover:bg-emerald-50 hover:text-[#0b5e3c]"}`}>{icon}</button>;
}
