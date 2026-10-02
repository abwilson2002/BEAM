import { Check, X } from "lucide-react";
import { calculatePriorityScore } from "@/lib/lamp";
import type { Company, Score } from "@/types";
import MotivationSelector from "./MotivationSelector";
import PostingsBadge from "./PostingsBadge";

interface CompanyTableProps {
  /** Already sorted in display order. */
  companies: Company[];
  onMotivationChange: (companyId: string, score: Score) => void;
}

const HEADERS = [
  { label: "#", className: "w-12" },
  { label: "Company" },
  { label: "Industry" },
  { label: "Alumni", className: "text-center" },
  { label: "Postings", className: "text-center" },
  { label: "Motivation", className: "text-center" },
  { label: "Priority", className: "text-right" },
];

export default function CompanyTable({
  companies,
  onMotivationChange,
}: CompanyTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            {HEADERS.map(({ label, className = "" }) => (
              <th key={label} scope="col" className={`px-4 py-3 ${className}`}>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {companies.map((company, index) => (
            <tr key={company.id} className="hover:bg-slate-50/70">
              <td className="px-4 py-3 text-slate-400 tabular-nums">
                {index + 1}
              </td>
              <td className="px-4 py-3 font-medium text-slate-900">
                {company.name}
              </td>
              <td className="px-4 py-3 text-slate-500">{company.industry}</td>
              <td className="px-4 py-3">
                <div className="flex justify-center">
                  {company.hasAlumni ? (
                    <Check
                      className="h-5 w-5 text-emerald-600"
                      aria-label="Has alumni"
                    />
                  ) : (
                    <X
                      className="h-5 w-5 text-slate-300"
                      aria-label="No alumni"
                    />
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-center">
                  <PostingsBadge score={company.postingsScore} />
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-center">
                  <MotivationSelector
                    companyName={company.name}
                    value={company.motivationScore}
                    onChange={(score) => onMotivationChange(company.id, score)}
                  />
                </div>
              </td>
              <td className="px-4 py-3 text-right text-base font-semibold tabular-nums text-slate-900">
                {calculatePriorityScore(company)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
