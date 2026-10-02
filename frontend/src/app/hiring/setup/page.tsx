"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { generateCompaniesList } from "@/services/companyService";

const MAX_DREAM_COMPANIES = 3;

const INPUT_CLASSES =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-2 focus:outline-indigo-500/30 disabled:bg-slate-100";

function parseCommaList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function HiringSetupPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [hiringRoles, setHiringRoles] = useState("");
  const [dreamEmployees, setDreamEmployees] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const dreamList = parseCommaList(dreamEmployees);
    if (dreamList.length === 0 || dreamList.length > MAX_DREAM_COMPANIES) {
      setError(
        `Enter between 1 and ${MAX_DREAM_COMPANIES} dream candidates, separated by commas.`,
      );
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      await generateCompaniesList({
        university: companyName.trim(),
        targetRole: hiringRoles.trim(),
        dreamCompanies: dreamList,
      });
      router.push("/looking/dashboard");
    } catch (err) {
      console.error("Failed to generate the company list", err);
      setError("Something went wrong generating your list. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-16">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <h1>
        Build your hiring list
      </h1>

      <p>
        Tell us about your hiring needs and we&apos;ll generate 40 candidates
        to prioritize.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">
            Company Name
          </span>
          <input
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            disabled={isLoading}
            placeholder="Brigham Young University"
            className={INPUT_CLASSES}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">
            Hiring Roles
          </span>
          <input
            required
            value={hiringRoles}
            onChange={(e) => setHiringRoles(e.target.value)}
            disabled={isLoading}
            placeholder="Full-Stack Engineer, Product Manager"
            className={INPUT_CLASSES}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">
            3 Dream Candidates
          </span>
          <input
            required
            value={dreamEmployees}
            onChange={(e) => setDreamEmployees(e.target.value)}
            disabled={isLoading}
            placeholder="Jane Smith, John Doe, Alex Johnson"
            className={INPUT_CLASSES}
          />
          <span className="block text-xs text-slate-400">
            Separate employees with commas.
          </span>
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              AI is sourcing candidates...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Candidate List
            </>
          )}
        </button>
      </form>
    </main>
  );
}
