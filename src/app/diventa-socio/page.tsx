import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Diventa socio Sesto Potere APS",
  description: "Servizi di intelligenza artificiale a prezzi calmierati per ETS soci di Sesto Potere APS: assistenti per bandi, generazione documenti, knowledge base privata, compliance.",
  path: "/diventa-socio",
});

const PIANI = [
  {
    nome: "Plus IA",
    prezzo: "€19/mese",
    bullets: [
      "Tool documentali illimitati",
      "AI generazione testi (server EU GDPR-compliant)",
      "500 messaggi/mese",
      "Conoscenza specifica del Codice Terzo Settore",
      "Storico documenti generati",
      "Supporto email",
    ],
  },
  {
    nome: "Pro IA",
    prezzo: "€39/mese",
    highlight: true,
    bullets: [
      "Tutto Plus, più:",
      "Knowledge assistant privato (chatbot sui tuoi documenti)",
      "2.500 messaggi/mese",
      "Generazione immagini e locandine",
      "Trascrizione audio (assemblee, riunioni)",
      "Bandi matching personalizzato",
      "Compliance assistant (statuto, GDPR, RUNTS)",
      "Multi-utente fino a 3 membri",
    ],
  },
  {
    nome: "Business",
    prezzo: "€89/mese",
    bullets: [
      "Tutto Pro, più:",
      "10.000 messaggi/mese",
      "Multi-utente illimitato",
      "API per integrazioni",
      "DPA personalizzato",
      "Onboarding dedicato",
      "Account manager",
    ],
  },
];

export default function DiventaSocioPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Diventa socio di Sesto Potere APS</h1>
      <p className="text-gray-700 mb-10 max-w-3xl">
        MondoEts è un progetto di Sesto Potere APS. I soci accedono a strumenti di intelligenza artificiale pensati
        per il terzo settore italiano, a prezzi calmierati e con dati su server europei.
      </p>

      <div className="grid md:grid-cols-3 gap-5">
        {PIANI.map((p) => (
          <div
            key={p.nome}
            className={`p-6 rounded-lg border ${
              p.highlight ? "border-brand-500 ring-2 ring-brand-500" : "border-gray-200"
            }`}
          >
            <h2 className="text-xl font-bold text-gray-900">{p.nome}</h2>
            <p className="text-2xl font-bold text-brand-700 mt-1 mb-4">{p.prezzo}</p>
            <ul className="space-y-1.5 text-sm text-gray-700">
              {p.bullets.map((b) => (
                <li key={b}>• {b}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-500 mt-10 max-w-3xl">
        I servizi descritti sono in fase di attivazione. Lascia la tua email per essere avvisato al lancio:{" "}
        <a href="mailto:info@mondoets.it">info@mondoets.it</a>.
      </p>
    </div>
  );
}
