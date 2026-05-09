import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatNumber } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";
import { sezioneFromCode } from "@/lib/sezioni";
import { regioneFromSlug, provinceForRegione, REGIONI_LIST } from "@/lib/geo";

export const revalidate = 3600;

export async function generateStaticParams() {
  return REGIONI_LIST.map((r) => ({ regione: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ regione: string }> }) {
  const { regione } = await params;
  const r = regioneFromSlug(regione);
  if (!r) return buildMetadata({ title: "Regione non trovata", path: `/regione/${regione}`, noindex: true });
  return buildMetadata({
    title: `ETS in ${r.nome}`,
    description: `Enti del terzo settore con sede legale in ${r.nome}, iscritti al RUNTS. Cerca per provincia, sezione o codice fiscale.`,
    path: `/regione/${regione}`,
  });
}

const PAGE_SIZE = 30;

export default async function RegionePage({
  params, searchParams,
}: {
  params: Promise<{ regione: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { regione } = await params;
  const sp = await searchParams;
  const r = regioneFromSlug(regione);
  if (!r) notFound();

  const page = Math.max(1, parseInt(sp.page ?? "1", 10));
  const province = provinceForRegione(r.nome);

  let total = 0;
  let items: Array<{ id: number; slug: string; denominazione: string; sezione: string; comune: string | null; provincia: string | null }> = [];
  let provCounts = new Map<string, number>();

  try {
    const provRows = await prisma.$queryRaw<Array<{ provincia: string | null; n: bigint }>>`
      SELECT provincia, COUNT(*) AS n FROM ets WHERE regione = ${r.nome} AND provincia IS NOT NULL GROUP BY provincia
    `;
    provCounts = new Map(provRows.map((row) => [row.provincia ?? "", Number(row.n)]));

    [total, items] = await Promise.all([
      prisma.ets.count({ where: { regione: r.nome } }),
      prisma.ets.findMany({
        where: { regione: r.nome },
        select: { id: true, slug: true, denominazione: true, sezione: true, comune: true, provincia: true },
        orderBy: { denominazione: "asc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
    ]);
  } catch {
    // DB non pronto
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-3">
        <Link href="/" className="no-underline hover:underline">Home</Link>
        {" / "}
        <Link href="/regione" className="no-underline hover:underline">Regioni</Link>
        {" / "}
        <span>{r.nome}</span>
      </nav>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">ETS in {r.nome}</h1>
      {total > 0 && (
        <p className="text-sm text-gray-500 mb-6">
          {formatNumber(total)} enti iscritti al RUNTS
        </p>
      )}

      {province.length > 0 && (
        <section className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-3">Esplora per provincia</h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {province.map((p) => {
              const n = provCounts.get(p.sigla) ?? 0;
              return (
                <li key={p.sigla}>
                  <Link href={`/provincia/${p.sigla.toLowerCase()}`} className="text-sm text-brand-700 hover:underline no-underline">
                    {p.nome} <span className="text-gray-500">({formatNumber(n)})</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <h2 className="text-xl font-bold text-gray-900 mb-4">Tutti gli ETS in {r.nome}</h2>
      {items.length === 0 ? (
        <p className="text-gray-500">Nessun ente caricato per questa regione.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {items.map((e) => {
            const sez = sezioneFromCode(e.sezione);
            return (
              <li key={e.id} className="py-3">
                <Link href={`/ets/${e.slug}`} className="block no-underline group">
                  <h3 className="font-semibold text-brand-700 group-hover:underline">{e.denominazione}</h3>
                  <p className="text-sm text-gray-600">
                    {sez?.label ?? e.sezione}
                    {e.comune && ` · ${e.comune}`}
                    {e.provincia && ` (${e.provincia})`}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {totalPages > 1 && (
        <nav className="flex justify-center gap-2 mt-8 text-sm">
          {page > 1 && (
            <Link href={`/regione/${regione}?page=${page - 1}`} className="px-3 py-1 border rounded no-underline">
              ← Precedente
            </Link>
          )}
          <span className="px-3 py-1 text-gray-600">Pagina {page} di {totalPages}</span>
          {page < totalPages && (
            <Link href={`/regione/${regione}?page=${page + 1}`} className="px-3 py-1 border rounded no-underline">
              Successiva →
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
