import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Strumenti per ETS",
  description: "Tool documentali gratuiti per APS, ODV e altri enti del terzo settore: verbali, convocazioni, statuti, modulistica RUNTS.",
  path: "/strumenti",
});

export default function StrumentiPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Strumenti per ETS</h1>
      <p className="text-gray-700 mb-6">
        Gli strumenti documentali saranno disponibili a breve. Tutti gli enti registrati potranno generare gratuitamente
        fino a 3 documenti al mese; i soci di Sesto Potere APS hanno accesso illimitato.
      </p>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li>Generatore verbali assemblea</li>
        <li>Generatore convocazioni</li>
        <li>Statuto-tipo configurabile</li>
        <li>Pacchetto GDPR base</li>
        <li>Modulistica RUNTS</li>
        <li>Lettere di nomina cariche</li>
        <li>Modulo rimborsi spese volontari</li>
        <li>Tessere associative e attestati</li>
      </ul>
    </div>
  );
}
