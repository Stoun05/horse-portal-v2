"use client";

import { useEffect, useState } from "react";
import { HORSE_STORAGE_KEY, initialHorses, mergeHorseDefaults, type Horse } from "./horses";

export function useHorseCatalog() {
  const [horses, setHorses] = useState<Horse[]>(initialHorses);
  const [hydrated, setHydrated] = useState(false);
  const [storageReadable, setStorageReadable] = useState(true);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(HORSE_STORAGE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (!Array.isArray(parsed) || !parsed.every(item => item && typeof item === "object" && typeof item.id === "string" && typeof item.name === "string")) {
          throw new Error("Invalid saved horse catalog");
        }
        setHorses(mergeHorseDefaults(parsed as Horse[]));
      }
    } catch {
      // Preserve original bytes for recovery rather than overwriting corrupt data.
      setStorageReadable(false);
      setHorses(initialHorses);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated && storageReadable) {
      try {
        window.localStorage.setItem(HORSE_STORAGE_KEY, JSON.stringify(horses));
      } catch {
        setStorageReadable(false);
      }
    }
  }, [horses, hydrated, storageReadable]);

  return { horses, setHorses, hydrated };
}
