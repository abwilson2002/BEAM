"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { listEvents } from "@/services/eventService";
import type { CareerEvent } from "@/types";
import CreateEventForm from "./CreateEventForm";
import EventCard from "./EventCard";

function byStartTime(a: CareerEvent, b: CareerEvent): number {
  return a.startsAt.localeCompare(b.startsAt);
}

export default function EventsPanel() {
  const [events, setEvents] = useState<CareerEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listEvents()
      .then(setEvents)
      .catch((err) => {
        console.error("Failed to load events", err);
        setError(err instanceof Error ? err.message : "Could not load events.");
      });
  }, []);

  function handleCreated(created: CareerEvent) {
    setEvents((current) => [...(current ?? []), created].sort(byStartTime));
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <CreateEventForm onCreated={handleCreated} />

      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Upcoming events
        </h3>
        {error && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {!error && events === null && (
          <div className="flex items-center gap-2 py-8 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading events...
          </div>
        )}
        {events?.length === 0 && (
          <p className="text-sm text-slate-500">
            No upcoming events yet. Create the first one.
          </p>
        )}
        {events && events.length > 0 && (
          <ul className="space-y-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
