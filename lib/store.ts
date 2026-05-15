"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_DATA } from "./defaults";
import type { AppData, Profile, ProfileBlock } from "./types";

const STORAGE_KEY = "affiliate-hub-data";

export function loadData(): AppData {
  if (typeof window === "undefined") return DEFAULT_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    return { ...DEFAULT_DATA, ...JSON.parse(raw) } as AppData;
  } catch {
    return DEFAULT_DATA;
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useAppData() {
  const [data, setData] = useState<AppData>(DEFAULT_DATA);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setData(loadData());
    setHydrated(true);
  }, []);

  const persist = useCallback((next: AppData | ((prev: AppData) => AppData)) => {
    setData((prev) => {
      const updated = typeof next === "function" ? next(prev) : next;
      saveData(updated);
      return updated;
    });
  }, []);

  const updateProfile = useCallback(
    (profile: Partial<Profile>) => {
      persist((prev) => ({ ...prev, profile: { ...prev.profile, ...profile } }));
    },
    [persist],
  );

  const setBlocks = useCallback(
    (blocks: ProfileBlock[]) => {
      persist((prev) => ({
        ...prev,
        profile: { ...prev.profile, blocks },
      }));
    },
    [persist],
  );

  const updateAnalytics = useCallback(
    (updater: (a: AppData["analytics"]) => AppData["analytics"]) => {
      persist((prev) => ({
        ...prev,
        analytics: updater(prev.analytics),
      }));
    },
    [persist],
  );

  return {
    data,
    hydrated,
    persist,
    updateProfile,
    setBlocks,
    updateAnalytics,
  };
}

export function sortBlocks(blocks: ProfileBlock[]): ProfileBlock[] {
  return [...blocks].sort((a, b) => a.order - b.order);
}
