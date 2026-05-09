import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Modelli Excel per ETS",
  description: "Modelli Excel gratuiti per il terzo settore: bilancio ETS, registro soci, registro volontari, libro cassa, piano dei conti.",
  path: "/modelli",
});

export default function ModelliPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Modelli Excel</h1>
      <p className="text-gray-700 mb-6">Disponibili a breve:</p>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li>Bilancio d&apos;esercizio ETS</li>
        <li>Registro volontari</li>
        <li>Registro soci</li>
        <li>Libro cassa / prima nota</li>
        <li>Piano dei conti ETS</li>
        <li>Rendicontazione 5x1000</li>
        <li>Budget annuale</li>
      </ul>
    </div>
  );
}
