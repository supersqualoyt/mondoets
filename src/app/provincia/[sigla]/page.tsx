import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatNumber, slugify } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";
import { sezioneFromCode } from "@/lib/sezioni";
import { provinciaFromSigla, PROVINCE_LIST } from "@/lib/geo";
import MapaProvincia from "@/components/MapaProvinciaLoader";

export const revalidate = 3600;

export async function generateStaticParams() {
  return PROVINCE_LIST.map((p) => ({ sigla: p.sigla.toLowerCase() }));
}

export async function generateMetadata({ params }: { params: Promise<{ sigla: string }> }) {
  const { sigla } = await params;
  const p = provinciaFromSigla(sigla);
  if (!p) return buildMetadata({ title: "Provincia non trovata", path: `/provincia/${sigla}`, noindex: true });
  return buildMetadata({
    title: `ETS in provincia di ${p.nome} (${p.sigla})`,
    description: `Tutti gli enti del terzo settore con sede legale in provincia di ${p.nome}, regione ${p.regione}, iscritti al RUNTS.`,
    path: `/provincia/${sigla}`,
  });
}

const PAGE_SIZE = 30;

export default async function ProvinciaPage({
  params, searchParams,
}: {
  params: Promise<{ sigla: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { sigla } = await params;
  const sp = await searchParams;
  const p = provinciaFromSigla(sigla);
  if (!p) notFound();

  const page = Math.max(1, parseInt(sp.page ?? "1", 10));

  let total = 0;
  let items: Array<{ id: number; slug: string; denominazione: string; sezione: string; comune: string | null }> = [];
  let topComuni: Array<{ comune: string; n: number }> = [];
  let allComuni: Array<{ comune: string; n: number }> = [];

  try {
    const comuneRows = await prisma.$queryRaw<Array<{ comune: string | null; n: bigint }>>`
      SELECT comune, COUNT(*) AS n FROM ets WHERE provincia = ${p.sigla} AND comune IS NOT NULL GROUP BY comune ORDER BY n DESC
    `;
    allComuni = comuneRows
      .filter((r) => r.comune)
      .map((r) => ({ comune: r.comune as string, n: Number(r.n) }));
    topComuni = allComuni.slice(0, 20);

    [total, items] = await Promise.all([
      prisma.ets.count({ where: { provincia: p.sigla } }),
      prisma.ets.findMany({
        where: { provincia: p.sigla },
        select: { id: true, slug: true, denominazione: true, sezione: true, comune: true },
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
        <Link href={`/regione/${p.regioneSlug}`} className="no-underline hover:underline">{p.regione}</Link>
        {" / "}
        <span>{p.nome}</span>
      </nav>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">ETS in provincia di {p.nome}</h1>
      <p className="text-sm text-gray-500 mb-6">
        Sigla: <strong>{p.sigla}</strong> · Regione: <Link href={`/regione/${p.regioneSlug}`} className="no-underline hover:underline">{p.regione}</Link>
        {total > 0 && <> · {formatNumber(total)} enti</>}
      </p>

      {allComuni.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Mappa dei comuni</h2>
          <MapaProvincia sigla={p.sigla} comuni={allComuni} />
        </section>
      )}

      {topComuni.length > 0 && (
        <section className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-3">Comuni con più ETS</h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm">
            {topComuni.map((c) => (
              <li key={c.comune}>
                <Link
                  href={`/provincia/${p.sigla.toLowerCase()}/${slugify(c.comune)}`}
                  className="text-brand-700 hover:underline no-underline"
                >
                  {c.comune} <span className="text-gray-500">({formatNumber(c.n)})</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <h2 className="text-xl font-bold text-gray-900 mb-4">Elenco enti</h2>
      {items.length === 0 ? (
        <p className="text-gray-500">Nessun ente caricato.</p>
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
            <Link href={`/provincia/${sigla}?page=${page - 1}`} className="px-3 py-1 border rounded no-underline">
              ← Precedente
            </Link>
          )}
          <span className="px-3 py-1 text-gray-600">Pagina {page} di {totalPages}</span>
          {page < totalPages && (
            <Link href={`/provincia/${sigla}?page=${page + 1}`} className="px-3 py-1 border rounded no-underline">
              Successiva →
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
