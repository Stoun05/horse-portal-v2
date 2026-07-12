"use client";

import { useEffect, useState } from "react";
import { HORSE_STORAGE_KEY, initialHorses, mergeHorseDefaults, type Horse } from "./horses";

export function useHorseCatalog() {
  const [horses, setHorses] = useState<Horse[]>(initialHorses);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(HORSE_STORAGE_KEY);
      if (saved) setHorses(mergeHorseDefaults(JSON.parse(saved) as Horse[]));
    } catch {
      setHorses(initialHorses);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(HORSE_STORAGE_KEY, JSON.stringify(horses));
  }, [horses, hydrated]);

  return { horses, setHorses, hydrated };
}
