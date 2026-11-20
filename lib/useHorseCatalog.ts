"use client";

import { useEffect, useState } from "react";
import { HORSE_STORAGE_KEY, initialHorses, mergeHorseDefaults, type Horse } from "./horses";

export function useHorseCatalog() {
  const [horses, setHorses] = useState<Horse[]>(initialHorses);
  const [hydrated, setHydrated] = useState(false);
  const [central, setCentral] = useState(false);

  useEffect(() => {
    let active = true;
    try {
      const saved = window.localStorage.getItem(HORSE_STORAGE_KEY);
      if (saved) setHorses(mergeHorseDefaults(JSON.parse(saved) as Horse[]));
    } catch {
      setHorses(initialHorses);
    }
    setHydrated(true);
    // Read the same shared catalog as the Admin Panel, without overwriting
    // the existing browser-local backup when the server becomes available.
    void (async () => {
      try {
        const response = await fetch("/api/horses", { cache: "no-store" });
        if (!response.ok) return;
        const data: unknown = await response.json();
        if (!data || typeof data !== "object") return;
        const record = data as { horses?: unknown; revision?: unknown };
        if (!Array.isArray(record.horses) || !Number.isSafeInteger(record.revision)) return;
        if (active) {
          setHorses(record.horses as Horse[]);
          setCentral(true);
        }
      } catch {
        // Static demo and offline mode retain their original local catalog.
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (hydrated && !central) {
      // Never mirror centralized records into localStorage: the older local
      // data is an explicit backup source for the migration UI.
      window.localStorage.setItem(HORSE_STORAGE_KEY, JSON.stringify(horses));
    }
  }, [horses, hydrated, central]);

  return { horses, setHorses, hydrated, central };
}
