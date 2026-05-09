import Link from "next/link";
import { prisma } from "@/lib/db";
import SearchBar from "@/components/SearchBar";
import { SEZIONI_LIST, sezioneFromCode } from "@/lib/sezioni";
import { REGIONI_LIST, provinceForRegione, PROVINCE } from "@/lib/geo";
import { formatNumber } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Cerca ETS",
  description: "Ricerca avanzata tra tutti gli enti del terzo settore iscritti al RUNTS, con filtri per sezione, regione, provincia e altri criteri.",
  path: "/cerca",
});

const PAGE_SIZE = 20;

type Search = {
  q?: string;
  sezione?: string;
  regione?: string;
  provincia?: string;
  cinque?: string;
  sort?: string;
  page?: string;
};

const SORTS: Record<string, { label: string; orderBy: { denominazione?: "asc" | "desc"; dataIscrizione?: "asc" | "desc" } }> = {
  "az": { label: "Denominazione A→Z", orderBy: { denominazione: "asc" } },
  "za": { label: "Denominazione Z→A", orderBy: { denominazione: "desc" } },
  "recente": { label: "Più recenti", orderBy: { dataIscrizione: "desc" } },
  "vecchio": { label: "Più vecchi", orderBy: { dataIscrizione: "asc" } },
};

export default async function CercaPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const sezione = sp.sezione ?? "";
  const regioneSlug = sp.regione ?? "";
  const provinciaSigla = (sp.provincia ?? "").toUpperCase();
  const cinque = sp.cinque ?? "";
  const sortKey = sp.sort && SORTS[sp.sort] ? sp.sort : "az";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));

  const regione = REGIONI_LIST.find((r) => r.slug === regioneSlug);
  const provincia = PROVINCE[provinciaSigla];

  const where: Record<string, unknown> = {};
  if (q) where.denominazione = { contains: q };
  if (sezione) where.sezione = sezione;
  if (regione) where.regione = regione.nome;
  if (provincia) where.provincia = provincia.sigla;
  if (cinque === "si") where.flag5x1000 = true;
  if (cinque === "no") where.flag5x1000 = false;

  let results: Array<{
    id: number; slug: string; denominazione: string; sezione: string;
    comune: string | null; provincia: string | null; regione: string | null;
    flag5x1000: boolean | null; dataIscrizione: Date | null;
  }> = [];
  let total = 0;

  try {
    [results, total] = await Promise.all([
      prisma.ets.findMany({
        where,
        select: {
          id: true, slug: true, denominazione: true, sezione: true,
          comune: true, provincia: true, regione: true,
          flag5x1000: true, dataIscrizione: true,
        },
        orderBy: SORTS[sortKey].orderBy,
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.ets.count({ where }),
    ]);
  } catch {
    // DB non pronto
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const provinceFiltro = regione ? provinceForRegione(regione.nome) : [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Cerca un ETS</h1>
      <p className="text-gray-600 mb-6">
        {total > 0 ? `${formatNumber(total)} risultati` : "Nessun risultato per questi filtri."}
      </p>

      <div className="mb-6">
        <SearchBar defaultValue={q} />
      </div>

      <div className="grid md:grid-cols-[260px_1fr] gap-8">
        <aside className="space-y-6">
          <FilterGroup label="Sezione RUNTS">
            <FilterLink params={sp} update={{ sezione: "", page: "1" }} active={!sezione}>
              Tutte
            </FilterLink>
            {SEZIONI_LIST.map((s) => (
              <FilterLink key={s.code} params={sp} update={{ sezione: s.code, page: "1" }} active={sezione === s.code}>
                {s.plural}
              </FilterLink>
            ))}
          </FilterGroup>

          <FilterGroup label="Regione">
            <FilterLink params={sp} update={{ regione: "", provincia: "", page: "1" }} active={!regioneSlug}>
              Tutte
            </FilterLink>
            {REGIONI_LIST.map((r) => (
              <FilterLink
                key={r.slug}
                params={sp}
                update={{ regione: r.slug, provincia: "", page: "1" }}
                active={regioneSlug === r.slug}
              >
                {r.nome}
              </FilterLink>
            ))}
          </FilterGroup>

          {regione && provinceFiltro.length > 0 && (
            <FilterGroup label={`Provincia in ${regione.nome}`}>
              <FilterLink params={sp} update={{ provincia: "", page: "1" }} active={!provinciaSigla}>
                Tutte
              </FilterLink>
              {provinceFiltro.map((p) => (
                <FilterLink
                  key={p.sigla}
                  params={sp}
                  update={{ provincia: p.sigla, page: "1" }}
                  active={provinciaSigla === p.sigla}
                >
                  {p.nome}
                </FilterLink>
              ))}
            </FilterGroup>
          )}

          <FilterGroup label="5×1000">
            <FilterLink params={sp} update={{ cinque: "", page: "1" }} active={!cinque}>
              Indifferente
            </FilterLink>
            <FilterLink params={sp} update={{ cinque: "si", page: "1" }} active={cinque === "si"}>
              Solo accreditati
            </FilterLink>
            <FilterLink params={sp} update={{ cinque: "no", page: "1" }} active={cinque === "no"}>
              Esclusi
            </FilterLink>
          </FilterGroup>

          <FilterGroup label="Ordina">
            {Object.entries(SORTS).map(([k, v]) => (
              <FilterLink key={k} params={sp} update={{ sort: k, page: "1" }} active={sortKey === k}>
                {v.label}
              </FilterLink>
            ))}
          </FilterGroup>
        </aside>

        <section>
          {results.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="mb-4">Nessun ETS trovato.</p>
              <p className="text-sm">Prova a modificare i filtri o la chiave di ricerca.</p>
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
                        {ets.flag5x1000 && <span className="ml-2 text-xs px-1.5 py-0.5 bg-green-50 text-green-700 rounded">5×1000</span>}
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

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wide">{label}</h2>
      <ul className="space-y-1 text-sm">
        {Array.isArray(children) ? children.map((c, i) => <li key={i}>{c}</li>) : <li>{children}</li>}
      </ul>
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
