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
import {
  assignDiscordIdsToEmails,
  clearBatchMentionMap,
  loadBatchMentionMap,
  orderRecordsByEmailPaste,
  parseDiscordIdList,
  saveBatchMentionMap,
} from "@/lib/audit/outreach/discord-mentions";
import {
  clearSentArchive,
  loadSentArchive,
  markRecordSent,
  type SentArchiveEntry,
} from "@/lib/audit/outreach/sent-archive";
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
  const [batchId, setBatchId] = useState("");
  const [sentArchive, setSentArchive] = useState<SentArchiveEntry[]>([]);
  const [batchMentionMap, setBatchMentionMap] = useState<Record<string, string>>(
    {},
  );
  const [discordIdPaste, setDiscordIdPaste] = useState("");
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

  useEffect(() => {
    if (batchId) {
      setSentArchive(loadSentArchive(batchId));
      setBatchMentionMap(loadBatchMentionMap(batchId));
    } else {
      setSentArchive([]);
      setBatchMentionMap({});
    }
  }, [batchId]);

  const records = useMemo(
    () => buildOutreachRecords(rawRows, columnMap, fallbackDate),
    [rawRows, columnMap, fallbackDate],
  );

  const pasteEmails = useMemo(() => parseEmailPaste(emailPaste), [emailPaste]);

  const filteredRecords = useMemo(() => {
    if (!filterByPaste || pasteEmails.length === 0) return records;
    const set = new Set(pasteEmails);
    const matched = records.filter((r) => set.has(r.email));
    return orderRecordsByEmailPaste(matched, pasteEmails);
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
      const nextBatch = `${file.name}-${Date.now()}`;
      setBatchId(nextBatch);
      setSentArchive([]);
      setBatchMentionMap({});
      setDiscordIdPaste("");
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

  const markSent = useCallback(
    (entry: Omit<SentArchiveEntry, "sentAt">) => {
      if (!batchId) return;
      setSentArchive(markRecordSent(batchId, entry));
    },
    [batchId],
  );

  const assignDiscordIdsInOrder = useCallback(() => {
    if (!batchId) {
      toast.error("Import a CSV first");
      return;
    }
    const ids = parseDiscordIdList(discordIdPaste);
    if (ids.length === 0) {
      toast.error("Paste at least one Discord user ID");
      return;
    }
    const emails = displayRecords.map((r) => r.email);
    const { map, assigned, emailCount, idCount } = assignDiscordIdsToEmails(
      emails,
      ids,
    );
    setBatchMentionMap(map);
    saveBatchMentionMap(batchId, map);
    if (assigned < emailCount || assigned < idCount) {
      toast.warning(
        `Assigned ${assigned} of ${emailCount} messages (${idCount} IDs pasted)`,
      );
    } else {
      toast.success(`Assigned ${assigned} Discord IDs in order`);
    }
  }, [batchId, discordIdPaste, displayRecords]);

  const clearDiscordAssignments = useCallback(() => {
    if (!batchId) return;
    clearBatchMentionMap(batchId);
    setBatchMentionMap({});
    setDiscordIdPaste("");
    toast.success("Discord ID assignments cleared");
  }, [batchId]);

  const resetSentArchive = useCallback(() => {
    if (!batchId) return;
    clearSentArchive(batchId);
    setSentArchive([]);
    toast.success("Sent archive cleared for this import");
  }, [batchId]);

  const clearData = useCallback(() => {
    if (batchId) {
      clearSentArchive(batchId);
      clearBatchMentionMap(batchId);
    }
    setHeaders([]);
    setRawRows([]);
    setColumnMap({});
    setFileName("");
    setBatchId("");
    setSentArchive([]);
    setBatchMentionMap({});
    setDiscordIdPaste("");
    setEmailPaste("");
  }, [batchId]);

  const columnOptions = headers;

  const missingColumns = !columnMap.email || !columnMap.reviews;

  return {
    headers,
    columnMap,
    setColumnMap,
    columnOptions,
    fileName,
    batchId,
    sentArchive,
    batchMentionMap,
    discordIdPaste,
    setDiscordIdPaste,
    assignDiscordIdsInOrder,
    clearDiscordAssignments,
    markSent,
    resetSentArchive,
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
