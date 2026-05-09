import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import { prisma } from "@/lib/db";
import { SEZIONI_LIST } from "@/lib/sezioni";
import { formatNumber } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata = buildMetadata({
  title: "MondoEts — Il portale del terzo settore italiano",
  path: "/",
});

async function getStats() {
  try {
    const totale = await prisma.ets.count();
    const rows = await prisma.$queryRaw<Array<{ sezione: string; n: bigint }>>`
      SELECT sezione, COUNT(*) AS n FROM ets GROUP BY sezione
    `;
    const perSezione = rows.map((r) => ({ sezione: r.sezione, n: Number(r.n) }));
    return { totale, perSezione };
  } catch {
    return { totale: 0, perSezione: [] as Array<{ sezione: string; n: number }> };
  }
}

export default async function HomePage() {
  const stats = await getStats();
  const countMap = new Map(stats.perSezione.map((r) => [r.sezione, r.n]));

  return (
    <>
      <section className="bg-gradient-to-b from-brand-50 to-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Il portale del terzo settore italiano
          </h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-8">
            Cerca tra <strong>{stats.totale > 0 ? formatNumber(stats.totale) : "tutti gli"}</strong> enti
            iscritti al RUNTS. Scarica modelli, usa calcolatori e tool documentali per la tua APS, ODV o
            impresa sociale.
          </p>
          <div className="flex justify-center">
            <SearchBar />
          </div>
          <div className="mt-6 text-sm text-gray-600">
            Cerchi un ETS specifico?{" "}
            <Link href="/cerca" className="font-semibold">Ricerca avanzata</Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Esplora per sezione RUNTS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SEZIONI_LIST.map((s) => (
            <Link
              key={s.code}
              href={`/sezione/${s.slug}`}
              className="block p-5 border border-gray-200 rounded-lg hover:border-brand-500 hover:shadow-sm no-underline"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{s.plural}</h3>
                {countMap.has(s.code) && (
                  <span className="text-xs text-gray-500">{formatNumber(countMap.get(s.code)!)}</span>
                )}
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{s.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-6">
          <FeatureCard
            title="Strumenti documentali gratuiti"
            text="Verbali assemblea, convocazioni, lettere di nomina, modulistica RUNTS. 3 documenti gratis al mese."
            href="/strumenti"
            cta="Vai agli strumenti"
          />
          <FeatureCard
            title="Calcolatori utili"
            text="Quote associative, 5x1000, rimborsi volontari, costi assemblea. Tutti gratis e online."
            href="/calcolatori"
            cta="Apri i calcolatori"
          />
          <FeatureCard
            title="Modelli Excel pronti"
            text="Bilancio ETS, registro soci, registro volontari, libro cassa, piano dei conti. Da scaricare e usare."
            href="/modelli"
            cta="Scarica i modelli"
          />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Sei un ETS? Diventa socio.</h2>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-8">
          Sesto Potere APS offre ai propri soci servizi di intelligenza artificiale a prezzi calmierati: assistenti per
          bandi, generazione documenti, knowledge base privata, compliance assistant.
        </p>
        <Link
          href="/diventa-socio"
          className="inline-block px-8 py-3 bg-brand-600 text-white font-semibold rounded-md hover:bg-brand-700 no-underline"
        >
          Scopri i piani
        </Link>
      </section>
    </>
  );
}

function FeatureCard({ title, text, href, cta }: { title: string; text: string; href: string; cta: string }) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{text}</p>
      <Link href={href} className="text-sm font-semibold text-brand-600 no-underline">
        {cta} →
      </Link>
    </div>
  );
}
