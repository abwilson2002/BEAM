import type { Company } from "@/types";

const ALUMNI_POINTS = 1;

/** LAMP priority: Motivation + Postings + a point for an alumni connection. */
export function calculatePriorityScore(company: Company): number {
  return (
    company.motivationScore +
    company.postingsScore +
    (company.hasAlumni ? ALUMNI_POINTS : 0)
  );
}

/** Highest priority first; ties fall back to name so the order is stable. */
export function sortByPriority(companies: Company[]): Company[] {
  return [...companies].sort(
    (a, b) =>
      calculatePriorityScore(b) - calculatePriorityScore(a) ||
      a.name.localeCompare(b.name),
  );
}
