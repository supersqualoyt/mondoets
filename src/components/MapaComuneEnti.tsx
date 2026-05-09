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

  const [filtro, setFiltro] = useState("");
  const [sezFilter, setSezFilter] = useState<string>("");

  const visible = useMemo(() => {
    const q = filtro.trim().toLowerCase();
    return points.filter((p) => {
      if (sezFilter && p.sezione !== sezFilter) return false;
      if (q && !p.denominazione.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [points, filtro, sezFilter]);

  if (!cent) {
    return (
      <div className="h-[500px] w-full bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center text-sm text-gray-500">
        Caricamento mappa…
      </div>
    );
  }

  const sezioniDisponibili = Array.from(new Set(points.map((p) => p.sezione))).sort();

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3 items-center">
        <input
          type="search"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder="Cerca per nome ETS sulla mappa…"
          className="flex-1 min-w-[220px] px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <select
          value={sezFilter}
          onChange={(e) => setSezFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
        >
          <option value="">Tutte le sezioni</option>
          {sezioniDisponibili.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <span className="text-sm text-gray-600 whitespace-nowrap">
          {visible.length} di {points.length}
        </span>
      </div>

      <div className="h-[500px] w-full rounded-lg overflow-hidden border border-gray-200">
        <MapContainer center={cent} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {visible.map((p) => {
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
    </div>
  );
}
