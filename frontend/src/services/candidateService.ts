import type { GenerateCandidatesParams } from "@/types";

const MOCK_LATENCY_MS = 2500;

/**
 * Mock until the backend can source candidates: replace the body with a call
 * to the API (via `apiPost`) and return the generated list.
 */
export function generateCandidatesList(
  params: GenerateCandidatesParams,
): Promise<void> {
  void params;
  return new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
}
