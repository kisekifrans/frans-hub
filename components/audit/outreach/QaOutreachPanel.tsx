"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  RotateCcw,
  Save,
  Table2,
  Trash2,
} from "lucide-react";
import { AuditUploadDropzone } from "@/components/audit/AuditUploadDropzone";
import { QaOutreachDataTable } from "@/components/audit/outreach/QaOutreachDataTable";
import { QaOutreachMessageList } from "@/components/audit/outreach/QaOutreachMessageList";
import { DiscordSettingsCard } from "@/components/tools/qa-outreach/DiscordSettingsCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { useQaOutreach } from "@/hooks/useQaOutreach";
import type { OutreachColumnMap } from "@/lib/audit/outreach/types";
import { cn } from "@/lib/utils";

const inputClass =
  "glass-card w-full rounded-lg border-0 px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 dark:text-zinc-100";

const selectClass = cn(inputClass, "cursor-pointer");

const btnClass =
  "glass-card inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition hover:bg-white/55 dark:hover:bg-white/15";

const PLACEHOLDER_HINT =
  "{{email}}, {{role}}, {{reviews}}, {{median_pace}}, {{hours}}, {{date}}";

export function QaOutreachPanel() {
  const outreach = useQaOutreach();
  const {
    fileName,
    columnMap,
    setColumnMap,
    columnOptions,
    records,
    displayRecords,
    filteredRecords,
    ignoredZeroCount,
    messages,
    sentArchive,
    markSent,
    resetSentArchive,
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
  } = outreach;

  const [showTable, setShowTable] = useState(true);

  const patchMap = (patch: Partial<OutreachColumnMap>) =>
    setColumnMap({ ...columnMap, ...patch });

  const saveThresholds = () => {
    updateSettings({
      lowThreshold: settings.lowThreshold,
      highThreshold: settings.highThreshold,
      ignoreZeroReviews: settings.ignoreZeroReviews,
    });
  };

  const hasData = records.length > 0 && !missingColumns;

  return (
    <div className="space-y-6">
      <GlassCard padding="lg" className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
            Import Productivity CSV
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Export the .csv files from the User Management.
          </p>
        </div>
        <AuditUploadDropzone uploading={uploading} onFile={uploadCsv} />
        {fileName ? (
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <span className="font-medium text-violet-600 dark:text-violet-300">
              {fileName}
            </span>
            <span>· {records.length} imported</span>
            {hasData ? (
              <span>· {displayRecords.length} active for messages</span>
            ) : null}
            {ignoredZeroCount > 0 ? (
              <span className="text-amber-600 dark:text-amber-400">
                · {ignoredZeroCount} with 0 reviews hidden
              </span>
            ) : null}
            <button type="button" className={btnClass} onClick={clearData}>
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>
        ) : null}
      </GlassCard>

      {columnOptions.length > 0 ? (
        <GlassCard padding="lg" className="space-y-3">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
            Column Mapping
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {(
              [
                { key: "email" as const, label: "Email", required: true },
                { key: "role" as const, label: "Role", required: false },
                { key: "reviews" as const, label: "Reviews", required: true },
                {
                  key: "medianPace" as const,
                  label: "Median Pace",
                  required: false,
                },
                { key: "hours" as const, label: "Hours", required: false },
              ] as const
            ).map(({ key, label, required }) => (
              <label key={key} className="space-y-1 text-xs text-zinc-500">
                {label}
                {required ? " *" : ""}
                <select
                  className={selectClass}
                  value={columnMap[key] ?? ""}
                  onChange={(e) =>
                    patchMap({ [key]: e.target.value || undefined })
                  }
                >
                  <option value="">
                    {required ? "— Select —" : "— Optional —"}
                  </option>
                  {columnOptions.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          {missingColumns ? (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Map Email and Reviews to continue.
            </p>
          ) : null}
        </GlassCard>
      ) : null}

      {hasData ? (
        <GlassCard padding="lg" className="space-y-3">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 text-left"
            onClick={() => setShowTable(!showTable)}
          >
            <div className="flex items-center gap-2">
              <Table2 className="h-4 w-4 text-violet-500" />
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
                Imported Data
              </h2>
              <span className="rounded-full bg-zinc-500/10 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-zinc-600 dark:text-zinc-400">
                {filteredRecords.length} rows
              </span>
            </div>
            {showTable ? (
              <ChevronUp className="h-4 w-4 shrink-0 text-zinc-400" />
            ) : (
              <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" />
            )}
          </button>
          {showTable ? (
            <QaOutreachDataTable rows={filteredRecords} dimZeroRows />
          ) : null}
        </GlassCard>
      ) : null}

      <GlassCard padding="lg" className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
          Filter by Email List
        </h2>
        <p className="text-xs text-zinc-500">
          Paste emails from Google Sheets (one per line, or separated by comma/tab).
        </p>
        <textarea
          className={cn(inputClass, "min-h-[120px] font-mono text-xs")}
          placeholder="user1@example.com&#10;user2@example.com"
          value={emailPaste}
          onChange={(e) => setEmailPaste(e.target.value)}
        />
        <div className="flex flex-wrap items-center gap-3">
          <label className={cn(btnClass, "cursor-pointer gap-2")}>
            <input
              type="checkbox"
              className="accent-violet-600"
              checked={filterByPaste}
              onChange={(e) => setFilterByPaste(e.target.checked)}
            />
            Only pasted emails
          </label>
          <span className="text-xs text-zinc-500">
            {pasteEmails.length} in list
            {filterByPaste && pasteEmails.length > 0
              ? ` · ${displayRecords.length} shown`
              : ""}
          </span>
        </div>
      </GlassCard>

      <GlassCard padding="lg" className="space-y-4">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-2 text-left"
          onClick={() => setShowTemplates(!showTemplates)}
        >
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Message Templates
            </h2>
            <p className="text-xs text-zinc-500">{PLACEHOLDER_HINT}</p>
          </div>
          {showTemplates ? (
            <ChevronUp className="h-4 w-4 shrink-0 text-zinc-400" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" />
          )}
        </button>

        {showTemplates ? (
          <div className="space-y-4 border-t border-white/30 pt-4 dark:border-white/10">
            <label className="block max-w-xs space-y-1 text-xs text-zinc-500">
              Period in message ({"{{date}}"})
              <input
                className={inputClass}
                placeholder="e.g. May 27"
                value={fallbackDate}
                onChange={(e) => setFallbackDate(e.target.value)}
              />
            </label>

            <div className="flex flex-wrap items-end gap-3">
              <label
                className={cn(
                  btnClass,
                  "cursor-pointer gap-2 self-end",
                  settings.lowRuleEnabled && "ring-1 ring-amber-500/40",
                )}
              >
                <input
                  type="checkbox"
                  className="accent-amber-600"
                  checked={settings.lowRuleEnabled}
                  onChange={(e) =>
                    updateSettings(
                      { lowRuleEnabled: e.target.checked },
                      { quiet: true },
                    )
                  }
                />
                Reviews &lt; rule
              </label>
              <label className="space-y-1 text-xs text-zinc-500">
                Threshold
                <input
                  type="number"
                  min={0}
                  className={cn(inputClass, "w-20")}
                  value={settings.lowThreshold}
                  disabled={!settings.lowRuleEnabled}
                  onChange={(e) =>
                    updateSettings(
                      { lowThreshold: Number(e.target.value) },
                      { quiet: true },
                    )
                  }
                />
              </label>
              <label
                className={cn(
                  btnClass,
                  "cursor-pointer gap-2 self-end",
                  settings.highRuleEnabled && "ring-1 ring-emerald-500/40",
                )}
              >
                <input
                  type="checkbox"
                  className="accent-emerald-600"
                  checked={settings.highRuleEnabled}
                  onChange={(e) =>
                    updateSettings(
                      { highRuleEnabled: e.target.checked },
                      { quiet: true },
                    )
                  }
                />
                Reviews &gt; rule
              </label>
              <label className="space-y-1 text-xs text-zinc-500">
                Threshold
                <input
                  type="number"
                  min={0}
                  className={cn(inputClass, "w-20")}
                  value={settings.highThreshold}
                  disabled={!settings.highRuleEnabled}
                  onChange={(e) =>
                    updateSettings(
                      { highThreshold: Number(e.target.value) },
                      { quiet: true },
                    )
                  }
                />
              </label>
              <label
                className={cn(
                  btnClass,
                  "cursor-pointer gap-2 self-end",
                  settings.ignoreZeroReviews &&
                    "ring-1 ring-violet-500/40",
                )}
              >
                <input
                  type="checkbox"
                  className="accent-violet-600"
                  checked={settings.ignoreZeroReviews}
                  onChange={(e) =>
                    updateSettings(
                      { ignoreZeroReviews: e.target.checked },
                      { quiet: true },
                    )
                  }
                />
                Ignore 0 reviews
              </label>
              <button type="button" className={btnClass} onClick={saveThresholds}>
                <Save className="h-3.5 w-3.5" />
                Save
              </button>
              <button type="button" className={btnClass} onClick={resetTemplates}>
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>

            {settings.rules.map((rule) => (
              <div key={rule.id} className="space-y-2">
                <p
                  className={cn(
                    "text-xs font-medium text-violet-700 dark:text-violet-300",
                    rule.kind === "lt" &&
                      !settings.lowRuleEnabled &&
                      "opacity-50",
                    rule.kind === "gt" &&
                      !settings.highRuleEnabled &&
                      "opacity-50",
                  )}
                >
                  {rule.label}
                  {rule.kind === "lt"
                    ? settings.lowRuleEnabled
                      ? ` · reviews < ${settings.lowThreshold}`
                      : " · disabled"
                    : rule.kind === "gt"
                      ? settings.highRuleEnabled
                        ? ` · reviews > ${settings.highThreshold}`
                        : " · disabled"
                      : " · fallback when other rules off or no match"}
                </p>
                <textarea
                  className={cn(inputClass, "min-h-[140px] font-mono text-xs")}
                  value={rule.body}
                  onChange={(e) => updateRuleBody(rule.id, e.target.value)}
                  onBlur={() =>
                    updateSettings({ rules: settings.rules }, { quiet: true })
                  }
                />
              </div>
            ))}
          </div>
        ) : null}
      </GlassCard>

      <DiscordSettingsCard />

      {messages.length > 0 ? (
        <GlassCard padding="lg">
          <QaOutreachMessageList
            messages={messages}
            sentArchive={sentArchive}
            onMarkSent={markSent}
            onClearArchive={resetSentArchive}
          />
        </GlassCard>
      ) : hasData ? (
        <p className="text-center text-sm text-zinc-500">
          {filterByPaste && pasteEmails.length > 0
            ? "No rows match your filters."
            : ignoredZeroCount > 0 && settings.ignoreZeroReviews
              ? "All visible rows have 0 reviews (turn off Ignore 0 or adjust filters)."
              : "No messages to generate."}
        </p>
      ) : null}

      {uploading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
        </div>
      ) : null}
    </div>
  );
}
