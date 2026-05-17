"use client";

import { useTranslations } from "next-intl";

/** Locale-aware strings for the Academic Audit tool (replaces static copy.ts). */
export function useAcademicAuditCopy() {
  const t = useTranslations("academicaudit");

  return {
    title: t("title"),
    subtitle: t("subtitle"),
    tagline: t("tagline"),
    disclaimerTitle: t("disclaimerTitle"),
    disclaimerBody: t("disclaimerBody"),
    uploadTitle: t("uploadTitle"),
    uploadHint: t("uploadHint"),
    uploadLimit: t("uploadLimit"),
    optionsTitle: t("optionsTitle"),
    optionsHint: t("optionsHint"),
    excludeToc: t("excludeToc"),
    excludeBibliography: t("excludeBibliography"),
    excludeAppendix: t("excludeAppendix"),
    excludeCaptions: t("excludeCaptions"),
    excludePagesLabel: t("excludePagesLabel"),
    excludePagesHint: t("excludePagesHint"),
    processing: t("processing"),
    processingHint: t("processingHint"),
    summaryTitle: t("summaryTitle"),
    pageCount: t("pageCount"),
    avgScore: t("avgScore"),
    kuat: t("kuat"),
    sedang: t("sedang"),
    ringan: t("ringan"),
    natural: t("natural"),
    excludedTitle: t("excludedTitle"),
    interpretation: t("interpretation"),
    paragraphs: t("paragraphs"),
    download: t("download"),
    newDoc: t("newDoc"),
    scoreLabel: t("scoreLabel"),
    truncated: t("truncated"),
    errorGeneric: t("errorGeneric"),
    backHub: t("backHub"),
    loading: t("loading"),
  };
}
