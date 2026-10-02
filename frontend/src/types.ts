/** A 1–3 rating, used for both Postings (from the backend) and Motivation (from the user). */
export type Score = 1 | 2 | 3;

export interface Company {
  id: string;
  name: string;
  industry: string;
  /** True when the candidate's university has alumni working at this company. */
  hasAlumni: boolean;
  /** How strongly the company is currently hiring for the target role. */
  postingsScore: Score;
  /** How much the candidate wants to work here. Editable by the user. */
  motivationScore: Score;
}

/** Response of the backend's GET / endpoint. */
export interface HealthResponse {
  status: string;
}

/** Input collected by the /looking/setup form. */
export interface GenerateCompaniesParams {
  university: string;
  targetRole: string;
  dreamCompanies: string[];
}

/** A seeker's location, as returned by the backend's GET /api/heatmap. */
export interface HeatmapPoint {
  lat: number;
  lng: number;
}

export const JOB_INTERESTS = [
  "Software Engineering",
  "Cybersecurity",
  "Data Analytics",
] as const;
export type JobInterest = (typeof JOB_INTERESTS)[number];

export const EVENT_TYPES = [
  "hackathon",
  "info_session",
  "career_fair",
  "workshop",
  "networking",
  "other",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export interface CareerEvent {
  id: string;
  title: string;
  eventType: EventType;
  organizer: string;
  description: string;
  /** ISO 8601 timestamp. */
  startsAt: string;
  venue: string;
  zip: string;
  lat: number;
  lng: number;
}

export interface NearbyEvent extends CareerEvent {
  distanceMiles: number;
}

/** Input collected by the "create event" form. */
export interface CreateEventParams {
  title: string;
  eventType: EventType;
  organizer: string;
  description: string;
  /** ISO 8601 timestamp, including the timezone. */
  startsAt: string;
  venue: string;
  zip: string;
}
