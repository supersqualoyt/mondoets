import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatNumber, slugify } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";
import { sezioneFromCode } from "@/lib/sezioni";
import { provinciaFromSigla } from "@/lib/geo";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ sigla: string; comune: string }> }) {
  const { sigla, comune } = await params;
  const p = provinciaFromSigla(sigla);
  if (!p) return buildMetadata({ title: "Provincia non trovata", path: `/provincia/${sigla}/${comune}`, noindex: true });
  const nomeComune = await findComuneNome(p.sigla, comune);
  if (!nomeComune) return buildMetadata({ title: "Comune non trovato", path: `/provincia/${sigla}/${comune}`, noindex: true });
  return buildMetadata({
    title: `ETS a ${nomeComune} (${p.sigla})`,
    description: `Enti del terzo settore con sede legale a ${nomeComune}, provincia di ${p.nome}, iscritti al RUNTS.`,
    path: `/provincia/${sigla}/${comune}`,
  });
}

async function findComuneNome(provinciaSigla: string, comuneSlug: string): Promise<string | null> {
  try {
    const rows = await prisma.$queryRaw<Array<{ comune: string }>>`
      SELECT DISTINCT comune FROM ets WHERE provincia = ${provinciaSigla} AND comune IS NOT NULL
    `;
    for (const r of rows) {
      if (slugify(r.comune) === comuneSlug) return r.comune;
    }
  } catch {
    // DB non pronto
  }
  return null;
}

const PAGE_SIZE = 30;

export default async function ComunePage({
  params, searchParams,
}: {
  params: Promise<{ sigla: string; comune: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { sigla, comune } = await params;
  const sp = await searchParams;
  const p = provinciaFromSigla(sigla);
  if (!p) notFound();
  const nomeComune = await findComuneNome(p.sigla, comune);
  if (!nomeComune) notFound();

  const page = Math.max(1, parseInt(sp.page ?? "1", 10));

  let total = 0;
  let items: Array<{ id: number; slug: string; denominazione: string; sezione: string }> = [];

  try {
    [total, items] = await Promise.all([
      prisma.ets.count({ where: { provincia: p.sigla, comune: nomeComune } }),
      prisma.ets.findMany({
        where: { provincia: p.sigla, comune: nomeComune },
        select: { id: true, slug: true, denominazione: true, sezione: true },
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
        <Link href={`/regione/${p.regioneSlug}`} className="no-underline hover:underline">{p.regione}</Link>
        {" / "}
        <Link href={`/provincia/${p.sigla.toLowerCase()}`} className="no-underline hover:underline">{p.nome}</Link>
        {" / "}
        <span>{nomeComune}</span>
      </nav>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">ETS a {nomeComune}</h1>
      <p className="text-sm text-gray-500 mb-6">
        Provincia di {p.nome} · {formatNumber(total)} enti
      </p>

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
                  <p className="text-sm text-gray-600">{sez?.label ?? e.sezione}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {totalPages > 1 && (
        <nav className="flex justify-center gap-2 mt-8 text-sm">
          {page > 1 && (
            <Link href={`/provincia/${sigla}/${comune}?page=${page - 1}`} className="px-3 py-1 border rounded no-underline">
              ← Precedente
            </Link>
          )}
          <span className="px-3 py-1 text-gray-600">Pagina {page} di {totalPages}</span>
          {page < totalPages && (
            <Link href={`/provincia/${sigla}/${comune}?page=${page + 1}`} className="px-3 py-1 border rounded no-underline">
              Successiva →
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
