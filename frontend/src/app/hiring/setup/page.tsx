"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { INPUT_CLASSES, PRIMARY_BUTTON_CLASSES } from "@/lib/styles";
import { parseCommaList } from "@/lib/text";
import { generateCandidatesList } from "@/services/candidateService";

const MAX_DREAM_CANDIDATES = 3;

export default function HiringSetupPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [hiringRoles, setHiringRoles] = useState("");
  const [dreamCandidates, setDreamCandidates] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const rolesList = parseCommaList(hiringRoles);
    const candidatesList = parseCommaList(dreamCandidates);
    if (rolesList.length === 0) {
      setError("Enter at least one role you are hiring for.");
      return;
    }
    if (candidatesList.length === 0 || candidatesList.length > MAX_DREAM_CANDIDATES) {
      setError(
        `Enter between 1 and ${MAX_DREAM_CANDIDATES} dream candidates, separated by commas.`,
      );
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      await generateCandidatesList({
        companyName: companyName.trim(),
        hiringRoles: rolesList,
        dreamCandidates: candidatesList,
      });
      router.push("/hiring");
    } catch (err) {
      console.error("Failed to generate the candidate list", err);
      setError("Something went wrong generating your list. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-16">
      <Link
        href="/hiring"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <h1 className="text-3xl font-semibold tracking-tight">
        Build your hiring list
      </h1>
      <p className="mt-2 text-slate-500">
        Tell us about your hiring needs and we&apos;ll generate 40 candidates to
        prioritize.
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
            placeholder="Acme Inc."
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
          <span className="block text-xs text-slate-400">
            Separate roles with commas.
          </span>
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">
            3 Dream Candidates
          </span>
          <input
            required
            value={dreamCandidates}
            onChange={(e) => setDreamCandidates(e.target.value)}
            disabled={isLoading}
            placeholder="Jane Smith, John Doe, Alex Johnson"
            className={INPUT_CLASSES}
          />
          <span className="block text-xs text-slate-400">
            Separate candidates with commas.
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
          className={PRIMARY_BUTTON_CLASSES}
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
