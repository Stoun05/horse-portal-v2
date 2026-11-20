"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";

export default function AdminLogout() {
  const [pending, setPending] = useState(false);
  const router = useRouter();
  async function logout() {
    setPending(true);
    try {
      const result = await fetch("/api/admin/logout", { method: "POST", cache: "no-store" });
      if (!result.ok) throw new Error("logout");
      router.replace("/admin/login");
      router.refresh();
    } catch { setPending(false); window.alert("Çykmak başartmady."); }
  }
  return <button type="button" disabled={pending} onClick={logout} className="inline-flex items-center gap-2 rounded-xl border border-emerald-900/20 px-4 py-2 text-sm font-bold text-emerald-900 hover:bg-emerald-50 disabled:opacity-50"><LogOut size={17} /> Çyk</button>;
}
