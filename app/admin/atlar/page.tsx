"use client";

import Link from "next/link";
import AtlarPage from "../../atlar/page";

// UI prototype only: server-side authorization must be implemented before production use.
export default function AdminHorsesPage() {
  return (
    <div>
      <div className="bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-950">
        Dolandyryş prototipi: giriş we serwer rugsatlary entek goralan däl.{" "}
        <Link href="/admin" className="underline">Admin panele dolan</Link>
      </div>
      <AtlarPage />
    </div>
  );
}
