import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { sezioneFromCode } from "@/lib/sezioni";
import { formatDateIt } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";
import MapaComune from "@/components/MapaComuneLoader";

export const revalidate = 86400;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ets = await safeFind(slug);
  if (!ets) return buildMetadata({ title: "ETS non trovato", path: `/ets/${slug}`, noindex: true });
  const sez = sezioneFromCode(ets.sezione);
  const luogo = [ets.comune, ets.provincia].filter(Boolean).join(", ");
  const description = `${ets.denominazione} — ${sez?.label ?? "ETS"}${luogo ? ` con sede a ${luogo}` : ""}. Codice fiscale ${ets.codiceFiscale}. Dati ufficiali RUNTS.`;
  return buildMetadata({ title: ets.denominazione, description, path: `/ets/${slug}` });
}

async function safeFind(slug: string) {
  try {
    return await prisma.ets.findUnique({ where: { slug } });
  } catch {
    return null;
  }
}

export default async function EtsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ets = await safeFind(slug);
  if (!ets) notFound();

  const sez = sezioneFromCode(ets.sezione);

  // Increment view (best-effort, no await blocco render se fallisce)
  prisma.ets.update({ where: { id: ets.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/" className="no-underline hover:underline">Home</Link>
        {" / "}
        <Link href="/cerca" className="no-underline hover:underline">Cerca ETS</Link>
        {" / "}
        <span>{ets.denominazione}</span>
      </nav>

      <header className="mb-8 pb-6 border-b border-gray-200">
        <span className="inline-block text-xs font-semibold uppercase tracking-wide text-brand-700 bg-brand-50 px-2 py-1 rounded mb-3">
          {sez?.label ?? ets.sezione}
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{ets.denominazione}</h1>
        {ets.statoIscrizione && (
          <p className="text-sm text-gray-600">
            Stato RUNTS: <strong>{ets.statoIscrizione}</strong>
          </p>
        )}
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        <DataBlock title="Anagrafica">
          <Row label="Denominazione" value={ets.denominazione} />
          <Row label="Codice fiscale" value={ets.codiceFiscale} />
          {ets.partitaIva && <Row label="Partita IVA" value={ets.partitaIva} />}
          {ets.naturaGiuridica && <Row label="Natura giuridica" value={ets.naturaGiuridica} />}
          {ets.numeroRepertorio && <Row label="N. repertorio RUNTS" value={ets.numeroRepertorio} />}
        </DataBlock>

        <DataBlock title="Sede legale">
          {ets.indirizzo && <Row label="Indirizzo" value={ets.indirizzo} />}
          {ets.cap && <Row label="CAP" value={ets.cap} />}
          {ets.comune && <Row label="Comune" value={ets.comune} />}
          {ets.provincia && <Row label="Provincia" value={ets.provincia} />}
          {ets.regione && <Row label="Regione" value={ets.regione} />}
        </DataBlock>

        <DataBlock title="Contatti">
          {ets.email && <Row label="Email" value={<a href={`mailto:${ets.email}`}>{ets.email}</a>} />}
          {ets.pec && <Row label="PEC" value={<a href={`mailto:${ets.pec}`}>{ets.pec}</a>} />}
          {ets.telefono && <Row label="Telefono" value={ets.telefono} />}
          {ets.sitoWeb && (
            <Row label="Sito web" value={<a href={ets.sitoWeb} target="_blank" rel="noopener noreferrer">{ets.sitoWeb}</a>} />
          )}
          {!ets.email && !ets.pec && !ets.telefono && !ets.sitoWeb && (
            <p className="text-sm text-gray-500">Nessun contatto pubblico nel RUNTS.</p>
          )}
        </DataBlock>

        <DataBlock title="Iscrizione RUNTS">
          {ets.dataIscrizione && <Row label="Data iscrizione" value={formatDateIt(ets.dataIscrizione)} />}
          {ets.dataCostituzione && <Row label="Data costituzione" value={formatDateIt(ets.dataCostituzione)} />}
          {ets.statoIscrizione && <Row label="Stato" value={ets.statoIscrizione} />}
        </DataBlock>
      </div>

      {ets.comune && ets.provincia && (
        <section className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-xl font-bold mb-3">Sede sulla mappa</h2>
          <MapaComune comune={ets.comune} provincia={ets.provincia} denominazione={ets.denominazione} />
        </section>
      )}

      {ets.scopo && (
        <section className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-xl font-bold mb-3">Scopo</h2>
          <p className="text-gray-700 whitespace-pre-line">{ets.scopo}</p>
        </section>
      )}

      <p className="mt-12 text-xs text-gray-500">
        I dati provengono dal RUNTS (Registro Unico Nazionale del Terzo Settore) — Ministero del Lavoro e delle Politiche Sociali.
        Per segnalare errori, scrivi a info@mondoets.it.
      </p>
    </div>
  );
}

function DataBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-3">{title}</h2>
      <dl className="space-y-2 text-sm">{children}</dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-3">
      <dt className="font-medium text-gray-500 sm:w-40">{label}</dt>
      <dd className="text-gray-900">{value}</dd>
    </div>
  );
}
