"use client";

import dynamic from "next/dynamic";

const MapaItalia = dynamic(() => import("./MapaItalia"), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full bg-gray-50 rounded-lg border border-gray-200 animate-pulse" />,
});

export default MapaItalia;
