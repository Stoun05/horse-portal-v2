"use client";

import Link from "next/link";
import AtlarPage from "../../atlar/page";

// Admin routes are protected by the authenticated server proxy.
export default function AdminHorsesPage() {
  return (
    <div>
      <div className="bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-950">
        Admin katalogy: merkezi baza bolmasa goşulan atlar diňe şu brauzerde saklanýar.{" "}
        <Link href="/admin" className="underline">Admin panele dolan</Link>
      </div>
      <AtlarPage />
    </div>
  );
}
