import Link from "next/link";
import { SEZIONI_LIST } from "@/lib/sezioni";
import { prisma } from "@/lib/db";
import { formatNumber } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata = buildMetadata({
  title: "Sezioni del RUNTS",
  description: "Le sette sezioni del Registro Unico Nazionale del Terzo Settore: ODV, APS, Enti Filantropici, Imprese Sociali, Reti Associative, Società di Mutuo Soccorso, Altri ETS.",
  path: "/sezione",
});

export default async function SezioniIndexPage() {
  let counts: Array<{ sezione: string; n: number }> = [];
  try {
    const rows = await prisma.$queryRaw<Array<{ sezione: string; n: bigint }>>`
      SELECT sezione, COUNT(*) AS n FROM ets GROUP BY sezione
    `;
    counts = rows.map((r) => ({ sezione: r.sezione, n: Number(r.n) }));
  } catch {
    // DB non pronto
  }
  const map = new Map(counts.map((c) => [c.sezione, c.n]));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Le sezioni del RUNTS</h1>
      <p className="text-gray-600 mb-8 max-w-3xl">
        Il Registro Unico Nazionale del Terzo Settore è suddiviso in sette sezioni. Ogni ente del terzo settore (ETS) è
        iscritto in una sola sezione, in base alla propria forma giuridica e alla natura dell&apos;attività svolta.
      </p>
      <div className="grid md:grid-cols-2 gap-4">
        {SEZIONI_LIST.map((s) => (
          <Link
            key={s.code}
            href={`/sezione/${s.slug}`}
            className="block p-5 border border-gray-200 rounded-lg hover:border-brand-500 hover:shadow-sm no-underline"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-gray-900">{s.plural}</h2>
              {map.has(s.code) && (
                <span className="text-sm text-gray-500">{formatNumber(map.get(s.code)!)} enti</span>
              )}
            </div>
            <p className="text-sm text-gray-600">{s.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
