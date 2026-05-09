"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, Tooltip } from "react-leaflet";
import type { Feature } from "geojson";
import "leaflet/dist/leaflet.css";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/format";

type Counts = Record<string, number>;

function normalizeReg(name: string): string {
  // Geojson openpolis usa nomi bilingui ("Valle d'Aosta/Vallée d'Aoste"). Prendiamo la parte italiana.
  return name.split("/")[0].trim();
}

export default function MapaItalia({ counts }: { counts: Counts }) {
  const [geo, setGeo] = useState<GeoJSON.FeatureCollection | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/data/regioni.geojson")
      .then((r) => r.json())
      .then(setGeo)
      .catch(() => setGeo(null));
  }, []);

  const max = Math.max(...Object.values(counts), 1);

  function colorFor(n: number) {
    if (n === 0) return "#f3f4f6";
    const t = n / max;
    if (t > 0.66) return "#0c2c5c";
    if (t > 0.33) return "#1858b3";
    if (t > 0.10) return "#1e6fd9";
    return "#d9ecff";
  }

  function styleFor(feature?: Feature) {
    const nome = normalizeReg((feature?.properties?.reg_name as string | undefined) ?? "");
    const n = counts[nome] ?? 0;
    return {
      fillColor: colorFor(n),
      weight: 1,
      color: "#fff",
      fillOpacity: 0.85,
    };
  }

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={[42.5, 12.5]}
        zoom={6}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {geo && (
          <GeoJSON
            data={geo}
            style={styleFor}
            onEachFeature={(feature, layer) => {
              const raw = feature.properties?.reg_name as string | undefined;
              if (!raw) return;
              const nome = normalizeReg(raw);
              const n = counts[nome] ?? 0;
              layer.bindTooltip(`<strong>${nome}</strong><br/>${n.toLocaleString("it-IT")} ETS`, { sticky: true });
              layer.on({
                click: () => router.push(`/regione/${slugify(nome)}`),
                mouseover: (e) => e.target.setStyle({ weight: 2, color: "#1858b3" }),
                mouseout: (e) => e.target.setStyle({ weight: 1, color: "#fff" }),
              });
            }}
          />
        )}
        {!geo && (
          <Tooltip permanent>
            <span className="text-xs text-gray-500">Caricamento dati geografici…</span>
          </Tooltip>
        )}
      </MapContainer>
    </div>
  );
}
