import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-6">
        <Link href="/" className="font-bold text-xl text-brand-700 no-underline">
          MondoEts
        </Link>
        <nav className="flex-1 hidden md:flex items-center gap-5 text-sm">
          <Link href="/cerca" className="text-gray-700 hover:text-brand-700 no-underline">
            Cerca ETS
          </Link>
          <Link href="/sezione" className="text-gray-700 hover:text-brand-700 no-underline">
            Sezioni RUNTS
          </Link>
          <Link href="/regione" className="text-gray-700 hover:text-brand-700 no-underline">
            Regioni
          </Link>
          <Link href="/mappa" className="text-gray-700 hover:text-brand-700 no-underline">
            Mappa
          </Link>
          <Link href="/statistiche" className="text-gray-700 hover:text-brand-700 no-underline">
            Statistiche
          </Link>
          <Link href="/strumenti" className="text-gray-700 hover:text-brand-700 no-underline">
            Strumenti
          </Link>
          <Link href="/guide" className="text-gray-700 hover:text-brand-700 no-underline">
            Guide
          </Link>
        </nav>
      </div>
    </header>
  );
}
