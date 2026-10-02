'use client'; // Required in Next.js App Router for client-side libraries like Mapbox

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css'; // Don't forget the CSS!

// Set your Mapbox token here or in a .env.local file
mapboxgl.accessToken = 'pk.pk.eyJ1IjoiYWJ3aWxzb24iLCJhIjoiY211cmQxZ2s5MDZwMDJ5cHA2aHhzb3MyZiJ9.78DQot4YRvW7deGp7Nol6g';

export default function Heatmap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    // Prevent the map from initializing multiple times
    if (map.current) return; 

    // 1. Initialize the map centered on the US
    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: 'mapbox://styles/mapbox/dark-v11', // Dark mode makes heatmaps pop
      center: [-98.5795, 39.8283],
      zoom: 3.5
    });

    map.current.on('load', async () => {
      try {
        // 2. Fetch the seeded data from your local backend
        // Replace this URL with your actual localtunnel URL
        const response = await fetch("https://icy-sites-carry.loca.lt/api/heatmap", {
          headers: { "Bypass-Tunnel-Reminder": "true" }
        });
        const result = await response.json();

        // 3. Convert backend JSON into Mapbox GeoJSON
        const geojsonData = {
          type: 'FeatureCollection',
          features: result.data.map((user: any) => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [user.lng, user.lat] // Must be [lng, lat]
            },
            properties: { weight: 1 }
          }))
        };

        // 4. Mount the data and style the heatmap
        map.current!.addSource('seekers', {
          type: 'geojson',
          data: geojsonData
        });

        map.current!.addLayer({
          id: 'seekers-heat',
          type: 'heatmap',
          source: 'seekers',
          maxzoom: 15,
          paint: {
            'heatmap-weight': 1,
            'heatmap-color': [
              'interpolate', ['linear'], ['heatmap-density'],
              0, 'rgba(0, 0, 255, 0)',
              0.2, 'royalblue',
              0.4, 'cyan',
              0.6, 'lime',
              0.8, 'yellow',
              1, 'red'
            ],
            'heatmap-radius': 15,
            'heatmap-opacity': 0.8
          }
        });
      } catch (error) {
        console.error("Failed to load heatmap data:", error);
      }
    });
  }, []);

  // The div where Mapbox will inject the canvas
  return <div ref={mapContainer} style={{ width: '100%', height: '100vh' }} />;
}