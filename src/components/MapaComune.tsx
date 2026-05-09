"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix icone leaflet con Next.js
const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function MapaComune({ comune, provincia, denominazione }: { comune: string; provincia: string; denominazione: string }) {
  const [pos, setPos] = useState<[number, number] | null>(null);

  useEffect(() => {
    const q = encodeURIComponent(`${comune}, ${provincia}, Italia`);
    fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&countrycodes=it`, {
      headers: { Accept: "application/json" },
    })
      .then((r) => r.json())
      .then((data: Array<{ lat: string; lon: string }>) => {
        if (data[0]) setPos([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      })
      .catch(() => setPos(null));
  }, [comune, provincia]);

  if (!pos) {
    return (
      <div className="h-64 w-full bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center text-sm text-gray-500">
        Caricamento mappa…
      </div>
    );
  }

  return (
    <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-200">
      <MapContainer center={pos} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={pos} icon={icon}>
          <Popup>
            <strong>{denominazione}</strong>
            <br />
            {comune} ({provincia})
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
