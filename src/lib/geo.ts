// Mapping geografico: provincia (sigla) → nome esteso + regione
// Le 110 province + città metropolitane italiane (post-riforma).

export type ProvinciaInfo = {
  sigla: string;
  nome: string;
  regione: string;
  regioneSlug: string;
};

export const PROVINCE: Record<string, ProvinciaInfo> = {
  AG: { sigla: "AG", nome: "Agrigento", regione: "Sicilia", regioneSlug: "sicilia" },
  AL: { sigla: "AL", nome: "Alessandria", regione: "Piemonte", regioneSlug: "piemonte" },
  AN: { sigla: "AN", nome: "Ancona", regione: "Marche", regioneSlug: "marche" },
  AO: { sigla: "AO", nome: "Aosta", regione: "Valle d'Aosta", regioneSlug: "valle-d-aosta" },
  AP: { sigla: "AP", nome: "Ascoli Piceno", regione: "Marche", regioneSlug: "marche" },
  AQ: { sigla: "AQ", nome: "L'Aquila", regione: "Abruzzo", regioneSlug: "abruzzo" },
  AR: { sigla: "AR", nome: "Arezzo", regione: "Toscana", regioneSlug: "toscana" },
  AT: { sigla: "AT", nome: "Asti", regione: "Piemonte", regioneSlug: "piemonte" },
  AV: { sigla: "AV", nome: "Avellino", regione: "Campania", regioneSlug: "campania" },
  BA: { sigla: "BA", nome: "Bari", regione: "Puglia", regioneSlug: "puglia" },
  BG: { sigla: "BG", nome: "Bergamo", regione: "Lombardia", regioneSlug: "lombardia" },
  BI: { sigla: "BI", nome: "Biella", regione: "Piemonte", regioneSlug: "piemonte" },
  BL: { sigla: "BL", nome: "Belluno", regione: "Veneto", regioneSlug: "veneto" },
  BN: { sigla: "BN", nome: "Benevento", regione: "Campania", regioneSlug: "campania" },
  BO: { sigla: "BO", nome: "Bologna", regione: "Emilia-Romagna", regioneSlug: "emilia-romagna" },
  BR: { sigla: "BR", nome: "Brindisi", regione: "Puglia", regioneSlug: "puglia" },
  BS: { sigla: "BS", nome: "Brescia", regione: "Lombardia", regioneSlug: "lombardia" },
  BT: { sigla: "BT", nome: "Barletta-Andria-Trani", regione: "Puglia", regioneSlug: "puglia" },
  BZ: { sigla: "BZ", nome: "Bolzano", regione: "Trentino-Alto Adige", regioneSlug: "trentino-alto-adige" },
  CA: { sigla: "CA", nome: "Cagliari", regione: "Sardegna", regioneSlug: "sardegna" },
  CB: { sigla: "CB", nome: "Campobasso", regione: "Molise", regioneSlug: "molise" },
  CE: { sigla: "CE", nome: "Caserta", regione: "Campania", regioneSlug: "campania" },
  CH: { sigla: "CH", nome: "Chieti", regione: "Abruzzo", regioneSlug: "abruzzo" },
  CL: { sigla: "CL", nome: "Caltanissetta", regione: "Sicilia", regioneSlug: "sicilia" },
  CN: { sigla: "CN", nome: "Cuneo", regione: "Piemonte", regioneSlug: "piemonte" },
  CO: { sigla: "CO", nome: "Como", regione: "Lombardia", regioneSlug: "lombardia" },
  CR: { sigla: "CR", nome: "Cremona", regione: "Lombardia", regioneSlug: "lombardia" },
  CS: { sigla: "CS", nome: "Cosenza", regione: "Calabria", regioneSlug: "calabria" },
  CT: { sigla: "CT", nome: "Catania", regione: "Sicilia", regioneSlug: "sicilia" },
  CZ: { sigla: "CZ", nome: "Catanzaro", regione: "Calabria", regioneSlug: "calabria" },
  EN: { sigla: "EN", nome: "Enna", regione: "Sicilia", regioneSlug: "sicilia" },
  FC: { sigla: "FC", nome: "Forlì-Cesena", regione: "Emilia-Romagna", regioneSlug: "emilia-romagna" },
  FE: { sigla: "FE", nome: "Ferrara", regione: "Emilia-Romagna", regioneSlug: "emilia-romagna" },
  FG: { sigla: "FG", nome: "Foggia", regione: "Puglia", regioneSlug: "puglia" },
  FI: { sigla: "FI", nome: "Firenze", regione: "Toscana", regioneSlug: "toscana" },
  FM: { sigla: "FM", nome: "Fermo", regione: "Marche", regioneSlug: "marche" },
  FR: { sigla: "FR", nome: "Frosinone", regione: "Lazio", regioneSlug: "lazio" },
  GE: { sigla: "GE", nome: "Genova", regione: "Liguria", regioneSlug: "liguria" },
  GO: { sigla: "GO", nome: "Gorizia", regione: "Friuli-Venezia Giulia", regioneSlug: "friuli-venezia-giulia" },
  GR: { sigla: "GR", nome: "Grosseto", regione: "Toscana", regioneSlug: "toscana" },
  IM: { sigla: "IM", nome: "Imperia", regione: "Liguria", regioneSlug: "liguria" },
  IS: { sigla: "IS", nome: "Isernia", regione: "Molise", regioneSlug: "molise" },
  KR: { sigla: "KR", nome: "Crotone", regione: "Calabria", regioneSlug: "calabria" },
  LC: { sigla: "LC", nome: "Lecco", regione: "Lombardia", regioneSlug: "lombardia" },
  LE: { sigla: "LE", nome: "Lecce", regione: "Puglia", regioneSlug: "puglia" },
  LI: { sigla: "LI", nome: "Livorno", regione: "Toscana", regioneSlug: "toscana" },
  LO: { sigla: "LO", nome: "Lodi", regione: "Lombardia", regioneSlug: "lombardia" },
  LT: { sigla: "LT", nome: "Latina", regione: "Lazio", regioneSlug: "lazio" },
  LU: { sigla: "LU", nome: "Lucca", regione: "Toscana", regioneSlug: "toscana" },
  MB: { sigla: "MB", nome: "Monza e Brianza", regione: "Lombardia", regioneSlug: "lombardia" },
  MC: { sigla: "MC", nome: "Macerata", regione: "Marche", regioneSlug: "marche" },
  ME: { sigla: "ME", nome: "Messina", regione: "Sicilia", regioneSlug: "sicilia" },
  MI: { sigla: "MI", nome: "Milano", regione: "Lombardia", regioneSlug: "lombardia" },
  MN: { sigla: "MN", nome: "Mantova", regione: "Lombardia", regioneSlug: "lombardia" },
  MO: { sigla: "MO", nome: "Modena", regione: "Emilia-Romagna", regioneSlug: "emilia-romagna" },
  MS: { sigla: "MS", nome: "Massa-Carrara", regione: "Toscana", regioneSlug: "toscana" },
  MT: { sigla: "MT", nome: "Matera", regione: "Basilicata", regioneSlug: "basilicata" },
  NA: { sigla: "NA", nome: "Napoli", regione: "Campania", regioneSlug: "campania" },
  NO: { sigla: "NO", nome: "Novara", regione: "Piemonte", regioneSlug: "piemonte" },
  NU: { sigla: "NU", nome: "Nuoro", regione: "Sardegna", regioneSlug: "sardegna" },
  OR: { sigla: "OR", nome: "Oristano", regione: "Sardegna", regioneSlug: "sardegna" },
  PA: { sigla: "PA", nome: "Palermo", regione: "Sicilia", regioneSlug: "sicilia" },
  PC: { sigla: "PC", nome: "Piacenza", regione: "Emilia-Romagna", regioneSlug: "emilia-romagna" },
  PD: { sigla: "PD", nome: "Padova", regione: "Veneto", regioneSlug: "veneto" },
  PE: { sigla: "PE", nome: "Pescara", regione: "Abruzzo", regioneSlug: "abruzzo" },
  PG: { sigla: "PG", nome: "Perugia", regione: "Umbria", regioneSlug: "umbria" },
  PI: { sigla: "PI", nome: "Pisa", regione: "Toscana", regioneSlug: "toscana" },
  PN: { sigla: "PN", nome: "Pordenone", regione: "Friuli-Venezia Giulia", regioneSlug: "friuli-venezia-giulia" },
  PO: { sigla: "PO", nome: "Prato", regione: "Toscana", regioneSlug: "toscana" },
  PR: { sigla: "PR", nome: "Parma", regione: "Emilia-Romagna", regioneSlug: "emilia-romagna" },
  PT: { sigla: "PT", nome: "Pistoia", regione: "Toscana", regioneSlug: "toscana" },
  PU: { sigla: "PU", nome: "Pesaro e Urbino", regione: "Marche", regioneSlug: "marche" },
  PV: { sigla: "PV", nome: "Pavia", regione: "Lombardia", regioneSlug: "lombardia" },
  PZ: { sigla: "PZ", nome: "Potenza", regione: "Basilicata", regioneSlug: "basilicata" },
  RA: { sigla: "RA", nome: "Ravenna", regione: "Emilia-Romagna", regioneSlug: "emilia-romagna" },
  RC: { sigla: "RC", nome: "Reggio Calabria", regione: "Calabria", regioneSlug: "calabria" },
  RE: { sigla: "RE", nome: "Reggio Emilia", regione: "Emilia-Romagna", regioneSlug: "emilia-romagna" },
  RG: { sigla: "RG", nome: "Ragusa", regione: "Sicilia", regioneSlug: "sicilia" },
  RI: { sigla: "RI", nome: "Rieti", regione: "Lazio", regioneSlug: "lazio" },
  RM: { sigla: "RM", nome: "Roma", regione: "Lazio", regioneSlug: "lazio" },
  RN: { sigla: "RN", nome: "Rimini", regione: "Emilia-Romagna", regioneSlug: "emilia-romagna" },
  RO: { sigla: "RO", nome: "Rovigo", regione: "Veneto", regioneSlug: "veneto" },
  SA: { sigla: "SA", nome: "Salerno", regione: "Campania", regioneSlug: "campania" },
  SI: { sigla: "SI", nome: "Siena", regione: "Toscana", regioneSlug: "toscana" },
  SO: { sigla: "SO", nome: "Sondrio", regione: "Lombardia", regioneSlug: "lombardia" },
  SP: { sigla: "SP", nome: "La Spezia", regione: "Liguria", regioneSlug: "liguria" },
  SR: { sigla: "SR", nome: "Siracusa", regione: "Sicilia", regioneSlug: "sicilia" },
  SS: { sigla: "SS", nome: "Sassari", regione: "Sardegna", regioneSlug: "sardegna" },
  SU: { sigla: "SU", nome: "Sud Sardegna", regione: "Sardegna", regioneSlug: "sardegna" },
  SV: { sigla: "SV", nome: "Savona", regione: "Liguria", regioneSlug: "liguria" },
  TA: { sigla: "TA", nome: "Taranto", regione: "Puglia", regioneSlug: "puglia" },
  TE: { sigla: "TE", nome: "Teramo", regione: "Abruzzo", regioneSlug: "abruzzo" },
  TN: { sigla: "TN", nome: "Trento", regione: "Trentino-Alto Adige", regioneSlug: "trentino-alto-adige" },
  TO: { sigla: "TO", nome: "Torino", regione: "Piemonte", regioneSlug: "piemonte" },
  TP: { sigla: "TP", nome: "Trapani", regione: "Sicilia", regioneSlug: "sicilia" },
  TR: { sigla: "TR", nome: "Terni", regione: "Umbria", regioneSlug: "umbria" },
  TS: { sigla: "TS", nome: "Trieste", regione: "Friuli-Venezia Giulia", regioneSlug: "friuli-venezia-giulia" },
  TV: { sigla: "TV", nome: "Treviso", regione: "Veneto", regioneSlug: "veneto" },
  UD: { sigla: "UD", nome: "Udine", regione: "Friuli-Venezia Giulia", regioneSlug: "friuli-venezia-giulia" },
  VA: { sigla: "VA", nome: "Varese", regione: "Lombardia", regioneSlug: "lombardia" },
  VB: { sigla: "VB", nome: "Verbano-Cusio-Ossola", regione: "Piemonte", regioneSlug: "piemonte" },
  VC: { sigla: "VC", nome: "Vercelli", regione: "Piemonte", regioneSlug: "piemonte" },
  VE: { sigla: "VE", nome: "Venezia", regione: "Veneto", regioneSlug: "veneto" },
  VI: { sigla: "VI", nome: "Vicenza", regione: "Veneto", regioneSlug: "veneto" },
  VR: { sigla: "VR", nome: "Verona", regione: "Veneto", regioneSlug: "veneto" },
  VT: { sigla: "VT", nome: "Viterbo", regione: "Lazio", regioneSlug: "lazio" },
  VV: { sigla: "VV", nome: "Vibo Valentia", regione: "Calabria", regioneSlug: "calabria" },
};

export const PROVINCE_LIST = Object.values(PROVINCE).sort((a, b) => a.nome.localeCompare(b.nome, "it"));

export const REGIONI_LIST = Array.from(
  new Map(PROVINCE_LIST.map((p) => [p.regione, { nome: p.regione, slug: p.regioneSlug }])).values(),
).sort((a, b) => a.nome.localeCompare(b.nome, "it"));

export function provinciaFromSigla(sigla: string): ProvinciaInfo | null {
  return PROVINCE[sigla.toUpperCase()] ?? null;
}

export function provinceForRegione(regione: string): ProvinciaInfo[] {
  return PROVINCE_LIST.filter((p) => p.regione === regione);
}

export function regioneFromSlug(slug: string): { nome: string; slug: string } | null {
  return REGIONI_LIST.find((r) => r.slug === slug) ?? null;
}
