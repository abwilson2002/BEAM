"use client"; // Mapbox only runs in the browser

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { HeatmapPoint } from "@/types";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const SOURCE_ID = "seekers";
const LAYER_ID = "seekers-heat";
const US_CENTER: [number, number] = [-98.5795, 39.8283];

function toGeoJson(
  points: HeatmapPoint[],
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: "FeatureCollection",
    features: points.map((point) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [point.lng, point.lat] },
      properties: {},
    })),
  };
}

export default function Heatmap({ points }: { points: HeatmapPoint[] }) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const latestPoints = useRef(points);

  // Push new points into the map whenever they change (e.g. a filter was applied).
  useEffect(() => {
    latestPoints.current = points;
    const source = map.current?.getSource(SOURCE_ID) as
      | mapboxgl.GeoJSONSource
      | undefined;
    source?.setData(toGeoJson(points));
  }, [points]);

  useEffect(() => {
    if (!MAPBOX_TOKEN || !container.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const instance = new mapboxgl.Map({
      container: container.current,
      style: "mapbox://styles/mapbox/dark-v11", // dark makes the heat pop
      center: US_CENTER,
      zoom: 3.5,
    });
    map.current = instance;

    instance.on("load", () => {
      instance.addSource(SOURCE_ID, {
        type: "geojson",
        data: toGeoJson(latestPoints.current),
      });
      instance.addLayer({
        id: LAYER_ID,
        type: "heatmap",
        source: SOURCE_ID,
        maxzoom: 15,
        paint: {
          "heatmap-weight": 1,
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(0, 0, 255, 0)",
            0.2,
            "royalblue",
            0.4,
            "cyan",
            0.6,
            "lime",
            0.8,
            "yellow",
            1,
            "red",
          ],
          "heatmap-radius": 15,
          "heatmap-opacity": 0.8,
        },
      });
    });

    return () => {
      instance.remove();
      map.current = null;
    };
  }, []);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-100 p-6 text-center text-sm text-slate-500">
        Set NEXT_PUBLIC_MAPBOX_TOKEN in frontend/.env.local to show the map.
      </div>
    );
  }
  return <div ref={container} className="h-full w-full" />;
}
