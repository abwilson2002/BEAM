import { apiGet } from "@/api/client";
import type { HeatmapPoint, JobInterest } from "@/types";

interface HeatmapResponse {
  count: number;
  data: Array<{ lat: number | null; lng: number | null }>;
}

/** Seeker locations, optionally limited to one job interest. */
export async function getHeatmapPoints(
  interest?: JobInterest,
): Promise<HeatmapPoint[]> {
  const query = interest ? `?interest=${encodeURIComponent(interest)}` : "";
  const response = await apiGet<HeatmapResponse>(`/api/heatmap${query}`);
  return response.data.filter(
    (row): row is HeatmapPoint => row.lat !== null && row.lng !== null,
  );
}
