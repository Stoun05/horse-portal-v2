"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import Breadcrumb from "../../components/Breadcrumb";
import { assetPath } from "../../lib/assetPath";
import { useHorseCatalog } from "../../lib/useHorseCatalog";
import {
  AlertTriangle,
  CalendarDays,
  ClipboardList,
  HeartPulse,
  Pencil,
  Plus,
  Printer,
  Search,
  Syringe,
  Trash2,
  X,
} from "lucide-react";

type RecordType = "Umumy barlag" | "Waksina" | "Bejergi" | "Analiz" | "Şikes";
type RecordStatus = "Tamamlandy" | "Gözegçilikde" | "Meýilleşdirildi";

type HealthRecord = {
  id: string;
  horseId: string;
  type: RecordType;
  title: string;
  date: string;
  veterinarian: string;
  status: RecordStatus;
  diagnosis: string;
  treatment: string;
  vaccine: string;
  notes: string;
  nextCheckDate: string;
};

type HealthForm = Omit<HealthRecord, "id">;

const STORAGE_KEY = "horse-portal-health-v1";
const emptyForm: HealthForm = {
  horseId: "",
  type: "Umumy barlag",
  title: "",
  date: new Date().toISOString().slice(0, 10),
  veterinarian: "",
  status: "Tamamlandy",
  diagnosis: "",
  treatment: "",
  vaccine: "",
  notes: "",
  nextCheckDate: "",
};

export default function SaglykPage() {
  const [open, setOpen] = useState(false);
  const { horses, hydrated: horsesHydrated } = useHorseCatalog();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [recordsHydrated, setRecordsHydrated] = useState(false);
  const [selectedHorseId, setSelectedHorseId] = useState("");
  const [horseQuery, setHorseQuery] = useState("");
  const [recordQuery, setRecordQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<HealthForm>(emptyForm);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setRecords(JSON.parse(saved) as HealthRecord[]);
    } catch {
      setRecords([]);
    } finally {
      setRecordsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (recordsHydrated) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    }
  }, [records, recordsHydrated]);

  useEffect(() => {
    if (!selectedHorseId && horses.length) setSelectedHorseId(horses[0].id);
    if (selectedHorseId && !horses.some((horse) => horse.id === selectedHorseId)) {
      setSelectedHorseId(horses[0]?.id ?? "");
    }
  }, [horses, selectedHorseId]);

  const matchingHorses = useMemo(() => {
    const query = horseQuery.trim().toLocaleLowerCase("tk");
    if (!query) return horses;
    return horses.filter((horse) =>
      [horse.name, horse.code, horse.color, horse.breed]
        .join(" ")
        .toLocaleLowerCase("tk")
        .includes(query)
    );
  }, [horses, horseQuery]);

  const selectedHorse = horses.find((horse) => horse.id === selectedHorseId);

  const selectedRecords = useMemo(() => {
    const query = recordQuery.trim().toLocaleLowerCase("tk");
    return records
      .filter((record) => record.horseId === selectedHorseId)
      .filter((record) =>
        !query
          ? true
          : [
              record.title,
              record.type,
              record.veterinarian,
              record.status,
              record.diagnosis,
              record.treatment,
              record.vaccine,
              record.notes,
            ]
              .join(" ")
              .toLocaleLowerCase("tk")
              .includes(query)
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [recordQuery, records, selectedHorseId]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, horseId: selectedHorseId || horses[0]?.id || "" });
    setModalOpen(true);
  };

  const openEdit = (record: HealthRecord) => {
    setEditingId(record.id);
    setForm({
      horseId: record.horseId,
      type: record.type,
      title: record.title,
      date: record.date,
      veterinarian: record.veterinarian,
      status: record.status,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      vaccine: record.vaccine,
      notes: record.notes,
      nextCheckDate: record.nextCheckDate,
    });
    setModalOpen(true);
  };

  const saveRecord = (event: FormEvent) => {
    event.preventDefault();
    if (editingId) {
      setRecords((current) =>
        current.map((record) => (record.id === editingId ? { id: editingId, ...form } : record))
      );
    } else {
      setRecords((current) => [{ id: crypto.randomUUID(), ...form }, ...current]);
    }
    setSelectedHorseId(form.horseId);
    setModalOpen(false);
  };

  const deleteRecord = (id: string) => {
    if (window.confirm("Bu saglyk ýazgysyny pozmalymy?")) {
      setRecords((current) => current.filter((record) => record.id !== id));
    }
  };

  const monitored = records.filter((record) => record.status === "Gözegçilikde").length;
  const vaccinations = records.filter((record) => record.type === "Waksina").length;

  return (
    <div className="min-h-screen bg-[#f4f7f5] lg:flex">
      <Sidebar open={open} setOpen={setOpen} />
      <div className="min-w-0 flex-1 border-x-0 border-[#93c5fd] sm:border-x-4 lg:border-x-[15px]">
        <Topbar setOpen={setOpen} />

        <main className="p-4 sm:p-6 lg:p-8">
          <Breadcrumb />

          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end print:hidden">
            <div>
              <h1 className="text-3xl font-black text-[#082f24] lg:text-4xl">Saglyk taryhy</h1>
              <p className="mt-2 text-sm font-medium text-slate-600">
                24 atyň weterinar barlaglaryny, waksinalaryny we bejergilerini aýratyn dolandyryň.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-xl border border-[#0b5e3c] bg-white px-4 py-3 font-bold text-[#0b5e3c] hover:bg-emerald-50"
              >
                <Printer size={18} /> PDF / Çap et
              </button>
              <button
                onClick={openCreate}
                disabled={!horses.length}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0b5e3c] px-5 py-3 font-bold text-white hover:bg-[#08462d] disabled:opacity-50"
              >
                <Plus size={18} /> Täze ýazgy
              </button>
            </div>
          </div>

          <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4 print:hidden">
            <HealthCard icon={<HeartPulse />} title="Katalogdaky atlar" value={horses.length} />
            <HealthCard icon={<ClipboardList />} title="Saglyk ýazgylary" value={records.length} />
            <HealthCard icon={<Syringe />} title="Waksina ýazgylary" value={vaccinations} />
            <HealthCard icon={<AlertTriangle />} title="Gözegçilikde" value={monitored} />
          </div>

          <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:hidden">
            <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800">At gözle</span>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    value={horseQuery}
                    onChange={(event) => setHorseQuery(event.target.value)}
                    placeholder="Adyny, ID-ni ýa-da reňkini ýazyň..."
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-3 text-slate-950 outline-none focus:border-[#0b5e3c] focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800">Saglyk taryhy görkeziljek at</span>
                <select
                  value={selectedHorseId}
                  onChange={(event) => setSelectedHorseId(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 font-semibold text-slate-950 outline-none focus:border-[#0b5e3c]"
                >
                  {matchingHorses.map((horse) => (
                    <option key={horse.id} value={horse.id}>{horse.name} — {horse.code}</option>
                  ))}
                </select>
                {!matchingHorses.length && (
                  <p className="mt-2 text-sm font-semibold text-rose-700">Gözlege laýyk at tapylmady.</p>
                )}
              </label>
            </div>
          </section>

          {selectedHorse ? (
            <>
              <section className="mb-6 overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
                <div className="grid md:grid-cols-[220px_1fr]">
                  <div className="flex min-h-44 items-center justify-center bg-gradient-to-br from-[#064e3b] to-[#b38b24] p-6 text-white">
                    {selectedHorse.image ? (
                      <img src={assetPath(selectedHorse.image)} alt={selectedHorse.name} className="h-32 w-32 rounded-full object-cover ring-4 ring-white/60" />
                    ) : (
                      <span className="text-7xl font-black">{selectedHorse.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="p-5 sm:p-7">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0b5e3c]">{selectedHorse.code}</p>
                    <h2 className="mt-1 text-3xl font-black text-[#082f24]">{selectedHorse.name}</h2>
                    <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                      <Info label="Tohumy" value={selectedHorse.breed} />
                      <Info label="Doglan ýyly" value={String(selectedHorse.year)} />
                      <Info label="Reňki" value={selectedHorse.color} />
                      <Info label="Klasy" value={selectedHorse.horseClass || "Maglumat ýok"} />
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-black text-[#082f24]">{selectedHorse.name}: saglyk ýazgylary</h2>
                    <p className="mt-1 text-sm text-slate-600">Jemi {selectedRecords.length} ýazgy görkezilýär.</p>
                  </div>
                  <div className="relative w-full sm:w-80 print:hidden">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                    <input
                      value={recordQuery}
                      onChange={(event) => setRecordQuery(event.target.value)}
                      placeholder="Ýazgylaryň içinden gözle..."
                      className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-slate-950 outline-none focus:border-[#0b5e3c]"
                    />
                  </div>
                </div>

                {!horsesHydrated || !recordsHydrated ? (
                  <p className="p-8 text-center font-semibold text-slate-600">Maglumatlar ýüklenýär...</p>
                ) : selectedRecords.length ? (
                  <div className="divide-y divide-slate-200">
                    {selectedRecords.map((record) => (
                      <article key={record.id} className="p-5 hover:bg-slate-50 sm:p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">{record.type}</span>
                              <StatusBadge status={record.status} />
                              <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600">
                                <CalendarDays size={15} /> {formatDate(record.date)}
                              </span>
                            </div>
                            <h3 className="mt-3 text-xl font-black text-slate-950">{record.title}</h3>
                            <p className="mt-1 text-sm font-semibold text-slate-600">
                              Weterinar: {record.veterinarian || "Maglumat ýok"}
                            </p>
                          </div>
                          <div className="flex gap-2 print:hidden">
                            <button onClick={() => openEdit(record)} aria-label="Üýtget" className="rounded-lg border border-slate-300 p-2 text-slate-700 hover:bg-slate-100">
                              <Pencil size={17} />
                            </button>
                            <button onClick={() => deleteRecord(record.id)} aria-label="Poz" className="rounded-lg border border-rose-200 p-2 text-rose-700 hover:bg-rose-50">
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </div>
                        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                          <Info label="Kesgitleme" value={record.diagnosis || "Maglumat ýok"} />
                          <Info label="Bejergi" value={record.treatment || "Maglumat ýok"} />
                          <Info label="Waksina" value={record.vaccine || "Maglumat ýok"} />
                          <Info label="Indiki barlag" value={record.nextCheckDate ? formatDate(record.nextCheckDate) : "Meýilleşdirilmedi"} />
                          <div className="md:col-span-2"><Info label="Weterinaryň belligi" value={record.notes || "Maglumat ýok"} /></div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="px-6 py-14 text-center">
                    <ClipboardList className="mx-auto text-emerald-700" size={44} />
                    <h3 className="mt-4 text-xl font-black text-slate-950">Bu at üçin saglyk ýazgysy ýok</h3>
                    <p className="mx-auto mt-2 max-w-lg text-slate-600">
                      Demo maglumat goşulmady. Hakyky barlag, waksina ýa-da bejergi bolanda täze ýazgy dörediň.
                    </p>
                    <button onClick={openCreate} className="mt-5 rounded-xl bg-[#0b5e3c] px-5 py-3 font-bold text-white print:hidden">
                      Ilkinji ýazgyny goş
                    </button>
                  </div>
                )}
              </section>
            </>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center font-semibold text-slate-700">
              Katalogda at ýok. Ilki atlar katalogyna at goşuň.
            </div>
          )}
        </main>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 print:hidden">
          <div className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <div>
                <h2 className="text-2xl font-black text-[#082f24]">{editingId ? "Ýazgyny üýtget" : "Täze saglyk ýazgysy"}</h2>
                <p className="text-sm text-slate-600">Diňe hakyky weterinar maglumatlaryny giriziň.</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-2 text-slate-700 hover:bg-slate-100"><X /></button>
            </div>

            <form onSubmit={saveRecord} className="grid gap-4 p-5 sm:grid-cols-2">
              <Field label="At">
                <select required value={form.horseId} onChange={(e) => setForm({ ...form, horseId: e.target.value })} className={inputClass}>
                  {horses.map((horse) => <option key={horse.id} value={horse.id}>{horse.name} — {horse.code}</option>)}
                </select>
              </Field>
              <Field label="Ýazgynyň görnüşi">
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as RecordType })} className={inputClass}>
                  <option>Umumy barlag</option><option>Waksina</option><option>Bejergi</option><option>Analiz</option><option>Şikes</option>
                </select>
              </Field>
              <Field label="Ady / sebäbi">
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Mysal: Ýyllyk umumy barlag" className={inputClass} />
              </Field>
              <Field label="Sene">
                <input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Weterinar">
                <input value={form.veterinarian} onChange={(e) => setForm({ ...form, veterinarian: e.target.value })} placeholder="Ady we familiýasy" className={inputClass} />
              </Field>
              <Field label="Ýagdaýy">
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as RecordStatus })} className={inputClass}>
                  <option>Tamamlandy</option><option>Gözegçilikde</option><option>Meýilleşdirildi</option>
                </select>
              </Field>
              <Field label="Kesgitleme">
                <input value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} placeholder="Diagnoz ýa-da barlag netijesi" className={inputClass} />
              </Field>
              <Field label="Bejergi">
                <input value={form.treatment} onChange={(e) => setForm({ ...form, treatment: e.target.value })} placeholder="Derman / bejergi tertibi" className={inputClass} />
              </Field>
              <Field label="Waksina">
                <input value={form.vaccine} onChange={(e) => setForm({ ...form, vaccine: e.target.value })} placeholder="Waksinanyň ady" className={inputClass} />
              </Field>
              <Field label="Indiki barlag senesi">
                <input type="date" value={form.nextCheckDate} onChange={(e) => setForm({ ...form, nextCheckDate: e.target.value })} className={inputClass} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Weterinaryň belligi">
                  <textarea rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Goşmaça bellikler..." className={inputClass} />
                </Field>
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 sm:col-span-2">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-800">Ýatyr</button>
                <button type="submit" className="rounded-xl bg-[#0b5e3c] px-6 py-3 font-bold text-white hover:bg-[#08462d]">Ýatda sakla</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inputClass = "w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-950 outline-none placeholder:text-slate-400 focus:border-[#0b5e3c] focus:ring-2 focus:ring-emerald-100";

function formatDate(value: string) {
  if (!value) return "Maglumat ýok";
  return new Intl.DateTimeFormat("tk-TM").format(new Date(value + "T00:00:00"));
}

function HealthCard({ icon, title, value }: { icon: ReactNode; title: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-[#0b5e3c]">{icon}</div>
      <p className="text-sm font-semibold text-slate-600">{title}</p>
      <p className="mt-1 text-3xl font-black text-[#082f24]">{value}</p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 break-words font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: RecordStatus }) {
  const colors =
    status === "Tamamlandy"
      ? "bg-green-100 text-green-800"
      : status === "Gözegçilikde"
        ? "bg-amber-100 text-amber-900"
        : "bg-blue-100 text-blue-800";
  return <span className={`rounded-full px-3 py-1 text-xs font-black ${colors}`}>{status}</span>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-800">{label}</span>
      {children}
    </label>
  );
}
