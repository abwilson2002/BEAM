"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { getHeatmapPoints } from "@/services/heatmapService";
import { INPUT_CLASSES } from "@/lib/styles";
import { JOB_INTERESTS, type HeatmapPoint, type JobInterest } from "@/types";

// mapbox-gl needs the browser, so never render it on the server.
const Heatmap = dynamic(() => import("./Heatmap"), { ssr: false });

export default function SeekerHeatmap() {
  const [interest, setInterest] = useState<JobInterest | "">("");
  const [points, setPoints] = useState<HeatmapPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isStale = false; // ignore a slow response if the filter changed meanwhile
    getHeatmapPoints(interest || undefined)
      .then((loaded) => {
        if (isStale) return;
        setError(null);
        setPoints(loaded);
      })
      .catch((err) => {
        if (isStale) return;
        console.error("Failed to load the heatmap", err);
        setError(err instanceof Error ? err.message : "Could not load the heatmap.");
      });
    return () => {
      isStale = true;
    };
  }, [interest]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          <span className="font-semibold tabular-nums text-slate-900">
            {points.length}
          </span>{" "}
          seekers shown
        </p>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          Interest
          <select
            value={interest}
            onChange={(e) => setInterest(e.target.value as JobInterest | "")}
            className={`${INPUT_CLASSES} w-auto`}
          >
            <option value="">All interests</option>
            {JOB_INTERESTS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="h-[480px] overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
        <Heatmap points={points} />
      </div>
    </div>
  );
}
