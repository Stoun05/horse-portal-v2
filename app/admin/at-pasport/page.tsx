"use client";

import { useEffect, useState } from "react";
import HorsePassportPage from "../../../components/HorsePassportPage";

export default function AdminPassportPage() {
  const [horseId, setHorseId] = useState<string | null>(null);
  useEffect(() => {
    setHorseId(new URLSearchParams(window.location.search).get("horse") || "");
  }, []);
  if (horseId === null) return <div className="p-6">Pasport ýüklenýär…</div>;
  return <HorsePassportPage horseId={horseId} adminEditable />;
}
