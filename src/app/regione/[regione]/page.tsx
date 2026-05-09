import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatNumber, slugify } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";
import { sezioneFromCode } from "@/lib/sezioni";

export const revalidate = 3600;

const PAGE_SIZE = 30;

async function findRegioneNomeFromSlug(slug: string): Promise<string | null> {
  try {
    const regs = await prisma.$queryRaw<Array<{ regione: string | null }>>`
      SELECT DISTINCT regione FROM ets WHERE regione IS NOT NULL
    `;
    for (const r of regs) {
      if (r.regione && slugify(r.regione) === slug) return r.regione;
    }
  } catch {
    // DB non pronto
  }
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ regione: string }> }) {
  const { regione } = await params;
  const nome = await findRegioneNomeFromSlug(regione);
  if (!nome) return buildMetadata({ title: "Regione non trovata", path: `/regione/${regione}`, noindex: true });
  return buildMetadata({
    title: `ETS in ${nome}`,
    description: `Enti del terzo settore con sede legale in ${nome}, iscritti al RUNTS.`,
    path: `/regione/${regione}`,
  });
}

export default async function RegionePage({
  params, searchParams,
}: {
  params: Promise<{ regione: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { regione } = await params;
  const sp = await searchParams;
  const nome = await findRegioneNomeFromSlug(regione);
  if (!nome) notFound();

  const page = Math.max(1, parseInt(sp.page ?? "1", 10));

  let total = 0;
  let items: Array<{ id: number; slug: string; denominazione: string; sezione: string; comune: string | null; provincia: string | null }> = [];

  try {
    [total, items] = await Promise.all([
      prisma.ets.count({ where: { regione: nome } }),
      prisma.ets.findMany({
        where: { regione: nome },
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
        <span>{nome}</span>
      </nav>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">ETS in {nome}</h1>
      {total > 0 && (
        <p className="text-sm text-gray-500 mb-6">
          {formatNumber(total)} enti iscritti al RUNTS — pagina {page} di {totalPages}
        </p>
      )}

      {items.length === 0 ? (
        <p className="text-gray-500">Nessun ente caricato per questa regione.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {items.map((e) => {
            const sez = sezioneFromCode(e.sezione);
            return (
              <li key={e.id} className="py-3">
                <Link href={`/ets/${e.slug}`} className="block no-underline group">
                  <h2 className="font-semibold text-brand-700 group-hover:underline">{e.denominazione}</h2>
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
