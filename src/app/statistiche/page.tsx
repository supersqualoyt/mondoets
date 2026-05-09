import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatNumber, slugify } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";
import { SEZIONI, sezioneFromCode } from "@/lib/sezioni";
import { PROVINCE } from "@/lib/geo";

export const revalidate = 3600;

export const metadata = buildMetadata({
  title: "Statistiche del terzo settore italiano",
  description: "Numeri e statistiche aggiornate sugli enti del terzo settore italiani: distribuzione per sezione, regione, provincia, accreditamento al 5x1000.",
  path: "/statistiche",
});

export default async function StatistichePage() {
  let totale = 0;
  let perSezione: Array<{ sezione: string; n: number }> = [];
  let perRegione: Array<{ regione: string; n: number }> = [];
  let perProvincia: Array<{ provincia: string; n: number }> = [];
  let cinquePerMille = 0;

  try {
    totale = await prisma.ets.count();
    const sez = await prisma.$queryRaw<Array<{ sezione: string; n: bigint }>>`
      SELECT sezione, COUNT(*) AS n FROM ets GROUP BY sezione
    `;
    perSezione = sez.map((r) => ({ sezione: r.sezione, n: Number(r.n) })).sort((a, b) => b.n - a.n);

    const reg = await prisma.$queryRaw<Array<{ regione: string | null; n: bigint }>>`
      SELECT regione, COUNT(*) AS n FROM ets WHERE regione IS NOT NULL GROUP BY regione
    `;
    perRegione = reg
      .filter((r) => r.regione)
      .map((r) => ({ regione: r.regione as string, n: Number(r.n) }))
      .sort((a, b) => b.n - a.n);

    const prov = await prisma.$queryRaw<Array<{ provincia: string | null; n: bigint }>>`
      SELECT provincia, COUNT(*) AS n FROM ets WHERE provincia IS NOT NULL GROUP BY provincia
    `;
    perProvincia = prov
      .filter((r) => r.provincia)
      .map((r) => ({ provincia: r.provincia as string, n: Number(r.n) }))
      .sort((a, b) => b.n - a.n)
      .slice(0, 20);

    cinquePerMille = await prisma.ets.count({ where: { flag5x1000: true } });
  } catch {
    // DB non pronto
  }

  const maxSezione = Math.max(...perSezione.map((r) => r.n), 1);
  const maxRegione = Math.max(...perRegione.map((r) => r.n), 1);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Statistiche del terzo settore</h1>
      <p className="text-gray-600 mb-8 max-w-3xl">
        Numeri aggiornati sul Registro Unico Nazionale del Terzo Settore (RUNTS).
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <Card label="ETS totali" value={formatNumber(totale)} />
        <Card label="Accreditati 5×1000" value={formatNumber(cinquePerMille)} />
        <Card label="Sezioni" value="7" />
        <Card label="Regioni coperte" value={formatNumber(perRegione.length)} />
      </div>

      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Distribuzione per sezione</h2>
        <div className="space-y-2">
          {perSezione.map((r) => {
            const sez = sezioneFromCode(r.sezione) ?? SEZIONI.ALTRI;
            const pct = (r.n / maxSezione) * 100;
            return (
              <Link key={r.sezione} href={`/sezione/${sez.slug}`} className="block no-underline group">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="font-semibold text-gray-900 group-hover:text-brand-700">{sez.plural}</span>
                  <span className="text-sm text-gray-600">{formatNumber(r.n)}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded overflow-hidden">
                  <div className="h-full bg-brand-500" style={{ width: `${pct}%` }} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Top 20 regioni</h2>
        <div className="space-y-2">
          {perRegione.slice(0, 20).map((r) => {
            const slug = slugify(r.regione);
            const pct = (r.n / maxRegione) * 100;
            return (
              <Link key={r.regione} href={`/regione/${slug}`} className="block no-underline group">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="font-semibold text-gray-900 group-hover:text-brand-700">{r.regione}</span>
                  <span className="text-sm text-gray-600">{formatNumber(r.n)}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded overflow-hidden">
                  <div className="h-full bg-brand-500" style={{ width: `${pct}%` }} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Top 20 province</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          {perProvincia.map((r) => {
            const p = PROVINCE[r.provincia];
            return (
              <li key={r.provincia}>
                <Link
                  href={`/provincia/${r.provincia.toLowerCase()}`}
                  className="block p-2 border border-gray-200 rounded hover:border-brand-500 no-underline"
                >
                  <span className="font-semibold text-gray-900">{p?.nome ?? r.provincia}</span>{" "}
                  <span className="text-xs text-gray-500">({r.provincia}) · {formatNumber(r.n)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg">
      <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
      <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
    </div>
  );
}
