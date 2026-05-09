import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatNumber } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";
import { slugify } from "@/lib/format";

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
      SELECT regione, COUNT(*) AS n FROM ets WHERE regione IS NOT NULL GROUP BY regione ORDER BY regione ASC
    `;
    counts = rows.map((r) => ({ regione: r.regione, n: Number(r.n) }));
  } catch {
    // DB non pronto
  }
  const filtered = counts.filter((c) => c.regione);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">ETS per regione</h1>
      {filtered.length === 0 ? (
        <p className="text-gray-500">Nessun dato regionale ancora caricato.</p>
      ) : (
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {filtered.map((c) => (
            <li key={c.regione}>
              <Link
                href={`/regione/${slugify(c.regione!)}`}
                className="block p-3 border border-gray-200 rounded hover:border-brand-500 no-underline"
              >
                <span className="font-semibold text-gray-900">{c.regione}</span>
                <span className="text-sm text-gray-500"> · {formatNumber(c.n)} enti</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
