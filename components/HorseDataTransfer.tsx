"use client";

import { ChangeEvent, useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { HORSE_STORAGE_KEY, initialHorses, type Horse } from "../lib/horses";

type Props = {
  central: boolean;
  revision: number;
  onImported: (data: { horses: Horse[]; revision: number }) => void;
};

export default function HorseDataTransfer({ central, revision, onImported }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  function downloadLocalBackup() {
    try {
      const saved = window.localStorage.getItem(HORSE_STORAGE_KEY);
      const horses: unknown = saved ? JSON.parse(saved) : initialHorses;
      if (!Array.isArray(horses)) throw new Error("Lokal maglumat nädogry.");
      const document = { format: "atcylyk-horses-backup", version: 1, exportedAt: new Date().toISOString(), horses };
      const blob = new Blob([JSON.stringify(document, null, 2)], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `atcylyk-local-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setMessage("Ýerli maglumatlaryň nusgasy faýla eksport edildi. Faýly howpsuz ýerde saklaň.");
    } catch {
      setMessage("Ýerli maglumatlary eksport etmek başartmady.");
    }
  }

  async function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || busy) return;
    if (input.current) input.current.value = "";
    if (file.size > 1_500_000) { setMessage("Faýl 1.5 MB-dan uly bolmaly däl."); return; }
    setBusy(true);
    try {
      const content: unknown = JSON.parse(await file.text());
      if (!content || typeof content !== "object" || Array.isArray(content)) throw new Error("Faýlyň görnüşi nädogry.");
      const backup = content as { format?: unknown; version?: unknown; horses?: unknown };
      if (backup.format !== "atcylyk-horses-backup" || backup.version !== 1 || !Array.isArray(backup.horses)) {
        throw new Error("Diňe Atçylyk Portal ätiýaçlyk faýly kabul edilýär.");
      }
      if (backup.horses.length > 1000) throw new Error("Bir gezekde iň köp 1000 at import edip bolýar.");
      if (!window.confirm(`${backup.horses.length} ýazgy bar. Diňe täze atlar goşular, öňki merkezi atlar üýtgedilmez. Import etmelimi?`)) return;
      const response = await fetch("/api/admin/horses/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revision, horses: backup.horses }),
        cache: "no-store",
      });
      const data: { error?: string; horses?: Horse[]; revision?: number; imported?: number } = await response.json();
      if (!response.ok) throw new Error(data.error || "Import başartmady.");
      if (!Array.isArray(data.horses) || typeof data.revision !== "number") throw new Error("Serweriň jogaby nädogry.");
      onImported({ horses: data.horses, revision: data.revision });
      setMessage(`${data.imported ?? 0} sany täze at merkezi baza goşuldy. Öňki atlar saklandy.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Import ýalňyşlygy.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mb-6 rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-sm" aria-label="At maglumatlarynyň ätiýaçlyk nusgasy">
      <h2 className="mb-2 text-lg font-black text-[#082f24]">Maglumatlaryň ätiýaçlyk nusgasy</h2>
      <p className="mb-4 text-sm leading-6 text-slate-600">
        Eksport häzirki brauzerde saklanan atlary JSON faýlyna geçirýär. Import diňe merkezi baza işjeň wagty täze ýazgylary goşýar; gabat gelmeýän ýazgylar import edilmeýär.
      </p>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={downloadLocalBackup} className="inline-flex items-center gap-2 rounded-xl border border-emerald-800 px-4 py-2.5 text-sm font-bold text-emerald-900 hover:bg-emerald-50">
          <Download size={17}/> Ýerli maglumatlary eksport et
        </button>
        {central && <>
          <input type="file" ref={input} accept=".json,application/json" onChange={importBackup} className="hidden" aria-label="Ätiýaçlyk faýly saýla" />
          <button type="button" disabled={busy} onClick={() => input.current?.click()} className="inline-flex items-center gap-2 rounded-xl bg-[#0b5e3c] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">
            <Upload size={17}/> {busy ? "Import edilýär..." : "Merkezi baza import et"}
          </button>
        </>}
      </div>
      {message && <p role="status" className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-950">{message}</p>}
    </section>
  );
}
