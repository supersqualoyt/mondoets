// Sezioni RUNTS ex DM 106/2020
export const SEZIONI = {
  ODV: {
    code: "ODV",
    label: "Organizzazione di Volontariato",
    plural: "Organizzazioni di Volontariato",
    slug: "odv",
    description:
      "Le ODV sono enti del terzo settore costituiti per svolgere attività di interesse generale a favore di terzi, prevalentemente tramite l'opera gratuita di volontari.",
  },
  APS: {
    code: "APS",
    label: "Associazione di Promozione Sociale",
    plural: "Associazioni di Promozione Sociale",
    slug: "aps",
    description:
      "Le APS sono enti del terzo settore costituiti per svolgere attività di interesse generale in favore dei propri associati, dei loro familiari o di terzi, avvalendosi prevalentemente di volontari.",
  },
  FIL: {
    code: "FIL",
    label: "Ente Filantropico",
    plural: "Enti Filantropici",
    slug: "enti-filantropici",
    description:
      "Gli enti filantropici sono ETS che erogano denaro, beni o servizi a sostegno di categorie di persone svantaggiate o di attività di interesse generale.",
  },
  IS: {
    code: "IS",
    label: "Impresa Sociale",
    plural: "Imprese Sociali",
    slug: "imprese-sociali",
    description:
      "Le imprese sociali sono enti privati che esercitano in via stabile e principale un'attività d'impresa di interesse generale, senza scopo di lucro e per finalità civiche, solidaristiche e di utilità sociale. Comprendono le cooperative sociali.",
  },
  RA: {
    code: "RA",
    label: "Rete Associativa",
    plural: "Reti Associative",
    slug: "reti-associative",
    description:
      "Le reti associative sono ETS associativi che svolgono attività di coordinamento, tutela, rappresentanza, promozione o supporto degli ETS associati.",
  },
  SMS: {
    code: "SMS",
    label: "Società di Mutuo Soccorso",
    plural: "Società di Mutuo Soccorso",
    slug: "societa-di-mutuo-soccorso",
    description:
      "Le società di mutuo soccorso sono enti che perseguono finalità di mutualità, garantendo ai propri soci sussidi e servizi in ambito sanitario e assistenziale.",
  },
  ALTRI: {
    code: "ALTRI",
    label: "Altro Ente del Terzo Settore",
    plural: "Altri Enti del Terzo Settore",
    slug: "altri-ets",
    description:
      "Gli altri ETS sono enti iscritti al RUNTS che non rientrano in una sezione specifica ma svolgono attività di interesse generale ai sensi dell'art. 5 del Codice del Terzo Settore.",
  },
} as const;

export type SezioneCode = keyof typeof SEZIONI;
export const SEZIONI_LIST = Object.values(SEZIONI);

export function sezioneFromSlug(slug: string) {
  return SEZIONI_LIST.find((s) => s.slug === slug) ?? null;
}

export function sezioneFromCode(code: string) {
  return SEZIONI[code as SezioneCode] ?? null;
}
