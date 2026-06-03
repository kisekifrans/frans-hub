"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { parseCsvFile } from "@/lib/audit/csv";
import { detectOutreachColumnMap } from "@/lib/audit/outreach/columns";
import { parseEmailPaste } from "@/lib/audit/outreach/emails";
import { buildOutreachRecords } from "@/lib/audit/outreach/parse";
import type { OutreachColumnMap } from "@/lib/audit/outreach/types";
import {
  computeReviewStats,
  filterByReviewsBelow,
} from "@/lib/audit/review-stats/compute";
import { excludeEmailsFromRecords } from "@/lib/audit/review-stats/filter";

export function useQaReviewStats() {
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMap, setColumnMap] = useState<OutreachColumnMap>({});
  const [fileName, setFileName] = useState("");
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [uploading, setUploading] = useState(false);
  const [ignoreZeroReviews, setIgnoreZeroReviews] = useState(true);
  const [reviewsBelowThreshold, setReviewsBelowThreshold] = useState(3);
  const [searchEmail, setSearchEmail] = useState("");
  const [excludeEmailPaste, setExcludeEmailPaste] = useState("");

  const uploadCsv = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const parsed = await parseCsvFile(file);
      if (parsed.rows.length === 0) {
        toast.error("No rows found in CSV");
        return;
      }
      const map = detectOutreachColumnMap(parsed.headers);
      setHeaders(parsed.headers);
      setColumnMap(map);
      setFileName(file.name);
      setRawRows(parsed.rows);
      if (!map.email || !map.reviews) {
        toast.warning("Map Email and Reviews columns");
      } else {
        toast.success(`Loaded ${parsed.rows.length} rows`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "CSV import failed");
    } finally {
      setUploading(false);
    }
  }, []);

  const clearData = useCallback(() => {
    setHeaders([]);
    setColumnMap({});
    setFileName("");
    setRawRows([]);
    setSearchEmail("");
    setExcludeEmailPaste("");
  }, []);

  const records = useMemo(
    () => buildOutreachRecords(rawRows, columnMap),
    [rawRows, columnMap],
  );

  const excludeEmails = useMemo(
    () => parseEmailPaste(excludeEmailPaste),
    [excludeEmailPaste],
  );

  const workingRecords = useMemo(
    () => excludeEmailsFromRecords(records, excludeEmails),
    [records, excludeEmails],
  );

  const excludedRowCount = records.length - workingRecords.length;

  const belowThresholdRecords = useMemo(
    () =>
      filterByReviewsBelow(workingRecords, reviewsBelowThreshold, {
        ignoreZeroReviews,
      }),
    [workingRecords, reviewsBelowThreshold, ignoreZeroReviews],
  );

  /** Stats for everyone (ignore 0 only) — used for total row count context */
  const datasetStats = useMemo(
    () => computeReviewStats(workingRecords, { ignoreZeroReviews }),
    [workingRecords, ignoreZeroReviews],
  );

  /** Stats for reviewers matching Reviews < threshold (what filters drive) */
  const filteredStats = useMemo(
    () => computeReviewStats(belowThresholdRecords, { ignoreZeroReviews: false }),
    [belowThresholdRecords],
  );

  const tableRecords = useMemo(() => {
    const q = searchEmail.trim().toLowerCase();
    if (!q) return belowThresholdRecords;
    return belowThresholdRecords.filter((r) => r.email.includes(q));
  }, [belowThresholdRecords, searchEmail]);

  const missingColumns = !columnMap.email || !columnMap.reviews;

  return {
    headers,
    columnMap,
    setColumnMap,
    columnOptions: headers,
    fileName,
    records,
    uploadCsv,
    uploading,
    clearData,
    missingColumns,
    ignoreZeroReviews,
    setIgnoreZeroReviews,
    reviewsBelowThreshold,
    setReviewsBelowThreshold,
    searchEmail,
    setSearchEmail,
    excludeEmailPaste,
    setExcludeEmailPaste,
    excludeEmails,
    excludedRowCount,
    workingRecords,
    datasetStats,
    filteredStats,
    belowThresholdRecords,
    tableRecords,
  };
}
