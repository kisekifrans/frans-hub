"use client";

import { useEffect, useRef, useState } from "react";

export type AutoSaveStatus = "idle" | "pending" | "saving" | "saved" | "error";

export function useAutoSave<T>(
  value: T | null,
  save: (value: T) => Promise<void>,
  options?: { delay?: number; enabled?: boolean },
) {
  const delay = options?.delay ?? 1400;
  const enabled = options?.enabled ?? true;
  const [status, setStatus] = useState<AutoSaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveRef = useRef(save);
  const valueRef = useRef(value);
  const isFirst = useRef(true);

  saveRef.current = save;
  valueRef.current = value;

  useEffect(() => {
    if (!enabled || value === null) return;

    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    setStatus("pending");
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      const current = valueRef.current;
      if (current === null) return;
      setStatus("saving");
      try {
        await saveRef.current(current);
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, delay, enabled]);

  const flush = async () => {
    if (valueRef.current === null) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus("saving");
    try {
      await saveRef.current(valueRef.current as T);
      setStatus("saved");
    } catch {
      setStatus("error");
      throw new Error("Save failed");
    }
  };

  return { status, flush };
}
