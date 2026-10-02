import type { EventType } from "@/types";

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  hackathon: "Hackathon",
  info_session: "Info session",
  career_fair: "Career fair",
  workshop: "Workshop",
  networking: "Networking",
  other: "Other",
};

const ZIP_PATTERN = /^\d{5}$/;

export function isValidZip(zip: string): boolean {
  return ZIP_PATTERN.test(zip);
}

export function formatEventDate(isoTimestamp: string): string {
  return new Date(isoTimestamp).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
