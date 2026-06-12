"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  addTimelineEvent,
  deleteTimelineEvent,
  getTimelineEventsServerSnapshot,
  getTimelineEventsSnapshot,
  subscribeTimelineEvents,
  updateTimelineEvent,
} from "@/lib/audit/review-stats/timeline-storage";
import type { TimelineEventType } from "@/lib/audit/review-stats/types";

export function useTimelineEvents() {
  const events = useSyncExternalStore(
    subscribeTimelineEvents,
    getTimelineEventsSnapshot,
    getTimelineEventsServerSnapshot,
  );

  const addEvent = useCallback(
    (input: {
      date: string;
      type: TimelineEventType;
      title: string;
      description?: string;
      durationMinutes?: number;
    }) => {
      addTimelineEvent(input);
    },
    [],
  );

  const updateEvent = useCallback(
    (
      id: string,
      patch: Partial<{
        date: string;
        type: TimelineEventType;
        title: string;
        description?: string;
        durationMinutes?: number;
      }>,
    ) => {
      updateTimelineEvent(id, patch);
    },
    [],
  );

  const deleteEvent = useCallback((id: string) => {
    deleteTimelineEvent(id);
  }, []);

  return { events, addEvent, updateEvent, deleteEvent };
}
