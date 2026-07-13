"use client";

import { ChangeEvent, ReactNode, useEffect, useRef, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import Breadcrumb from "../../components/Breadcrumb";
import {
  Bell,
  Check,
  Database,
  Download,
  Globe,
  Lock,
  Palette,
  RefreshCcw,
  Save,
  Settings,
  ShieldCheck,
  Upload,
  Users,
} from "lucide-react";
import {
  defaultSettings,
  type PermissionName,
  type PortalSettings,
  type RoleName,
  usePortalSettings,
} from "../../lib/usePortalSettings";
import { assetPath } from "../../lib/assetPath";

const roles: RoleName[] = ["Admin", "Operator", "Weterinar", "Gözegçi"];
const permissions: { key: PermissionName; label: string }[] = [
  { key: "view", label: "Görmek" },
  { key: "edit", label: "Üýtgetmek" },
  { key: "delete", label: "Pozmak" },
  { key: "health", label: "Saglyk" },
  { key: "media", label: "Media" },
  { key: "reports", label: "Hasabat" },
  { key: "users", label: "Ulanyjylar" },
];

const LAST_BACKUP_KEY = "horse-portal-last-backup";

export default function SazlamalarPage() {
  const [open, setOpen] = useState(false);
  const { settings, saveSettings, hydrated } = usePortalSettings();
  const [draft, setDraft] = useState<PortalSettings>(defaultSettings);
  const [saved, setSaved] = useState(false);
  const [lastBackup, setLastBackup] = useState("");
  const restoreInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (hydrated) {
      setDraft(settings);
      setLastBackup(window.localStorage.getItem(LAST_BACKUP_KEY) || "");
    }
  }, [hydrated, settings]);

  const update = <K extends keyof PortalSettings>(key: K, value: PortalSettings[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const persist = () => {
    saveSettings(draft);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  const uploadLogo = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      window.alert("Logo 2 MB-dan uly bolmaly däl.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => update("logo", String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const togglePermission = (role: RoleName, permission: PermissionName) => {
    if (role === "Admin" && permission === "users") {
      window.alert("Iň bolmanda Admin ulanyjylary dolandyryp bilmeli.");
      return;
    }
    setDraft((current) => ({
      ...current,
      permissions: {
        ...current.permissions,
        [role]: {
          ...current.permissions[role],
          [permission]: !current.permissions[role][permission],
        },
      },
    }));
    setSaved(false);
  };

  const exportBackup = () => {
    const data: Record<string, string> = {};
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (key?.startsWith("horse-portal-")) {
        data[key] = window.localStorage.getItem(key) || "";
      }
    }
    const createdAt = new Date().toISOString();
    const backup = JSON.stringify({ version: 1, createdAt, data }, null, 2);
    const blob = new Blob([backup], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `horse-portal-backup-${createdAt.slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    window.localStorage.setItem(LAST_BACKUP_KEY, createdAt);
    setLastBackup(createdAt);
  };

  const restoreBackup = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const backup = JSON.parse(String(reader.result)) as { data?: Record<string, string> };
        if (!backup.data || typeof backup.data !== "object") throw new Error("invalid");
        if (!window.confirm("Backup maglumatlary häzirki maglumatlaryň üstüne ýazylsynmy?")) return;
        Object.entries(backup.data).forEach(([key, value]) => {
          if (key.startsWith("horse-portal-") && typeof value === "string") {
            window.localStorage.setItem(key, value);
          }
        });
        window.alert("Maglumatlar dikeldildi. Sahypa täzeden açylýar.");
        window.location.reload();
      } catch {
        window.alert("Bu faýl dogry Atçylyk portaly backup faýly däl.");
      } finally {
        event.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  const resetSettings = () => {
    if (window.confirm("Diňe portal sazlamalary başlangyç görnüşe gaýtarylsynmy?")) {
      setDraft(defaultSettings);
      saveSettings(defaultSettings);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f5] lg:flex">
      <Sidebar open={open} setOpen={setOpen} />
      <div className="min-w-0 flex-1 border-x-0 border-[#93c5fd] sm:border-x-4 lg:border-x-[15px]">
        <Topbar setOpen={setOpen} />

        <main className="p-4 sm:p-6 lg:p-8">
          <Breadcrumb />

          <header className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-3xl font-black text-[#082f24] lg:text-4xl">Sazlamalar</h1>
              <p className="mt-2 font-medium text-slate-600">
                Portalyň görnüşini, bildirişlerini, rugsatlaryny we backup maglumatlaryny dolandyryň.
              </p>
            </div>
            <button onClick={persist} disabled={!hydrated} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b5e3c] px-5 py-3 font-bold text-white hover:bg-[#08462d] disabled:opacity-50">
              {saved ? <Check size={18} /> : <Save size={18} />}
              {saved ? "Saklandy" : "Üýtgeşmeleri sakla"}
            </button>
          </header>

          <section className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat icon={<Settings />} title="Sazlama ýagdaýy" value={hydrated ? "Işjeň" : "..."} />
            <Stat icon={<Users />} title="Rollar" value="4" />
            <Stat icon={<Database />} title="Backup" value={lastBackup ? "Bar" : "Ýok"} />
            <Stat icon={<Globe />} title="Dil" value={draft.language.toUpperCase()} />
          </section>

          <div className="grid gap-7 xl:grid-cols-2">
            <Card title="Umumy sazlamalar" icon={<Settings />}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Portal ady">
                  <input value={draft.portalName} onChange={(event) => update("portalName", event.target.value)} className={inputClass} />
                </Field>
                <Field label="Gurama">
                  <input value={draft.organization} onChange={(event) => update("organization", event.target.value)} className={inputClass} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Admin email">
                    <input type="email" value={draft.adminEmail} onChange={(event) => update("adminEmail", event.target.value)} placeholder="admin@example.com" className={inputClass} />
                  </Field>
                </div>
              </div>
            </Card>

            <Card title="Logo we reňk" icon={<Palette />}>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-32 w-40 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <img src={assetPath(draft.logo || "/logo.png")} alt="Portal logo" className="max-h-full max-w-full object-contain" />
                </div>
                <div className="flex-1 space-y-4">
                  <Field label="Logo ýükle">
                    <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={uploadLogo} className="w-full rounded-xl border border-dashed border-slate-400 bg-slate-50 p-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#0b5e3c] file:px-3 file:py-2 file:font-bold file:text-white" />
                  </Field>
                  <Field label="Esasy reňk">
                    <div className="flex items-center gap-3">
                      <input type="color" value={draft.primaryColor} onChange={(event) => update("primaryColor", event.target.value)} className="h-12 w-16 cursor-pointer rounded-lg border border-slate-300 bg-white p-1" />
                      <input value={draft.primaryColor} onChange={(event) => update("primaryColor", event.target.value)} className={inputClass} />
                    </div>
                  </Field>
                  {draft.logo && <button onClick={() => update("logo", "")} className="text-sm font-bold text-rose-700">Ýüklenen logony aýyr</button>}
                </div>
              </div>
            </Card>

            <Card title="Dil we görnüş" icon={<Globe />}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Dil">
                  <select value={draft.language} onChange={(event) => update("language", event.target.value as PortalSettings["language"])} className={inputClass}>
                    <option value="tk">Türkmençe</option><option value="ru">Русский</option><option value="en">English</option>
                  </select>
                </Field>
                <Field label="Tema">
                  <select value={draft.theme} onChange={(event) => update("theme", event.target.value as PortalSettings["theme"])} className={inputClass}>
                    <option value="light">Ýagty</option><option value="dark">Gara</option><option value="system">Ulgam boýunça</option>
                  </select>
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Tablisadaky setir sany">
                    <select value={draft.rowsPerPage} onChange={(event) => update("rowsPerPage", Number(event.target.value))} className={inputClass}>
                      <option value={12}>12</option><option value={24}>24</option><option value={48}>48</option><option value={96}>96</option>
                    </select>
                  </Field>
                </div>
              </div>
              <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-950">
                Doly rusça/iňlisçe terjime aýratyn dil paketleri goşulandan soň işleýär. Häzir saýlaw ýatda saklanýar.
              </p>
            </Card>

            <Card title="Bildirişler" icon={<Bell />}>
              <div className="space-y-3">
                <Toggle title="Email bildirişleri" desc="Ulgam habarlaryny admin emailine ibermek." checked={draft.notifications.email} onChange={(value) => update("notifications", { ...draft.notifications, email: value })} />
                <Toggle title="Waksina ýatlatmasy" desc="Indiki waksina senesi golaýlanda görkezmek." checked={draft.notifications.vaccine} onChange={(value) => update("notifications", { ...draft.notifications, vaccine: value })} />
                <Toggle title="Saglyk duýduryşy" desc="Gözegçilikdäki atlar barada habar bermek." checked={draft.notifications.health} onChange={(value) => update("notifications", { ...draft.notifications, health: value })} />
                <Toggle title="Täze ulanyjy" desc="Täze ulanyjy döredilende habar bermek." checked={draft.notifications.newUser} onChange={(value) => update("notifications", { ...draft.notifications, newUser: value })} />
                <Field label="Näçe gün öň ýatlatmaly">
                  <input type="number" min={1} max={90} value={draft.notifications.reminderDays} onChange={(event) => update("notifications", { ...draft.notifications, reminderDays: Number(event.target.value) })} className={inputClass} />
                </Field>
              </div>
            </Card>
          </div>

          <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-2xl font-black text-[#082f24]">Rol rugsatlary</h2>
              <p className="mt-1 text-sm font-medium text-slate-600">Belliklere basyp her roluň ygtyýaryny sazlaň.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-sm text-slate-950">
                <thead className="bg-slate-100 text-left text-xs font-black uppercase tracking-wide text-slate-700">
                  <tr><th className="px-5 py-4">Rol</th>{permissions.map((item) => <th key={item.key} className="px-4 py-4 text-center">{item.label}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {roles.map((role) => (
                    <tr key={role}>
                      <td className="px-5 py-4 font-black text-[#082f24]">{role}</td>
                      {permissions.map((permission) => (
                        <td key={permission.key} className="px-4 py-4 text-center">
                          <button onClick={() => togglePermission(role, permission.key)} className={`mx-auto flex h-8 w-8 items-center justify-center rounded-lg border font-black ${draft.permissions[role][permission.key] ? "border-emerald-300 bg-emerald-100 text-emerald-800" : "border-slate-300 bg-slate-100 text-slate-500"}`}>
                            {draft.permissions[role][permission.key] ? "✓" : "—"}
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="mt-7 grid gap-7 xl:grid-cols-2">
            <Card title="Backup we dikeltmek" icon={<Database />}>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-semibold text-emerald-800">Soňky backup</p>
                <p className="mt-1 text-lg font-black text-emerald-950">{lastBackup ? formatDate(lastBackup) : "Entek döredilmedi"}</p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button onClick={exportBackup} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b5e3c] px-4 py-3 font-bold text-white"><Download size={18} /> JSON backup al</button>
                <button onClick={() => restoreInput.current?.click()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#0b5e3c] bg-white px-4 py-3 font-bold text-[#0b5e3c]"><Upload size={18} /> Backup-dan dikelt</button>
                <input ref={restoreInput} type="file" accept="application/json,.json" onChange={restoreBackup} className="hidden" />
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">Backup atlary, saglyk ýazgylaryny, ulanyjylary we sazlamalary öz içine alýar. Media faýllary IndexedDB-de bolany üçin bu JSON faýla girmeýär.</p>
            </Card>

            <Card title="Howpsuzlyk" icon={<ShieldCheck />}>
              <ComingSoon icon={<ShieldCheck />} title="Iki faktorly gorag (2FA)" />
              <ComingSoon icon={<Lock />} title="Güýçli parol syýasaty" />
              <ComingSoon icon={<RefreshCcw />} title="30 minutlyk session wagty" />
              <p className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm font-semibold text-blue-950">Bu funksiýalar hakyky login we maglumat bazasy goşulandan soň işjeňleşdiriler.</p>
            </Card>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button onClick={persist} className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0b5e3c] py-4 text-lg font-black text-white hover:bg-[#08462d]"><Save size={21} /> Üýtgeşmeleri sakla</button>
            <button onClick={resetSettings} className="rounded-2xl border border-rose-300 bg-white px-6 py-4 font-bold text-rose-700 hover:bg-rose-50">Başlangyç sazlamalara gaýt</button>
          </div>
        </main>
      </div>
    </div>
  );
}

const inputClass = "w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-950 outline-none placeholder:text-slate-400 focus:border-[#0b5e3c] focus:ring-2 focus:ring-emerald-100";

function Card({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="mb-5 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-[#0b5e3c]">{icon}</span><h2 className="text-2xl font-black text-[#082f24]">{title}</h2></div>{children}</section>;
}

function Stat({ icon, title, value }: { icon: ReactNode; title: string; value: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-[#0b5e3c]">{icon}</div><p className="text-sm font-semibold text-slate-600">{title}</p><p className="mt-1 text-2xl font-black text-[#082f24]">{value}</p></div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold text-slate-800">{label}</span>{children}</label>;
}

function Toggle({ title, desc, checked, onChange }: { title: string; desc: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"><div><p className="font-black text-slate-950">{title}</p><p className="mt-1 text-sm text-slate-600">{desc}</p></div><button onClick={() => onChange(!checked)} className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? "bg-[#0b5e3c]" : "bg-slate-300"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${checked ? "left-6" : "left-1"}`} /></button></div>;
}

function ComingSoon({ icon, title }: { icon: ReactNode; title: string }) {
  return <div className="mb-3 flex items-center justify-between rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3 text-slate-700">{icon}<span className="font-bold">{title}</span></div><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-900">Taýýarlanýar</span></div>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tk-TM", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
