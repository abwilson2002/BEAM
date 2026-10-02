import {
  createMockCompany,
  MOCK_COMPANIES,
} from "@/api/mockData";
import type { Company, GenerateCompaniesParams, Score } from "@/types";

/**
 * Company data access for the "Looking" flow.
 *
 * Every function here is the single seam to the backend: to go live, replace
 * each body with a `fetch` to the Python API (keep the signatures) and delete
 * the mock helpers below.
 */

export function generateCompaniesList(
  params: GenerateCompaniesParams,
): Promise<Company[]> {
  return simulateLatency(() => {
    const companies = buildMockList(params);
    saveMockStore(companies);
    return companies;
  }, 2500);
}

export function getCompanies(): Promise<Company[]> {
  return simulateLatency(loadMockStore, 400);
}

export function updateMotivationScore(
  companyId: string,
  newScore: Score,
): Promise<Company> {
  return simulateLatency(() => {
    const companies = loadMockStore();
    const target = companies.find((company) => company.id === companyId);
    if (!target) {
      throw new Error(`Company ${companyId} not found`);
    }
    target.motivationScore = newScore;
    saveMockStore(companies);
    return target;
  }, 300);
}

// ---------------------------------------------------------------------------
// Mock backend — remove when the real API is connected.
// ---------------------------------------------------------------------------

const LIST_SIZE = 40;
const DREAM_MOTIVATION: Score = 3;
const STORE_KEY = "lamp-companies";

function simulateLatency<T>(work: () => T, delayMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(work());
      } catch (error) {
        reject(error);
      }
    }, delayMs);
  });
}

/** Starts from the mock list, rating the candidate's dream companies highest. */
function buildMockList({ dreamCompanies }: GenerateCompaniesParams): Company[] {
  const dreamNames = new Set(dreamCompanies.map(normalizeName));
  const knownNames = new Set(MOCK_COMPANIES.map((c) => normalizeName(c.name)));

  const matched = MOCK_COMPANIES.filter((c) =>
    dreamNames.has(normalizeName(c.name)),
  ).map((c) => ({ ...c, motivationScore: DREAM_MOTIVATION }));

  const unknownDreams = dreamCompanies
    .filter((name) => !knownNames.has(normalizeName(name)))
    .map((name, index) => ({
      ...createMockCompany(`dream-${index + 1}`, name, "Dream Target"),
      motivationScore: DREAM_MOTIVATION,
    }));

  const others = MOCK_COMPANIES.filter(
    (c) => !dreamNames.has(normalizeName(c.name)),
  ).slice(0, LIST_SIZE - matched.length - unknownDreams.length);

  return [...unknownDreams, ...matched, ...others].map((c) => ({ ...c }));
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

// sessionStorage stands in for the database so a page refresh keeps the list.
function loadMockStore(): Company[] {
  try {
    const raw = window.sessionStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as Company[]) : [];
  } catch (error) {
    console.warn("Could not read the mock company store", error);
    return [];
  }
}

function saveMockStore(companies: Company[]): void {
  try {
    window.sessionStorage.setItem(STORE_KEY, JSON.stringify(companies));
  } catch (error) {
    console.warn("Could not write the mock company store", error);
  }
}
