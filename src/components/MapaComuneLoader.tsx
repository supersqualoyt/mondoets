"use client";

import dynamic from "next/dynamic";

const MapaComune = dynamic(() => import("./MapaComune"), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-50 rounded-lg border border-gray-200 animate-pulse" />,
});

export default MapaComune;
