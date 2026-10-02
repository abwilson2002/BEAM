import { apiGet } from "@/api/client";
import type { HealthResponse } from "@/types";

export function checkBackendHealth(): Promise<HealthResponse> {
  return apiGet<HealthResponse>("/");
}
