import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-3">Pagina non trovata</h1>
      <p className="text-gray-600 mb-8">La pagina che stai cercando non esiste o è stata spostata.</p>
      <Link href="/" className="inline-block px-6 py-3 bg-brand-600 text-white font-semibold rounded-md no-underline">
        Torna alla home
      </Link>
    </div>
  );
}
