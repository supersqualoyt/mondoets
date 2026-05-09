import Link from "next/link";
import { prisma } from "@/lib/db";
import SearchBar from "@/components/SearchBar";
import { SEZIONI_LIST, sezioneFromCode } from "@/lib/sezioni";
import { formatNumber } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Cerca ETS",
  description: "Ricerca avanzata tra tutti gli enti del terzo settore iscritti al RUNTS.",
  path: "/cerca",
});

const PAGE_SIZE = 20;

type Search = { q?: string; sezione?: string; regione?: string; page?: string };

export default async function CercaPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const sezione = sp.sezione ?? "";
  const regione = sp.regione ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));

  const where: Record<string, unknown> = {};
  if (q) where.denominazione = { contains: q };
  if (sezione) where.sezione = sezione;
  if (regione) where.regione = regione;

  let results: Array<{
    id: number; slug: string; denominazione: string; sezione: string;
    comune: string | null; provincia: string | null; regione: string | null;
  }> = [];
  let total = 0;

  try {
    [results, total] = await Promise.all([
      prisma.ets.findMany({
        where,
        select: {
          id: true, slug: true, denominazione: true, sezione: true,
          comune: true, provincia: true, regione: true,
        },
        orderBy: { denominazione: "asc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.ets.count({ where }),
    ]);
  } catch {
    // DB non ancora pronto — pagina si renderizza vuota
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Cerca un ETS</h1>
      <p className="text-gray-600 mb-6">
        {total > 0 ? `${formatNumber(total)} risultati` : "Nessun risultato per questi filtri."}
      </p>

      <div className="mb-6">
        <SearchBar defaultValue={q} />
      </div>

      <div className="grid md:grid-cols-[220px_1fr] gap-8">
        <aside>
          <h2 className="font-semibold text-gray-900 mb-3">Sezione</h2>
          <ul className="space-y-1 text-sm">
            <li>
              <FilterLink params={sp} update={{ sezione: "", page: "1" }} active={!sezione}>
                Tutte
              </FilterLink>
            </li>
            {SEZIONI_LIST.map((s) => (
              <li key={s.code}>
                <FilterLink params={sp} update={{ sezione: s.code, page: "1" }} active={sezione === s.code}>
                  {s.plural}
                </FilterLink>
              </li>
            ))}
          </ul>
        </aside>

        <section>
          {results.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="mb-4">Nessun ETS trovato.</p>
              <p className="text-sm">
                Prova a modificare i filtri o la chiave di ricerca.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {results.map((ets) => {
                const sez = sezioneFromCode(ets.sezione);
                return (
                  <li key={ets.id} className="py-4">
                    <Link href={`/ets/${ets.slug}`} className="block no-underline group">
                      <h3 className="font-semibold text-brand-700 group-hover:underline">
                        {ets.denominazione}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {sez?.label ?? ets.sezione}
                        {ets.comune && ` · ${ets.comune}`}
                        {ets.provincia && ` (${ets.provincia})`}
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
                <FilterLink params={sp} update={{ page: String(page - 1) }} className="px-3 py-1 border rounded">
                  ← Precedente
                </FilterLink>
              )}
              <span className="px-3 py-1 text-gray-600">
                Pagina {page} di {totalPages}
              </span>
              {page < totalPages && (
                <FilterLink params={sp} update={{ page: String(page + 1) }} className="px-3 py-1 border rounded">
                  Successiva →
                </FilterLink>
              )}
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}

function FilterLink({
  params, update, children, active = false, className = "",
}: {
  params: Search;
  update: Partial<Search>;
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}) {
  const merged: Record<string, string> = {};
  for (const [k, v] of Object.entries({ ...params, ...update })) {
    if (v) merged[k] = String(v);
  }
  const qs = new URLSearchParams(merged).toString();
  return (
    <Link
      href={`/cerca${qs ? `?${qs}` : ""}`}
      className={`no-underline ${active ? "font-semibold text-brand-700" : "text-gray-700 hover:text-brand-700"} ${className}`}
    >
      {children}
    </Link>
  );
}
