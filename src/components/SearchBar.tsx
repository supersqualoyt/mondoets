"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValue);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    router.push(`/cerca${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2 w-full max-w-2xl">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cerca un ente del terzo settore (nome, codice fiscale, città)…"
        className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
      <button
        type="submit"
        className="px-6 py-3 bg-brand-600 text-white font-semibold rounded-md hover:bg-brand-700"
      >
        Cerca
      </button>
    </form>
  );
}
