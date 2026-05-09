import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Calcolatori per ETS",
  description: "Calcolatori online gratuiti per il terzo settore: quote associative, 5x1000, rimborsi volontari, costi assemblea.",
  path: "/calcolatori",
});

export default function CalcolatoriPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Calcolatori</h1>
      <p className="text-gray-700 mb-6">In arrivo:</p>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li>Calcolatore quote associative</li>
        <li>Calcolatore 5x1000</li>
        <li>Calcolatore rimborsi volontari</li>
        <li>Calcolatore costi assemblea</li>
      </ul>
    </div>
  );
}
