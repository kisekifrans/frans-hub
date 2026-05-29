"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { parseCsvFile } from "@/lib/audit/csv";
import { detectOutreachColumnMap } from "@/lib/audit/outreach/columns";
import { buildOutreachRecords } from "@/lib/audit/outreach/parse";
import type { OutreachColumnMap } from "@/lib/audit/outreach/types";
import {
  computeReviewStats,
  filterByReviewsBelow,
} from "@/lib/audit/review-stats/compute";

export function useQaReviewStats() {
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMap, setColumnMap] = useState<OutreachColumnMap>({});
  const [fileName, setFileName] = useState("");
  const [records, setRecords] = useState<ReturnType<typeof buildOutreachRecords>>(
    [],
  );
  const [uploading, setUploading] = useState(false);
  const [ignoreZeroReviews, setIgnoreZeroReviews] = useState(true);
  const [reviewsBelowThreshold, setReviewsBelowThreshold] = useState(3);
  const [searchEmail, setSearchEmail] = useState("");

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
      setRecords(buildOutreachRecords(parsed.rows, map));
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
    setRecords([]);
    setSearchEmail("");
  }, []);

  const stats = useMemo(
    () => computeReviewStats(records, { ignoreZeroReviews }),
    [records, ignoreZeroReviews],
  );

  const belowThresholdRecords = useMemo(
    () =>
      filterByReviewsBelow(records, reviewsBelowThreshold, {
        ignoreZeroReviews,
      }),
    [records, reviewsBelowThreshold, ignoreZeroReviews],
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
    stats,
    belowThresholdRecords,
    tableRecords,
  };
}
