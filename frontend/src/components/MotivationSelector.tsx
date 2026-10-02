import type { Score } from "@/types";

const SCORES: readonly Score[] = [1, 2, 3];

interface MotivationSelectorProps {
  companyName: string;
  value: Score;
  onChange: (score: Score) => void;
}

export default function MotivationSelector({
  companyName,
  value,
  onChange,
}: MotivationSelectorProps) {
  return (
    <div
      role="group"
      aria-label={`Motivation for ${companyName}`}
      className="inline-flex rounded-lg bg-slate-100 p-0.5"
    >
      {SCORES.map((score) => {
        const isSelected = score === value;
        return (
          <button
            key={score}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onChange(score)}
            className={`h-7 w-8 rounded-md text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-indigo-600 ${
              isSelected
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-500 hover:bg-white hover:text-slate-900"
            }`}
          >
            {score}
          </button>
        );
      })}
    </div>
  );
}
