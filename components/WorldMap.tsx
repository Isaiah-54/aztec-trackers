"use client";

import { useEffect, useRef } from "react";
import maplibregl, { Map as MLMap } from "maplibre-gl";

type NodePin = { id: string; lat: number; lng: number; label?: string };

const rasterStyle = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors"
    }
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }]
} as const;

export default function WorldMap({ nodes }: { nodes: NodePin[] }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MLMap | null>(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: ref.current,
      style: rasterStyle as any,
      center: [0, 20], // [lng, lat]
      zoom: 2
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");
    mapRef.current = map;

    // add markers
    nodes.forEach((n) => {
      const el = document.createElement("div");
      el.style.width = "12px";
      el.style.height = "12px";
      el.style.borderRadius = "999px";
      el.style.background = "#2563eb";
      el.style.boxShadow = "0 0 0 2px rgba(37,99,235,.3)";
      new maplibregl.Marker({ element: el })
        .setLngLat([n.lng, n.lat])
        .setPopup(new maplibregl.Popup({ closeButton: false }).setText(n.label || n.id))
        .addTo(map);
    });

    return () => map.remove();
  }, [nodes]);

  return <div ref={ref} style={{ width: "100%", height: "500px", borderRadius: 12, overflow: "hidden", border: "1px solid #e5e7eb" }} />;
}
