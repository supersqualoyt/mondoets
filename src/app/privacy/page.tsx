import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Privacy",
  description: "Informativa privacy di MondoEts.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 prose">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Informativa privacy</h1>
      <p className="text-gray-700">
        Questa informativa descrive il trattamento dei dati personali su mondoets.it. Pagina in preparazione: la versione
        definitiva sarà pubblicata prima del lancio dei servizi a pagamento.
      </p>
      <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">Dati provenienti dal RUNTS</h2>
      <p className="text-gray-700">
        Le schede pubbliche di MondoEts riportano dati anagrafici di ETS già pubblicati nel Registro Unico Nazionale del
        Terzo Settore. Per richieste di rettifica o cancellazione, scrivere a <a href="mailto:info@mondoets.it">info@mondoets.it</a>.
      </p>
    </div>
  );
}
