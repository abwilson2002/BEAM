import { apiGet, apiPost } from "@/api/client";
import type { CareerEvent, CreateEventParams, NearbyEvent } from "@/types";

export function createEvent(params: CreateEventParams): Promise<CareerEvent> {
  return apiPost<CareerEvent>("/api/events", params);
}

export function listEvents(): Promise<CareerEvent[]> {
  return apiGet<CareerEvent[]>("/api/events");
}

/** Upcoming events, closest to the given ZIP code first. */
export function findNearbyEvents(zip: string): Promise<NearbyEvent[]> {
  return apiGet<NearbyEvent[]>(`/api/events/nearby?zip=${encodeURIComponent(zip)}`);
}
