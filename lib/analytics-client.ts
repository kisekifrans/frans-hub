import { getVisitorId } from "@/lib/track";

export type TrackEventType = "view" | "click";

export interface TrackPayload {
  profileId: string;
  eventType: TrackEventType;
  blockId?: string;
  collectionId?: string;
  productId?: string;
}

export interface TrackCollectionPayload {
  profileId: string;
  eventType: TrackEventType;
  collectionId: string;
  productId?: string;
}

export async function trackCollectionEvent(
  payload: TrackCollectionPayload,
): Promise<void> {
  const visitorId = getVisitorId();
  await fetch("/api/analytics/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, visitorId }),
    keepalive: true,
  });
}

export async function trackAnalyticsEvent(payload: TrackPayload): Promise<void> {
  const visitorId = getVisitorId();
  await fetch("/api/analytics/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, visitorId }),
    keepalive: true,
  });
}
