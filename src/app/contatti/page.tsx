import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Contatti",
  description: "Contatta la redazione di MondoEts e Sesto Potere APS.",
  path: "/contatti",
});

export default function ContattiPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Contatti</h1>
      <p className="text-gray-700 mb-3">
        Email: <a href="mailto:info@mondoets.it">info@mondoets.it</a>
      </p>
      <p className="text-gray-700">
        Per segnalare errori in una scheda ETS, scrivi citando la denominazione e il codice fiscale dell&apos;ente.
      </p>
    </div>
  );
}
