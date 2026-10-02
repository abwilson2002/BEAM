"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import EventCard from "@/components/EventCard";
import { isValidZip } from "@/lib/events";
import { INPUT_CLASSES } from "@/lib/styles";
import { findNearbyEvents } from "@/services/eventService";
import type { NearbyEvent } from "@/types";

export default function NearbyEventsPage() {
  const [zip, setZip] = useState("");
  const [results, setResults] = useState<NearbyEvent[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedZip = zip.trim();
    if (!isValidZip(trimmedZip)) {
      setError("Enter a valid 5-digit ZIP code.");
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      setResults(await findNearbyEvents(trimmedZip));
    } catch (err) {
      console.error("Failed to find nearby events", err);
      setResults(null);
      setError(err instanceof Error ? err.message : "Could not load events.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <Link
        href="/looking/dashboard"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to your list
      </Link>

      <h1 className="text-3xl font-semibold tracking-tight">
        Find events near you
      </h1>
      <p className="mt-2 text-slate-500">
        Enter your ZIP code and we&apos;ll show upcoming hackathons, info
        sessions and more, closest first.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex gap-3">
        <input
          required
          inputMode="numeric"
          maxLength={5}
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          disabled={isLoading}
          placeholder="ZIP code, e.g. 84602"
          aria-label="ZIP code"
          className={INPUT_CLASSES}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Search
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}

      {results?.length === 0 && (
        <p className="mt-8 text-slate-500">
          No upcoming events yet. Check back soon.
        </p>
      )}
      {results && results.length > 0 && (
        <ul className="mt-8 space-y-4">
          {results.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </ul>
      )}
    </main>
  );
}
