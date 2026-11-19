"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import HorsePassportPage from "../../../components/HorsePassportPage";

export default function ExtendedHorsePassportRoute() {
  const [search, setSearch] = useState<string | null>(null);
  useEffect(() => setSearch(window.location.search), []);
  const horseId = new URLSearchParams(search ?? "").get("horse") ?? "";

  if (search === null) {
    return <main className="flex min-h-screen items-center justify-center bg-[#f3f6f3] p-6"><p className="font-semibold text-[#0b5e3c]">Pasport açylýar...</p></main>;
  }

  if (!horseId) {
    return <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f3f6f3] p-6"><p className="font-semibold text-[#0b2f24]">At saýlanmady.</p><Link href="/atlar" className="rounded-xl bg-[#0b5e3c] px-5 py-3 font-bold text-white">Kataloga dolan</Link></main>;
  }

  return <HorsePassportPage horseId={horseId} />;
}
