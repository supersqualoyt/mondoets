import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { sezioneFromSlug, SEZIONI_LIST } from "@/lib/sezioni";
import { formatNumber } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 3600;

export async function generateStaticParams() {
  return SEZIONI_LIST.map((s) => ({ sezione: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ sezione: string }> }) {
  const { sezione } = await params;
  const sez = sezioneFromSlug(sezione);
  if (!sez) return buildMetadata({ title: "Sezione non trovata", path: `/sezione/${sezione}`, noindex: true });
  return buildMetadata({
    title: `${sez.plural} iscritte al RUNTS`,
    description: sez.description,
    path: `/sezione/${sezione}`,
  });
}

const PAGE_SIZE = 30;

export default async function SezionePage({
  params, searchParams,
}: {
  params: Promise<{ sezione: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { sezione } = await params;
  const sp = await searchParams;
  const sez = sezioneFromSlug(sezione);
  if (!sez) notFound();

  const page = Math.max(1, parseInt(sp.page ?? "1", 10));

  // Le Reti Associative non hanno una sezione dedicata nel dump iscritti del RUNTS:
  // sono enti (APS, ODV, ecc.) con qualifica di "rete associativa" → flag `Rete = Sì`.
  const where = sez.code === "RA" ? { flagRete: true } : { sezione: sez.code };

  let total = 0;
  let items: Array<{ id: number; slug: string; denominazione: string; comune: string | null; provincia: string | null; sezione: string }> = [];
  try {
    [total, items] = await Promise.all([
      prisma.ets.count({ where }),
      prisma.ets.findMany({
        where,
        select: { id: true, slug: true, denominazione: true, comune: true, provincia: true, sezione: true },
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
        <Link href="/sezione" className="no-underline hover:underline">Sezioni RUNTS</Link>
        {" / "}
        <span>{sez.plural}</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">{sez.plural}</h1>
      <p className="text-gray-700 max-w-3xl mb-6">{sez.description}</p>
      {sez.code === "RA" && (
        <p className="text-sm text-gray-600 max-w-3xl mb-6 italic">
          Le reti associative non costituiscono una sezione dedicata del RUNTS: sono enti (associazioni, fondazioni o
          imprese sociali) che hanno ottenuto la qualifica di rete associativa ai sensi dell&apos;art. 41 del Codice del
          Terzo Settore. Qui trovi gli enti italiani con questa qualifica, indipendentemente dalla sezione di iscrizione.
        </p>
      )}
      {total > 0 && (
        <p className="text-sm text-gray-500 mb-6">
          {formatNumber(total)} enti iscritti — pagina {page} di {totalPages}
        </p>
      )}

      {items.length === 0 ? (
        <p className="text-gray-500">Nessun ente caricato per questa sezione.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {items.map((e) => (
            <li key={e.id} className="py-3">
              <Link href={`/ets/${e.slug}`} className="block no-underline group">
                <h2 className="font-semibold text-brand-700 group-hover:underline">{e.denominazione}</h2>
                <p className="text-sm text-gray-600">
                  {sez.code === "RA" && e.sezione !== "RA" && (
                    <span className="mr-2 text-xs px-1.5 py-0.5 bg-gray-100 rounded">{e.sezione}</span>
                  )}
                  {e.comune}{e.provincia && ` (${e.provincia})`}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <nav className="flex justify-center gap-2 mt-8 text-sm">
          {page > 1 && (
            <Link href={`/sezione/${sez.slug}?page=${page - 1}`} className="px-3 py-1 border rounded no-underline">
              ← Precedente
            </Link>
          )}
          <span className="px-3 py-1 text-gray-600">Pagina {page} di {totalPages}</span>
          {page < totalPages && (
            <Link href={`/sezione/${sez.slug}?page=${page + 1}`} className="px-3 py-1 border rounded no-underline">
              Successiva →
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
