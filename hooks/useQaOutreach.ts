"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { parseCsvFile } from "@/lib/audit/csv";
import { detectOutreachColumnMap } from "@/lib/audit/outreach/columns";
import { parseEmailPaste } from "@/lib/audit/outreach/emails";
import { buildOutreachRecords } from "@/lib/audit/outreach/parse";
import {
  DEFAULT_OUTREACH_SETTINGS,
  generateOutreachMessages,
  loadOutreachSettings,
  saveOutreachSettings,
} from "@/lib/audit/outreach/templates";
import type {
  OutreachColumnMap,
  OutreachRecord,
  OutreachSettings,
} from "@/lib/audit/outreach/types";

export function useQaOutreach() {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [columnMap, setColumnMap] = useState<OutreachColumnMap>({});
  const [fileName, setFileName] = useState("");
  const [fallbackDate, setFallbackDate] = useState("");
  const [emailPaste, setEmailPaste] = useState("");
  const [filterByPaste, setFilterByPaste] = useState(true);
  const [settings, setSettings] = useState<OutreachSettings>(() =>
    loadOutreachSettings(),
  );
  const [uploading, setUploading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    setSettings(loadOutreachSettings());
  }, []);

  const records = useMemo(
    () => buildOutreachRecords(rawRows, columnMap, fallbackDate),
    [rawRows, columnMap, fallbackDate],
  );

  const pasteEmails = useMemo(() => parseEmailPaste(emailPaste), [emailPaste]);

  const filteredRecords = useMemo(() => {
    if (!filterByPaste || pasteEmails.length === 0) return records;
    const set = new Set(pasteEmails);
    return records.filter((r) => set.has(r.email));
  }, [records, pasteEmails, filterByPaste]);

  const displayRecords = useMemo(() => {
    if (!settings.ignoreZeroReviews) return filteredRecords;
    return filteredRecords.filter((r) => r.reviews > 0);
  }, [filteredRecords, settings.ignoreZeroReviews]);

  const ignoredZeroCount = useMemo(() => {
    if (!settings.ignoreZeroReviews) return 0;
    return filteredRecords.filter((r) => r.reviews === 0).length;
  }, [filteredRecords, settings.ignoreZeroReviews]);

  const messages = useMemo(
    () => generateOutreachMessages(displayRecords, settings),
    [displayRecords, settings],
  );

  const uploadCsv = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const parsed = await parseCsvFile(file);
      if (parsed.rows.length === 0) {
        toast.error("No rows found in CSV");
        return;
      }
      const outreachMap = detectOutreachColumnMap(parsed.headers);
      setHeaders(parsed.headers);
      setRawRows(parsed.rows);
      setColumnMap({ ...outreachMap });
      setFileName(file.name);
      if (!outreachMap.email) {
        toast.warning("Could not detect email column — map it manually");
      } else {
        toast.success(`Loaded ${parsed.rows.length} rows from ${file.name}`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "CSV import failed");
    } finally {
      setUploading(false);
    }
  }, []);

  const updateSettings = useCallback(
    (patch: Partial<OutreachSettings>, opts?: { quiet?: boolean }) => {
      setSettings((prev) => {
        const next: OutreachSettings = {
          ...prev,
          ...patch,
          rules: patch.rules ?? prev.rules,
        };
        if (patch.lowThreshold != null || patch.highThreshold != null) {
          const low = patch.lowThreshold ?? prev.lowThreshold;
          const high = patch.highThreshold ?? prev.highThreshold;
          next.rules = next.rules.map((r) => {
            if (r.kind === "lt") return { ...r, threshold: low };
            if (r.kind === "gt") return { ...r, threshold: high };
            return r;
          });
          next.lowThreshold = low;
          next.highThreshold = high;
        }
        saveOutreachSettings(next);
        return next;
      });
      if (!opts?.quiet) toast.success("Templates saved");
    },
    [],
  );

  const updateRuleBody = useCallback((ruleId: string, body: string) => {
    setSettings((prev) => {
      const next = {
        ...prev,
        rules: prev.rules.map((r) => (r.id === ruleId ? { ...r, body } : r)),
      };
      saveOutreachSettings(next);
      return next;
    });
  }, []);

  const resetTemplates = useCallback(() => {
    saveOutreachSettings(DEFAULT_OUTREACH_SETTINGS);
    setSettings(DEFAULT_OUTREACH_SETTINGS);
    toast.success("Templates reset to defaults");
  }, []);

  const clearData = useCallback(() => {
    setHeaders([]);
    setRawRows([]);
    setColumnMap({});
    setFileName("");
    setEmailPaste("");
  }, []);

  const columnOptions = headers;

  const missingColumns = !columnMap.email || !columnMap.reviews;

  return {
    headers,
    columnMap,
    setColumnMap,
    columnOptions,
    fileName,
    records,
    filteredRecords,
    displayRecords,
    ignoredZeroCount,
    messages,
    pasteEmails,
    emailPaste,
    setEmailPaste,
    filterByPaste,
    setFilterByPaste,
    fallbackDate,
    setFallbackDate,
    settings,
    updateSettings,
    updateRuleBody,
    resetTemplates,
    uploadCsv,
    uploading,
    showTemplates,
    setShowTemplates,
    clearData,
    missingColumns,
  };
}
