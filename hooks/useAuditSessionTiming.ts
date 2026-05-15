"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildTimingMetrics,
  getElapsedMs,
  loadSessionTiming,
  saveSessionTiming,
  type SessionTimingMetrics,
  type SessionTimingRecord,
} from "@/lib/audit/session-timing";

function pauseRecord(record: SessionTimingRecord, now = Date.now()) {
  if (record.activeSince) {
    record.accumulatedMs += now - record.activeSince;
    record.activeSince = null;
  }
}

function resumeRecord(record: SessionTimingRecord, now = Date.now()) {
  if (!record.activeSince) {
    record.activeSince = now;
  }
}

export function useAuditSessionTiming(
  sessionId: string | null,
  reviewedCount: number,
  totalRows: number,
) {
  const recordRef = useRef<SessionTimingRecord | null>(null);
  const [tick, setTick] = useState(0);

  const persist = useCallback((record: SessionTimingRecord) => {
    saveSessionTiming(record);
    recordRef.current = record;
  }, []);

  const pause = useCallback(() => {
    const record = recordRef.current;
    if (!record) return;
    pauseRecord(record);
    persist(record);
  }, [persist]);

  const resume = useCallback(() => {
    const record = recordRef.current;
    if (!record || !sessionId) return;
    if (typeof document !== "undefined" && document.hidden) return;
    resumeRecord(record);
    persist(record);
  }, [persist, sessionId]);

  useEffect(() => {
    if (!sessionId) {
      pause();
      recordRef.current = null;
      return;
    }

    const record = loadSessionTiming(sessionId);
    record.lastOpenedAt = new Date().toISOString();
    if (typeof document === "undefined" || !document.hidden) {
      resumeRecord(record);
    }
    persist(record);
    setTick((t) => t + 1);

    return () => {
      pauseRecord(record);
      record.lastOpenedAt = new Date().toISOString();
      saveSessionTiming(record);
    };
  }, [sessionId, persist]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) pause();
      else resume();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [pause, resume]);

  useEffect(() => {
    if (!sessionId) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [sessionId]);

  const metrics: SessionTimingMetrics | null = useMemo(() => {
    if (!sessionId || !recordRef.current) return null;
    void tick;
    return buildTimingMetrics(recordRef.current, reviewedCount, totalRows);
  }, [sessionId, reviewedCount, totalRows, tick]);

  const elapsedMs = useMemo(() => {
    if (!recordRef.current) return 0;
    void tick;
    return getElapsedMs(recordRef.current);
  }, [tick, sessionId]);

  return { metrics, elapsedMs, pause };
}
