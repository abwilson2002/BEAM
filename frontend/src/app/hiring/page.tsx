import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EventsPanel from "@/components/EventsPanel";
import SeekerHeatmap from "@/components/SeekerHeatmap";

export default function HiringPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">
          Employer Dashboard
        </h1>
        <p className="mt-2 text-slate-500">
          See where candidates are, then host an event near them.
        </p>
      </header>

      <section className="mb-14">
        <h2 className="mb-4 text-xl font-semibold">Where candidates are</h2>
        <SeekerHeatmap />
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Events</h2>
        <EventsPanel />
      </section>
    </main>
  );
}
