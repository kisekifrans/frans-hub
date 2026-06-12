"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  createCsvBundle,
  mergeCsvBundles,
  type CsvBundle,
} from "@/lib/audit/csv-bundles";
import { parseCsvFile } from "@/lib/audit/csv";
import { detectOutreachColumnMap } from "@/lib/audit/outreach/columns";
import { parseEmailPaste } from "@/lib/audit/outreach/emails";
import { buildOutreachRecords } from "@/lib/audit/outreach/parse";
import type { OutreachColumnMap } from "@/lib/audit/outreach/types";
import {
  computeReviewStats,
  filterByReviewsBelow,
} from "@/lib/audit/review-stats/compute";
import {
  excludeEmailsFromRecords,
  includeOnlyEmailsFromRecords,
} from "@/lib/audit/review-stats/filter";

export function useQaReviewStats() {
  const [csvBundles, setCsvBundles] = useState<CsvBundle[]>([]);
  const [columnMap, setColumnMap] = useState<OutreachColumnMap>({});
  const [uploading, setUploading] = useState(false);
  const [ignoreZeroReviews, setIgnoreZeroReviews] = useState(true);
  const [reviewsBelowThreshold, setReviewsBelowThreshold] = useState(3);
  const [searchEmail, setSearchEmail] = useState("");
  const [excludeEmailPaste, setExcludeEmailPaste] = useState("");
  const [includeEmailPaste, setIncludeEmailPaste] = useState("");
  const [filterByIncludeList, setFilterByIncludeList] = useState(false);

  const merged = useMemo(() => mergeCsvBundles(csvBundles), [csvBundles]);
  const headers = merged.headers;
  const rawRows = merged.rows;

  const addCsvFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    setUploading(true);
    try {
      const added: CsvBundle[] = [];
      let skippedEmpty = 0;

      for (const file of files) {
        const parsed = await parseCsvFile(file);
        if (parsed.rows.length === 0) {
          skippedEmpty++;
          continue;
        }
        added.push(createCsvBundle(parsed, file.name));
      }

      if (added.length === 0) {
        toast.error("No rows found in CSV file(s)");
        return;
      }

      const nextBundles = [...csvBundles, ...added];
      const mergedHeaders = mergeCsvBundles(nextBundles).headers;
      const map = detectOutreachColumnMap(mergedHeaders);

      setCsvBundles(nextBundles);
      if (csvBundles.length === 0) {
        setColumnMap(map);
      }

      const newRows = added.reduce((n, b) => n + b.rows.length, 0);
      const parts = [
        `Added ${added.length} file${added.length === 1 ? "" : "s"} (${newRows} rows)`,
      ];
      if (skippedEmpty > 0) {
        parts.push(`${skippedEmpty} empty skipped`);
      }
      if (!map.email || !map.reviews) {
        toast.warning("Map Email and Reviews columns");
      } else {
        toast.success(parts.join(" · "));
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "CSV import failed");
    } finally {
      setUploading(false);
    }
  }, [csvBundles]);

  const updateCsvBundle = useCallback(
    (
      id: string,
      patch: Partial<Pick<CsvBundle, "reportDate" | "sourceType" | "label">>,
    ) => {
      setCsvBundles((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...patch } : b)),
      );
    },
    [],
  );

  const removeCsvBundle = useCallback((id: string) => {
    setCsvBundles((prev) => {
      const next = prev.filter((b) => b.id !== id);
      if (next.length === 0) setColumnMap({});
      return next;
    });
  }, []);

  const clearData = useCallback(() => {
    setCsvBundles([]);
    setColumnMap({});
    setSearchEmail("");
    setExcludeEmailPaste("");
    setIncludeEmailPaste("");
    setFilterByIncludeList(false);
  }, []);

  const records = useMemo(
    () => buildOutreachRecords(rawRows, columnMap),
    [rawRows, columnMap],
  );

  const mergedRowCount = rawRows.length;
  const undatedFileCount = csvBundles.filter((b) => !b.reportDate?.trim()).length;

  const excludeEmails = useMemo(
    () => parseEmailPaste(excludeEmailPaste),
    [excludeEmailPaste],
  );

  const afterExcludeRecords = useMemo(
    () => excludeEmailsFromRecords(records, excludeEmails),
    [records, excludeEmails],
  );

  const excludedRowCount = records.length - afterExcludeRecords.length;

  const includeEmails = useMemo(
    () => parseEmailPaste(includeEmailPaste),
    [includeEmailPaste],
  );

  const includeListActive =
    filterByIncludeList && includeEmails.length > 0;

  const workingRecords = useMemo(() => {
    if (!includeListActive) return afterExcludeRecords;
    return includeOnlyEmailsFromRecords(afterExcludeRecords, includeEmails);
  }, [afterExcludeRecords, includeEmails, includeListActive]);

  const includeMatchedCount = workingRecords.length;
  const includeMissingCount = includeListActive
    ? includeEmails.length - includeMatchedCount
    : 0;

  const belowThresholdRecords = useMemo(
    () =>
      filterByReviewsBelow(workingRecords, reviewsBelowThreshold, {
        ignoreZeroReviews,
      }),
    [workingRecords, reviewsBelowThreshold, ignoreZeroReviews],
  );

  const datasetStats = useMemo(
    () => computeReviewStats(workingRecords, { ignoreZeroReviews }),
    [workingRecords, ignoreZeroReviews],
  );

  const statsSourceRecords = useMemo(
    () => (includeListActive ? workingRecords : belowThresholdRecords),
    [includeListActive, workingRecords, belowThresholdRecords],
  );

  const filteredStats = useMemo(
    () =>
      computeReviewStats(statsSourceRecords, {
        ignoreZeroReviews: includeListActive ? ignoreZeroReviews : false,
      }),
    [statsSourceRecords, includeListActive, ignoreZeroReviews],
  );

  const tableSourceRecords = useMemo(
    () => (includeListActive ? workingRecords : belowThresholdRecords),
    [includeListActive, workingRecords, belowThresholdRecords],
  );

  const tableRecords = useMemo(() => {
    const q = searchEmail.trim().toLowerCase();
    if (!q) return tableSourceRecords;
    return tableSourceRecords.filter((r) => r.email.includes(q));
  }, [tableSourceRecords, searchEmail]);

  const missingColumns = !columnMap.email || !columnMap.reviews;

  return {
    headers,
    columnMap,
    setColumnMap,
    columnOptions: headers,
    csvBundles,
    mergedRowCount,
    undatedFileCount,
    records,
    addCsvFiles,
    updateCsvBundle,
    removeCsvBundle,
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
    includeEmailPaste,
    setIncludeEmailPaste,
    includeEmails,
    filterByIncludeList,
    setFilterByIncludeList,
    includeListActive,
    includeMatchedCount,
    includeMissingCount,
    workingRecords,
    datasetStats,
    filteredStats,
    belowThresholdRecords,
    tableSourceRecords,
    tableRecords,
  };
}
