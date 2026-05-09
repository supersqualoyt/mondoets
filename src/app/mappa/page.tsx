import { prisma } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { REGIONI_LIST } from "@/lib/geo";
import { formatNumber } from "@/lib/format";
import Link from "next/link";
import MapaItalia from "@/components/MapaItaliaLoader";

export const revalidate = 3600;

export const metadata = buildMetadata({
  title: "Mappa degli ETS in Italia",
  description: "Mappa interattiva degli enti del terzo settore italiani: clicca una regione per esplorare gli ETS iscritti al RUNTS.",
  path: "/mappa",
});

export default async function MappaPage() {
  let counts: Record<string, number> = {};
  let totale = 0;
  try {
    const rows = await prisma.$queryRaw<Array<{ regione: string | null; n: bigint }>>`
      SELECT regione, COUNT(*) AS n FROM ets WHERE regione IS NOT NULL GROUP BY regione
    `;
    for (const r of rows) {
      if (r.regione) counts[r.regione] = Number(r.n);
    }
    totale = Object.values(counts).reduce((a, b) => a + b, 0);
  } catch {
    // DB non pronto
  }

  const sorted = REGIONI_LIST
    .map((r) => ({ ...r, n: counts[r.nome] ?? 0 }))
    .sort((a, b) => b.n - a.n);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Mappa degli ETS in Italia</h1>
      <p className="text-gray-600 mb-6 max-w-3xl">
        {totale > 0 ? formatNumber(totale) : "Tutti gli"} enti del terzo settore distribuiti per regione. Clicca una regione per esplorarne gli ETS iscritti.
      </p>

      <MapaItalia counts={counts} />

      <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">Classifica regioni</h2>
      <ol className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm">
        {sorted.map((r, i) => (
          <li key={r.slug} className="flex items-baseline gap-2">
            <span className="text-gray-400 w-6">{i + 1}.</span>
            <Link href={`/regione/${r.slug}`} className="flex-1 no-underline hover:underline text-brand-700">
              {r.nome}
            </Link>
            <span className="text-gray-500">{formatNumber(r.n)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
