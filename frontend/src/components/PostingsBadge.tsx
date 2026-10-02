import type { Score } from "@/types";

const BADGE_STYLES: Record<Score, string> = {
  1: "bg-slate-100 text-slate-600 ring-slate-200",
  2: "bg-amber-50 text-amber-700 ring-amber-200",
  3: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

export default function PostingsBadge({ score }: { score: Score }) {
  return (
    <span
      className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ring-1 ring-inset ${BADGE_STYLES[score]}`}
    >
      {score}
    </span>
  );
}
