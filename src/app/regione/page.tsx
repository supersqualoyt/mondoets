import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatNumber } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";
import { REGIONI_LIST } from "@/lib/geo";

export const revalidate = 3600;

export const metadata = buildMetadata({
  title: "ETS per regione",
  description: "Esplora gli enti del terzo settore italiani regione per regione.",
  path: "/regione",
});

export default async function RegioniIndexPage() {
  let counts: Array<{ regione: string | null; n: number }> = [];
  try {
    const rows = await prisma.$queryRaw<Array<{ regione: string | null; n: bigint }>>`
      SELECT regione, COUNT(*) AS n FROM ets WHERE regione IS NOT NULL GROUP BY regione
    `;
    counts = rows.map((r) => ({ regione: r.regione, n: Number(r.n) }));
  } catch {
    // DB non pronto
  }
  const map = new Map(counts.map((c) => [c.regione ?? "", c.n]));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">ETS per regione</h1>
      <p className="text-gray-600 mb-8 max-w-3xl">
        Esplora gli enti del terzo settore con sede legale in Italia, raggruppati per regione e provincia.
      </p>
      <ul className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {REGIONI_LIST.map((r) => {
          const n = map.get(r.nome) ?? 0;
          return (
            <li key={r.slug}>
              <Link
                href={`/regione/${r.slug}`}
                className="block p-3 border border-gray-200 rounded hover:border-brand-500 no-underline"
              >
                <span className="font-semibold text-gray-900">{r.nome}</span>
                <span className="text-sm text-gray-500"> · {formatNumber(n)} enti</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
