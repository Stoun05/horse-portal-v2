"use client";

import { ReactNode, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import Breadcrumb from "../../components/Breadcrumb";
import { useHorseCatalog } from "../../lib/useHorseCatalog";
import type { Horse } from "../../lib/horses";
import {
  Download,
  FileSpreadsheet,
  FileText,
  GitBranch,
  Horse as HorseIcon,
  Printer,
  Search,
  Trophy,
} from "lucide-react";

type ReportKey = "all" | "champions" | "lineages" | "breeding";

const reports: { key: ReportKey; title: string; desc: string; icon: ReactNode }[] = [
  { key: "all", title: "Atlaryň umumy sanawy", desc: "Ähli atlaryň pasport we esasy maglumatlary.", icon: <HorseIcon /> },
  { key: "champions", title: "Çempion atlar", desc: "Diňe çempion hökmünde bellenen atlaryň sanawy.", icon: <Trophy /> },
  { key: "lineages", title: "Nesil ugurlary", desc: "Nesil ugurlary we olara degişli atlaryň sany.", icon: <GitBranch /> },
  { key: "breeding", title: "Tohumçylyk maglumatlary", desc: "Ata-enesi, beden ölçegleri we tohumçylyk gymmaty.", icon: <FileText /> },
];

export default function HasabatlarPage() {
  const [open, setOpen] = useState(false);
  const { horses, hydrated } = useHorseCatalog();
  const [active, setActive] = useState<ReportKey>("all");
  const [query, setQuery] = useState("");

  const champions = useMemo(() => horses.filter((horse) => horse.champion), [horses]);
  const lineageRows = useMemo(() => {
    const grouped = new Map<string, Horse[]>();
    horses.forEach((horse) => {
      const name = horse.lineage?.trim() || "Maglumat ýok";
      grouped.set(name, [...(grouped.get(name) || []), horse]);
    });
    return [...grouped.entries()]
      .map(([lineage, items]) => ({ lineage, count: items.length, horses: items.map((item) => item.name).join(", ") }))
      .sort((a, b) => b.count - a.count || a.lineage.localeCompare(b.lineage, "tk"));
  }, [horses]);

  const filteredHorses = useMemo(() => {
    const source = active === "champions" ? champions : horses;
    const normalized = query.trim().toLocaleLowerCase("tk");
    if (!normalized) return source;
    return source.filter((horse) =>
      [
        horse.name,
        horse.code,
        horse.breed,
        horse.color,
        horse.lineage,
        horse.father,
        horse.mother,
        horse.bodyMeasurements,
        horse.breedingValue,
      ]
        .join(" ")
        .toLocaleLowerCase("tk")
        .includes(normalized)
    );
  }, [active, champions, horses, query]);

  const filteredLineages = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("tk");
    if (!normalized) return lineageRows;
    return lineageRows.filter((row) =>
      [row.lineage, row.horses].join(" ").toLocaleLowerCase("tk").includes(normalized)
    );
  }, [lineageRows, query]);

  const activeReport = reports.find((report) => report.key === active)!;
  const visibleCount = active === "lineages" ? filteredLineages.length : filteredHorses.length;

  const exportExcel = () => {
    const workbook = buildExcelWorkbook(horses, champions, lineageRows);
    const blob = new Blob([workbook], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `atcylyk-hasabatlary-${new Date().toISOString().slice(0, 10)}.xls`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#f4f7f5] lg:flex">
      <Sidebar open={open} setOpen={setOpen} />
      <div className="min-w-0 flex-1 border-x-0 border-[#93c5fd] sm:border-x-4 lg:border-x-[15px]">
        <Topbar setOpen={setOpen} />

        <main className="p-4 sm:p-6 lg:p-8">
          <Breadcrumb />

          <header className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end print:hidden">
            <div>
              <h1 className="text-3xl font-black text-[#082f24] lg:text-4xl">Hasabatlar</h1>
              <p className="mt-2 font-medium text-slate-600">
                At katalogyndaky hakyky maglumatlardan PDF we Excel hasabatlaryny taýýarlaň.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-xl border border-[#0b5e3c] bg-white px-5 py-3 font-bold text-[#0b5e3c] hover:bg-emerald-50"
              >
                <Printer size={18} /> PDF / Çap et
              </button>
              <button
                onClick={exportExcel}
                disabled={!hydrated || !horses.length}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0b5e3c] px-5 py-3 font-bold text-white hover:bg-[#08462d] disabled:opacity-50"
              >
                <FileSpreadsheet size={18} /> Excel eksport
              </button>
            </div>
          </header>

          <section className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4 print:hidden">
            <Stat icon={<HorseIcon />} label="Jemi atlar" value={horses.length} />
            <Stat icon={<Trophy />} label="Çempion atlar" value={champions.length} />
            <Stat icon={<GitBranch />} label="Nesil ugurlary" value={lineageRows.length} />
            <Stat icon={<FileText />} label="Maglumatly atlar" value={horses.filter((horse) => horse.breedingValue).length} />
          </section>

          <section className="mb-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4 print:hidden">
            {reports.map((report) => (
              <button
                key={report.key}
                onClick={() => {
                  setActive(report.key);
                  setQuery("");
                }}
                className={`rounded-2xl border p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                  active === report.key
                    ? "border-[#0b5e3c] bg-[#0b5e3c] text-white"
                    : "border-slate-200 bg-white text-slate-950"
                }`}
              >
                <span className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${
                  active === report.key ? "bg-white/15 text-white" : "bg-emerald-100 text-[#0b5e3c]"
                }`}>
                  {report.icon}
                </span>
                <span className="block text-lg font-black">{report.title}</span>
                <span className={`mt-2 block text-sm ${
                  active === report.key ? "text-emerald-50" : "text-slate-600"
                }`}>{report.desc}</span>
              </button>
            ))}
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="hidden text-sm font-bold uppercase tracking-[0.18em] text-[#0b5e3c] print:block">
                    Atçylyk portaly — resmi hasabat
                  </p>
                  <h2 className="text-2xl font-black text-[#082f24]">{activeReport.title}</h2>
                  <p className="mt-1 text-sm font-medium text-slate-600">
                    {new Intl.DateTimeFormat("tk-TM", { dateStyle: "long" }).format(new Date())} · {visibleCount} netije
                  </p>
                </div>
                <div className="relative w-full lg:w-96 print:hidden">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="At, ID ýa-da nesil ugry boýunça gözle..."
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-3 text-slate-950 outline-none placeholder:text-slate-400 focus:border-[#0b5e3c] focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>
            </div>

            {!hydrated ? (
              <p className="p-12 text-center font-semibold text-slate-600">Maglumatlar ýüklenýär...</p>
            ) : active === "lineages" ? (
              <LineageTable rows={filteredLineages} />
            ) : active === "breeding" ? (
              <BreedingTable horses={filteredHorses} />
            ) : (
              <HorseTable horses={filteredHorses} showChampion={active === "all"} />
            )}

            {visibleCount === 0 && hydrated && (
              <div className="border-t border-slate-200 p-12 text-center">
                <FileText className="mx-auto text-emerald-700" size={42} />
                <h3 className="mt-3 text-xl font-black text-slate-950">Maglumat tapylmady</h3>
                <p className="mt-1 text-slate-600">Gözleg sözüni üýtgedip gaýtadan synanyşyň.</p>
              </div>
            )}
          </section>

          <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-950 print:hidden">
            Excel faýlynda dört aýratyn sahypa döredilýär: umumy sanaw, çempionlar, nesil ugurlary we tohumçylyk maglumatlary.
          </p>
        </main>
      </div>
    </div>
  );
}

function HorseTable({ horses, showChampion }: { horses: Horse[]; showChampion: boolean }) {
  if (!horses.length) return null;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] text-sm text-slate-950">
        <thead className="bg-slate-100 text-left text-xs font-black uppercase tracking-wide text-slate-700">
          <tr>
            <th className="px-5 py-4">№</th><th className="px-5 py-4">At</th><th className="px-5 py-4">ID</th>
            <th className="px-5 py-4">Tohum</th><th className="px-5 py-4">Jynsy</th><th className="px-5 py-4">Reňki</th>
            <th className="px-5 py-4">Ýyly</th><th className="px-5 py-4">Nesil ugry</th>
            {showChampion && <th className="px-5 py-4">Dereje</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {horses.map((horse, index) => (
            <tr key={horse.id} className="hover:bg-slate-50">
              <td className="px-5 py-4 font-semibold text-slate-500">{index + 1}</td>
              <td className="px-5 py-4 font-black text-[#082f24]">{horse.name}</td>
              <td className="px-5 py-4 font-mono text-xs">{horse.code}</td>
              <td className="px-5 py-4">{horse.breed}</td><td className="px-5 py-4">{horse.sex}</td>
              <td className="px-5 py-4">{horse.color}</td><td className="px-5 py-4">{horse.year}</td>
              <td className="max-w-xs px-5 py-4">{horse.lineage || "Maglumat ýok"}</td>
              {showChampion && <td className="px-5 py-4">{horse.champion ? <Badge>Çempion</Badge> : "—"}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LineageTable({ rows }: { rows: { lineage: string; count: number; horses: string }[] }) {
  if (!rows.length) return null;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] text-sm text-slate-950">
        <thead className="bg-slate-100 text-left text-xs font-black uppercase tracking-wide text-slate-700">
          <tr><th className="px-5 py-4">№</th><th className="px-5 py-4">Nesil ugry</th><th className="px-5 py-4">At sany</th><th className="px-5 py-4">Atlar</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {rows.map((row, index) => (
            <tr key={row.lineage} className="hover:bg-slate-50">
              <td className="px-5 py-4 font-semibold text-slate-500">{index + 1}</td>
              <td className="px-5 py-4 font-black text-[#082f24]">{row.lineage}</td>
              <td className="px-5 py-4"><Badge>{row.count} at</Badge></td>
              <td className="px-5 py-4">{row.horses}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BreedingTable({ horses }: { horses: Horse[] }) {
  if (!horses.length) return null;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1250px] text-sm text-slate-950">
        <thead className="bg-slate-100 text-left text-xs font-black uppercase tracking-wide text-slate-700">
          <tr>
            <th className="px-5 py-4">At</th><th className="px-5 py-4">ID</th><th className="px-5 py-4">Atasy</th>
            <th className="px-5 py-4">Enesi</th><th className="px-5 py-4">Beden ölçegleri</th>
            <th className="px-5 py-4">Tohumçylyk gymmaty</th><th className="px-5 py-4">Klasy</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {horses.map((horse) => (
            <tr key={horse.id} className="align-top hover:bg-slate-50">
              <td className="px-5 py-4 font-black text-[#082f24]">{horse.name}</td>
              <td className="px-5 py-4 font-mono text-xs">{horse.code}</td>
              <td className="max-w-sm px-5 py-4">{horse.father || "Maglumat ýok"}</td>
              <td className="max-w-sm px-5 py-4">{horse.mother || "Maglumat ýok"}</td>
              <td className="px-5 py-4">{horse.bodyMeasurements || "Maglumat ýok"}</td>
              <td className="px-5 py-4">{horse.breedingValue || "Maglumat ýok"}</td>
              <td className="px-5 py-4">{horse.horseClass || "Maglumat ýok"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-[#0b5e3c]">{icon}</div>
      <p className="text-sm font-semibold text-slate-600">{label}</p>
      <p className="mt-1 text-3xl font-black text-[#082f24]">{value}</p>
    </div>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-900">{children}</span>;
}

function escapeXml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function sheet(name: string, headers: string[], rows: (string | number)[][]) {
  const rowXml = [headers, ...rows]
    .map((row) =>
      `<Row>${row.map((cell) => `<Cell><Data ss:Type="${typeof cell === "number" ? "Number" : "String"}">${escapeXml(cell)}</Data></Cell>`).join("")}</Row>`
    )
    .join("");
  return `<Worksheet ss:Name="${escapeXml(name)}"><Table>${rowXml}</Table></Worksheet>`;
}

function buildExcelWorkbook(
  horses: Horse[],
  champions: Horse[],
  lineages: { lineage: string; count: number; horses: string }[]
) {
  const commonHeaders = ["№", "At", "ID", "Tohum", "Jynsy", "Reňki", "Doglan ýyly", "Nesil ugry", "Çempion"];
  const commonRows = (items: Horse[]) =>
    items.map((horse, index) => [
      index + 1, horse.name, horse.code, horse.breed, horse.sex, horse.color, horse.year,
      horse.lineage || "Maglumat ýok", horse.champion ? "Hawa" : "Ýok",
    ]);
  const breedingRows = horses.map((horse) => [
    horse.name, horse.code, horse.father || "Maglumat ýok", horse.mother || "Maglumat ýok",
    horse.bodyMeasurements || "Maglumat ýok", horse.breedingValue || "Maglumat ýok",
    horse.horseClass || "Maglumat ýok",
  ]);
  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 ${sheet("Umumy sanaw", commonHeaders, commonRows(horses))}
 ${sheet("Çempionlar", commonHeaders, commonRows(champions))}
 ${sheet("Nesil ugurlary", ["Nesil ugry", "At sany", "Atlar"], lineages.map((row) => [row.lineage, row.count, row.horses]))}
 ${sheet("Tohumçylyk", ["At", "ID", "Atasy", "Enesi", "Beden ölçegleri", "Tohumçylyk gymmaty", "Klasy"], breedingRows)}
</Workbook>`;
}
