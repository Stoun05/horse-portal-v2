"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }), cache: "no-store" });
      const data = await response.json();
      if (!response.ok) { setError(data.error || "Giriş başartmady."); return; }
      router.replace("/admin");
      router.refresh();
    } catch { setError("Serwer bilen baglanyşyk başartmady."); }
    finally { setLoading(false); }
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f3f6f3] p-4">
      <section className="w-full max-w-md rounded-3xl border border-emerald-900/10 bg-white p-7 shadow-xl sm:p-9">
        <div className="mb-5 inline-flex rounded-2xl bg-[#0b5e3c] p-4 text-white"><LockKeyhole size={28} /></div>
        <h1 className="text-3xl font-black text-[#082f24]">Admin giriş</h1>
        <p className="mt-2 text-sm text-slate-600">Diňe administrator üçin.</p>
        <form onSubmit={submit} className="mt-7 space-y-5">
          <label className="block text-sm font-semibold text-slate-700">Email
            <input type="email" required autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950 focus:border-emerald-600 focus:outline-none" />
          </label>
          <label className="block text-sm font-semibold text-slate-700">Parol
            <input type="password" required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950 focus:border-emerald-600 focus:outline-none" />
          </label>
          {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-800">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-[#0b5e3c] px-5 py-3 font-bold text-white disabled:opacity-60">{loading ? "Barlanýar..." : "Giriş"}</button>
        </form>
        <Link href="/" className="mt-6 inline-block text-sm font-semibold text-emerald-800 hover:underline">Portala dolan</Link>
      </section>
    </main>
  );
}
