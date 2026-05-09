import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Chi siamo",
  description: "MondoEts è un progetto di Sesto Potere APS, partner tecnologico del terzo settore italiano.",
  path: "/chi-siamo",
});

export default function ChiSiamoPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Chi siamo</h1>
      <p className="text-gray-700 mb-4">
        MondoEts è il portale del terzo settore italiano: una vetrina pubblica di tutti gli enti iscritti al RUNTS, con
        strumenti gratuiti e servizi di intelligenza artificiale pensati per APS, ODV e imprese sociali.
      </p>
      <p className="text-gray-700 mb-4">
        Il progetto è promosso da <strong>Sesto Potere APS</strong>, ente del terzo settore con la missione di rendere
        accessibile la tecnologia agli ETS italiani.
      </p>
      <p className="text-gray-700">
        I dati anagrafici degli ETS provengono dal Registro Unico Nazionale del Terzo Settore (RUNTS), gestito dal
        Ministero del Lavoro e delle Politiche Sociali.
      </p>
    </div>
  );
}
