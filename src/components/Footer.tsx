import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-gray-200 bg-gray-50 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">MondoEts</h4>
          <p className="text-gray-600">
            Il portale del terzo settore italiano. Un progetto di Sesto Potere APS.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Esplora</h4>
          <ul className="space-y-2">
            <li><Link href="/cerca" className="text-gray-600 hover:text-brand-700 no-underline">Cerca ETS</Link></li>
            <li><Link href="/sezione" className="text-gray-600 hover:text-brand-700 no-underline">Sezioni RUNTS</Link></li>
            <li><Link href="/regione" className="text-gray-600 hover:text-brand-700 no-underline">Regioni</Link></li>
            <li><Link href="/provincia" className="text-gray-600 hover:text-brand-700 no-underline">Province</Link></li>
            <li><Link href="/mappa" className="text-gray-600 hover:text-brand-700 no-underline">Mappa</Link></li>
            <li><Link href="/statistiche" className="text-gray-600 hover:text-brand-700 no-underline">Statistiche</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Risorse</h4>
          <ul className="space-y-2">
            <li><Link href="/strumenti" className="text-gray-600 hover:text-brand-700 no-underline">Strumenti</Link></li>
            <li><Link href="/guide" className="text-gray-600 hover:text-brand-700 no-underline">Guide</Link></li>
            <li><Link href="/calcolatori" className="text-gray-600 hover:text-brand-700 no-underline">Calcolatori</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Info</h4>
          <ul className="space-y-2">
            <li><Link href="/chi-siamo" className="text-gray-600 hover:text-brand-700 no-underline">Chi siamo</Link></li>
            <li><Link href="/privacy" className="text-gray-600 hover:text-brand-700 no-underline">Privacy</Link></li>
            <li><Link href="/contatti" className="text-gray-600 hover:text-brand-700 no-underline">Contatti</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-200 py-4 text-center text-xs text-gray-500">
        © {year} MondoEts — un progetto di Sesto Potere APS. I dati sugli ETS provengono dal RUNTS (Ministero del Lavoro).
      </div>
    </footer>
  );
}
