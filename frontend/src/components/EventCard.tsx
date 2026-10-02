import { Building2, Calendar, MapPin } from "lucide-react";
import { EVENT_TYPE_LABELS, formatEventDate } from "@/lib/events";
import type { CareerEvent, NearbyEvent } from "@/types";

function hasDistance(event: CareerEvent | NearbyEvent): event is NearbyEvent {
  return "distanceMiles" in event;
}

export default function EventCard({ event }: { event: CareerEvent | NearbyEvent }) {
  return (
    <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="inline-block rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
            {EVENT_TYPE_LABELS[event.eventType]}
          </span>
          <h3 className="text-base font-semibold text-slate-900">
            {event.title}
          </h3>
        </div>
        {hasDistance(event) && (
          <span className="shrink-0 rounded-lg bg-emerald-50 px-2.5 py-1 text-sm font-semibold tabular-nums text-emerald-700">
            {event.distanceMiles} mi
          </span>
        )}
      </div>

      <dl className="mt-3 space-y-1.5 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-slate-400" />
          <dt className="sr-only">Organizer</dt>
          <dd>{event.organizer}</dd>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <dt className="sr-only">When</dt>
          <dd>{formatEventDate(event.startsAt)}</dd>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-slate-400" />
          <dt className="sr-only">Where</dt>
          <dd>
            {event.venue} · {event.zip}
          </dd>
        </div>
      </dl>

      {event.description && (
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          {event.description}
        </p>
      )}
    </li>
  );
}
