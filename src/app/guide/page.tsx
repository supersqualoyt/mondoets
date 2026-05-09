import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Guide e checklist per ETS",
  description: "Guide e checklist gratuite per il terzo settore: adempimenti annuali, costituzione APS, trasparenza, GDPR, 5x1000.",
  path: "/guide",
});

export default function GuidePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Guide e checklist</h1>
      <p className="text-gray-700 mb-6">Prossime pubblicazioni:</p>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li>Adempimenti annuali ETS</li>
        <li>Costituzione APS</li>
        <li>Trasparenza obbligatoria</li>
        <li>GDPR per APS</li>
        <li>Vademecum 5x1000</li>
      </ul>
    </div>
  );
}
