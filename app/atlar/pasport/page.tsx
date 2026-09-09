"use client";

import { useSyncExternalStore } from "react";
import HorsePassportPage from "../../../components/HorsePassportPage";

const subscribe = () => () => {};

export default function StaticHorsePassportPage() {
  const search = useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => "",
  );
  const horseId = search ? new URLSearchParams(search).get("horse") ?? "" : null;

  if (horseId === null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <p className="font-bold text-[#0b5e3c]">At pasporty açylýar...</p>
      </main>
    );
  }

  return <HorsePassportPage horseId={horseId} />;
}
