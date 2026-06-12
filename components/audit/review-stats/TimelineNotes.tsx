"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Clock,
  Pencil,
  Plus,
  ServerCrash,
  Shield,
  Trash2,
  Zap,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatDisplayDate } from "@/lib/audit/review-stats/date-detect";
import {
  TIMELINE_EVENT_LABELS,
  type TimelineEvent,
  type TimelineEventType,
} from "@/lib/audit/review-stats/types";
import { cn } from "@/lib/utils";

const inputClass =
  "glass-card w-full rounded-lg border-0 px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 dark:text-zinc-100";

const btnClass =
  "glass-card inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition hover:bg-white/55 dark:hover:bg-white/15";

const EVENT_ICONS: Record<TimelineEventType, typeof AlertTriangle> = {
  bug: AlertTriangle,
  priority_change: Zap,
  training: BookOpen,
  downtime: ServerCrash,
  policy_update: Shield,
  other: Clock,
};

const EVENT_COLORS: Record<TimelineEventType, string> = {
  bug: "text-rose-600 bg-rose-500/15",
  priority_change: "text-amber-700 bg-amber-500/15",
  training: "text-sky-700 bg-sky-500/15",
  downtime: "text-zinc-600 bg-zinc-500/15",
  policy_update: "text-violet-700 bg-violet-500/15",
  other: "text-fuchsia-700 bg-fuchsia-500/15",
};

interface TimelineNotesProps {
  events: TimelineEvent[];
  onAdd: (input: {
    date: string;
    type: TimelineEventType;
    title: string;
    description?: string;
    durationMinutes?: number;
  }) => void;
  onUpdate: (
    id: string,
    patch: Partial<Omit<TimelineEvent, "id" | "createdAt">>,
  ) => void;
  onDelete: (id: string) => void;
}

export function TimelineNotes({
  events,
  onAdd,
  onUpdate,
  onDelete,
}: TimelineNotesProps) {
  const [date, setDate] = useState("");
  const [type, setType] = useState<TimelineEventType>("training");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, TimelineEvent[]>();
    for (const e of events) {
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    }
    return [...map.entries()].sort(([a], [b]) => b.localeCompare(a));
  }, [events]);

  const resetForm = () => {
    setDate("");
    setType("training");
    setTitle("");
    setDescription("");
    setDurationMinutes("");
    setEditingId(null);
  };

  const submit = () => {
    if (!date.trim() || !title.trim()) return;
    const duration = durationMinutes.trim()
      ? Number(durationMinutes)
      : undefined;
    if (editingId) {
      onUpdate(editingId, {
        date: date.trim(),
        type,
        title: title.trim(),
        description: description.trim() || undefined,
        durationMinutes:
          duration != null && Number.isFinite(duration) ? duration : undefined,
      });
    } else {
      onAdd({
        date: date.trim(),
        type,
        title: title.trim(),
        description: description.trim() || undefined,
        durationMinutes:
          duration != null && Number.isFinite(duration) ? duration : undefined,
      });
    }
    resetForm();
  };

  const startEdit = (event: TimelineEvent) => {
    setEditingId(event.id);
    setDate(event.date);
    setType(event.type);
    setTitle(event.title);
    setDescription(event.description ?? "");
    setDurationMinutes(
      event.durationMinutes != null ? String(event.durationMinutes) : "",
    );
  };

  return (
    <GlassCard padding="lg" className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
          Timeline Notes
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Add dated events that may explain productivity shifts. Notes appear on
          the trend chart and persist in this browser.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
        <label className="space-y-1 text-xs text-zinc-500 lg:col-span-1">
          Date
          <input
            type="date"
            className={inputClass}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <label className="space-y-1 text-xs text-zinc-500 lg:col-span-1">
          Type
          <select
            className={cn(inputClass, "cursor-pointer")}
            value={type}
            onChange={(e) => setType(e.target.value as TimelineEventType)}
          >
            {(Object.keys(TIMELINE_EVENT_LABELS) as TimelineEventType[]).map(
              (key) => (
                <option key={key} value={key}>
                  {TIMELINE_EVENT_LABELS[key]}
                </option>
              ),
            )}
          </select>
        </label>
        <label className="space-y-1 text-xs text-zinc-500 lg:col-span-2">
          Title
          <input
            className={inputClass}
            placeholder="QA Training Session"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className="space-y-1 text-xs text-zinc-500 lg:col-span-1">
          Duration (min)
          <input
            type="number"
            min={0}
            className={inputClass}
            placeholder="60"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
          />
        </label>
        <div className="flex items-end gap-2 lg:col-span-1">
          <button
            type="button"
            className={cn(
              btnClass,
              "w-full justify-center bg-violet-600 text-white hover:bg-violet-500",
            )}
            onClick={submit}
            disabled={!date || !title.trim()}
          >
            <Plus className="h-3.5 w-3.5" />
            {editingId ? "Save" : "Add"}
          </button>
        </div>
        <label className="space-y-1 text-xs text-zinc-500 sm:col-span-2 lg:col-span-6">
          Description
          <input
            className={inputClass}
            placeholder="Optional details…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
      </div>

      {editingId ? (
        <button type="button" className={btnClass} onClick={resetForm}>
          Cancel edit
        </button>
      ) : null}

      {grouped.length === 0 ? (
        <p className="py-4 text-center text-sm text-zinc-500">
          No timeline notes yet. Add bugs, training, or priority changes to
          annotate the chart.
        </p>
      ) : (
        <ul className="space-y-3">
          {grouped.map(([day, dayEvents]) => (
            <li key={day}>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                {formatDisplayDate(day)}
              </p>
              <ul className="space-y-1.5">
                {dayEvents.map((event) => {
                  const Icon = EVENT_ICONS[event.type];
                  return (
                    <li
                      key={event.id}
                      className="flex items-start gap-2 rounded-lg border border-white/40 bg-white/20 px-3 py-2 text-xs dark:border-white/10 dark:bg-white/5"
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                          EVENT_COLORS[event.type],
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-zinc-800 dark:text-zinc-100">
                          {TIMELINE_EVENT_LABELS[event.type]}: {event.title}
                        </p>
                        {event.description ? (
                          <p className="mt-0.5 text-zinc-500">
                            {event.description}
                          </p>
                        ) : null}
                        {event.durationMinutes != null ? (
                          <p className="mt-0.5 text-zinc-400">
                            {event.durationMinutes} min
                          </p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          className={cn(btnClass, "px-2 py-1")}
                          onClick={() => startEdit(event)}
                          aria-label="Edit event"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          className={cn(btnClass, "px-2 py-1")}
                          onClick={() => onDelete(event.id)}
                          aria-label="Delete event"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
