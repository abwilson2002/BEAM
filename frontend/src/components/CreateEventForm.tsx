"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Plus } from "lucide-react";
import { EVENT_TYPE_LABELS, isValidZip } from "@/lib/events";
import { INPUT_CLASSES, PRIMARY_BUTTON_CLASSES } from "@/lib/styles";
import { createEvent } from "@/services/eventService";
import { EVENT_TYPES, type CareerEvent, type EventType } from "@/types";

interface CreateEventFormProps {
  onCreated: (event: CareerEvent) => void;
}

export default function CreateEventForm({ onCreated }: CreateEventFormProps) {
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState<EventType>("hackathon");
  const [organizer, setOrganizer] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [venue, setVenue] = useState("");
  const [zip, setZip] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setTitle("");
    setOrganizer("");
    setStartsAt("");
    setVenue("");
    setZip("");
    setDescription("");
  }

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (!isValidZip(zip.trim())) {
      setError("Enter a valid 5-digit ZIP code.");
      return;
    }

    setError(null);
    setIsSaving(true);
    try {
      const created = await createEvent({
        title: title.trim(),
        eventType,
        organizer: organizer.trim(),
        description: description.trim(),
        startsAt: new Date(startsAt).toISOString(), // datetime-local is in the user's timezone
        venue: venue.trim(),
        zip: zip.trim(),
      });
      onCreated(created);
      resetForm();
    } catch (err) {
      console.error("Failed to create the event", err);
      setError(err instanceof Error ? err.message : "Could not create the event.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">Event title</span>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSaving}
          placeholder="BYU Spring Hackathon"
          className={INPUT_CLASSES}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Type</span>
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value as EventType)}
            disabled={isSaving}
            className={INPUT_CLASSES}
          >
            {EVENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {EVENT_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Organizer</span>
          <input
            required
            value={organizer}
            onChange={(e) => setOrganizer(e.target.value)}
            disabled={isSaving}
            placeholder="Your company"
            className={INPUT_CLASSES}
          />
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">Date and time</span>
        <input
          required
          type="datetime-local"
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
          disabled={isSaving}
          className={INPUT_CLASSES}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Venue</span>
          <input
            required
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            disabled={isSaving}
            placeholder="Wilkinson Student Center"
            className={INPUT_CLASSES}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">ZIP code</span>
          <input
            required
            inputMode="numeric"
            maxLength={5}
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            disabled={isSaving}
            placeholder="84602"
            className={INPUT_CLASSES}
          />
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">
          Description <span className="font-normal text-slate-400">(optional)</span>
        </span>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSaving}
          className={INPUT_CLASSES}
        />
      </label>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <button type="submit" disabled={isSaving} className={PRIMARY_BUTTON_CLASSES}>
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" />
            Create event
          </>
        )}
      </button>
    </form>
  );
}
