"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";

export default function ChangeAdminCode() {
  const router = useRouter();
  const [currentCode, setCurrentCode] = useState("");
  const [newCode, setNewCode] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setSuccess(false);
    if (newCode.length < 16 || newCode.length > 256 || newCode === currentCode) {
      setMessage("Täze kod 16–256 simwol bolmaly we köne koddan tapawutlanmaly.");
      return;
    }
    if (newCode !== confirm) { setMessage("Täze kodlar gabat gelenok."); return; }
    setPending(true);
    try {
      const response = await fetch("/api/admin/change-code", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentCode, newCode }), cache: "no-store",
      });
      const result: { error?: string; message?: string } = await response.json();
      if (!response.ok) { setMessage(result.error || "Kod üýtgedilmedi."); return; }
      setCurrentCode(""); setNewCode(""); setConfirm("");
      setSuccess(true);
      setMessage(result.message || "Kod üýtgedildi.");
      router.replace("/admin/login");
      router.refresh();
    } catch { setMessage("Serwer bilen baglanyşyk başartmady."); }
    finally { setPending(false); }
  }

  return (
    <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-4 flex items-center gap-3 text-[#082f24]"><KeyRound size={24}/><h2 className="text-2xl font-black">Admin koduny üýtgetmek</h2></div>
      <p className="mb-5 text-sm leading-6 text-slate-600">Howpsuzlyk üçin häzirki kody giriziň. Kod üýtgese, öňki sessiýalar ýatyrylar we täzeden girmek gerek bolar. Bu funksiýa hemişelik Redis maglumat bazasy birikdirilende işleýär.</p>
      <form onSubmit={submit} className="grid max-w-xl gap-4">
        <label className="text-sm font-semibold text-slate-700">Häzirki kod
          <input type="password" autoComplete="off" required value={currentCode} onChange={e=>setCurrentCode(e.target.value)} className="mt-2 block w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950"/>
        </label>
        <label className="text-sm font-semibold text-slate-700">Täze kod (azyndan 16 simwol)
          <input type="password" autoComplete="new-password" required minLength={16} maxLength={256} value={newCode} onChange={e=>setNewCode(e.target.value)} className="mt-2 block w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950"/>
        </label>
        <label className="text-sm font-semibold text-slate-700">Täze kody gaýtala
          <input type="password" autoComplete="new-password" required value={confirm} onChange={e=>setConfirm(e.target.value)} className="mt-2 block w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950"/>
        </label>
        {message && <p role="status" className={`rounded-xl p-3 text-sm font-semibold ${success ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-950"}`}>{message}</p>}
        <button disabled={pending} type="submit" className="rounded-xl bg-[#0b5e3c] px-5 py-3 font-bold text-white disabled:opacity-60">{pending ? "Barlanýar..." : "Admin koduny üýtget"}</button>
      </form>
    </section>
  );
}
