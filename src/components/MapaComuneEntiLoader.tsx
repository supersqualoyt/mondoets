"use client";

import dynamic from "next/dynamic";

const MapaComuneEnti = dynamic(() => import("./MapaComuneEnti"), {
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-gray-50 rounded-lg border border-gray-200 animate-pulse" />,
});

export default MapaComuneEnti;
