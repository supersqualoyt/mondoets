"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";

type Ets = { id: number; slug: string; denominazione: string; sezione: string };
type Centroidi = Record<string, [number, number]>;

// Hash semplice deterministico → [-1, 1]
function rng(s: string, seed: number): number {
  let h = seed;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h |= 0;
  }
  return ((h % 1000) / 1000) * 2 - 1;
}

const SEZ_COLORS: Record<string, string> = {
  ODV: "#16a34a",
  APS: "#1e6fd9",
  IS: "#9333ea",
  FIL: "#ea580c",
  RA: "#dc2626",
  SMS: "#0891b2",
  ALTRI: "#6b7280",
};

export default function MapaComuneEnti({
  comune, sigla, ets,
}: {
  comune: string;
  sigla: string;
  ets: Ets[];
}) {
  const [cent, setCent] = useState<[number, number] | null>(null);

  useEffect(() => {
    fetch("/data/comuni-centroidi.json")
      .then((r) => r.json())
      .then((d: Centroidi) => {
        const key = `${comune.toUpperCase()}|${sigla.toUpperCase()}`;
        if (d[key]) setCent(d[key]);
      })
      .catch(() => {});
  }, [comune, sigla]);

  // Jitter ~500-1000m attorno centroide per disperdere visivamente i marker
  const points = useMemo(() => {
    if (!cent) return [];
    const [lat, lng] = cent;
    return ets.map((e) => ({
      ...e,
      lat: lat + rng(e.slug, 1) * 0.012,
      lng: lng + rng(e.slug, 7) * 0.018,
    }));
  }, [cent, ets]);

  if (!cent) {
    return (
      <div className="h-[500px] w-full bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center text-sm text-gray-500">
        Caricamento mappa…
      </div>
    );
  }

  return (
    <div className="h-[500px] w-full rounded-lg overflow-hidden border border-gray-200">
      <MapContainer center={cent} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map((p) => {
          const color = SEZ_COLORS[p.sezione] ?? "#6b7280";
          return (
            <CircleMarker
              key={p.id}
              center={[p.lat, p.lng]}
              radius={5}
              pathOptions={{ color, weight: 1, fillColor: color, fillOpacity: 0.7 }}
            >
              <Popup>
                <Link href={`/ets/${p.slug}`} className="font-semibold text-brand-700">
                  {p.denominazione}
                </Link>
                <br />
                <span className="text-xs text-gray-500">{p.sezione}</span>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
