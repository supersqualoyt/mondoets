"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/format";

type ComuneStat = { comune: string; n: number };
type Centroidi = Record<string, [number, number]>;

export default function MapaProvincia({ sigla, comuni }: { sigla: string; comuni: ComuneStat[] }) {
  const [cent, setCent] = useState<Centroidi | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/data/comuni-centroidi.json")
      .then((r) => r.json())
      .then((d) => setCent(d as Centroidi))
      .catch((err) => console.error("centroidi:", err));
  }, []);

  const points = (cent ? comuni : [])
    .map((c) => {
      const key = `${c.comune.toUpperCase()}|${sigla.toUpperCase()}`;
      const ll = cent![key];
      return ll ? { ...c, lat: ll[0], lng: ll[1] } : null;
    })
    .filter((p): p is ComuneStat & { lat: number; lng: number } => p !== null);

  const center: [number, number] = points.length > 0
    ? [
        points.reduce((s, p) => s + p.lat, 0) / points.length,
        points.reduce((s, p) => s + p.lng, 0) / points.length,
      ]
    : [42.5, 12.5];

  const max = Math.max(...comuni.map((c) => c.n), 1);

  return (
    <div className="relative h-[500px] w-full rounded-lg overflow-hidden border border-gray-200">
      {!cent && (
        <div className="absolute inset-0 z-[400] flex items-center justify-center bg-white/60 text-sm text-gray-500 pointer-events-none">
          Caricamento mappa…
        </div>
      )}
      <MapContainer center={center} zoom={9} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map((p) => {
          const radius = 6 + Math.sqrt(p.n / max) * 22;
          return (
            <CircleMarker
              key={p.comune}
              center={[p.lat, p.lng]}
              radius={radius}
              pathOptions={{ color: "#1858b3", weight: 1, fillColor: "#1e6fd9", fillOpacity: 0.55 }}
              eventHandlers={{
                click: () => router.push(`/provincia/${sigla.toLowerCase()}/${slugify(p.comune)}`),
              }}
            >
              <Tooltip>
                <strong>{p.comune}</strong>
                <br />
                {p.n.toLocaleString("it-IT")} ETS
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
