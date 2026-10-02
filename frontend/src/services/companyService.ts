import { apiPost } from "@/api/client";
import type { Company, GenerateCompaniesParams, Score } from "@/types";

/**
 * Company data access for the "Looking" flow.
 *
 * `generateCompaniesList` talks to the FastAPI backend. `getCompanies` and
 * `updateMotivationScore` are still mocked (sessionStorage) until the backend
 * can persist lists: replace their bodies with API calls and delete the mock
 * helpers below.
 */

export async function generateCompaniesList(
  params: GenerateCompaniesParams,
): Promise<Company[]> {
  const companies = await apiPost<Company[]>("/api/lamp/generate", params);
  saveMockStore(companies);
  return companies;
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
// Mock persistence — remove when the backend stores the lists.
// ---------------------------------------------------------------------------

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
