"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, Loader2 } from "lucide-react";
import CompanyTable from "@/components/CompanyTable";
import { sortByPriority } from "@/lib/lamp";
import { getCompanies, updateMotivationScore } from "@/services/companyService";
import type { Company, Score } from "@/types";

export default function LookingDashboardPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCompanies()
      .then((loaded) => {
        if (loaded.length === 0) {
          router.replace("/looking/setup");
          return;
        }
        setCompanies(loaded);
      })
      .catch((err) => {
        console.error("Failed to load companies", err);
        setError("We couldn't load your list. Please refresh to try again.");
      });
  }, [router]);

  const sortedCompanies = useMemo(
    () => (companies ? sortByPriority(companies) : []),
    [companies],
  );

  function setMotivation(companyId: string, score: Score) {
    setCompanies((current) =>
      current
        ? current.map((c) =>
            c.id === companyId ? { ...c, motivationScore: score } : c,
          )
        : current,
    );
  }

  async function handleMotivationChange(companyId: string, score: Score) {
    const previous = companies?.find((c) => c.id === companyId)?.motivationScore;
    if (previous === undefined || previous === score) return;

    setError(null);
    setMotivation(companyId, score); // optimistic: the row re-sorts instantly
    try {
      await updateMotivationScore(companyId, score);
    } catch (err) {
      console.error("Failed to save motivation score", err);
      setMotivation(companyId, previous);
      setError("We couldn't save that change, so it was reverted.");
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/looking/setup"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Start over
        </Link>
        <Link
          href="/looking/events"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          <CalendarDays className="h-4 w-4" />
          Find events near you
        </Link>
      </div>

      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Your LAMP list
        </h1>
        <p className="mt-2 text-slate-500">
          Rate your Motivation from 1 to 3 for each company. Priority ={" "}
          <span className="font-medium text-slate-700">
            Motivation + Postings + 1 if you have alumni there
          </span>
          , highest first.
        </p>
      </header>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {companies ? (
        <CompanyTable
          companies={sortedCompanies}
          onMotivationChange={handleMotivationChange}
        />
      ) : (
        !error && (
          <div className="flex items-center justify-center gap-2 py-24 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading your list...
          </div>
        )
      )}
    </main>
  );
}
