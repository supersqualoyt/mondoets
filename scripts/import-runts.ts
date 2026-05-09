/**
 * Importer RUNTS — legge dump open-data ufficiale (xlsx convertito in CSV).
 *
 * Uso:
 *   npm run import-runts -- ~/runts-dump/20260510_iscritti.csv
 */
import { PrismaClient } from "@prisma/client";
import { parse } from "csv-parse";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { slugify } from "../src/lib/format";

const prisma = new PrismaClient();

// Mappa: campo Ets → alias header (normalizzati: lowercase, spazi singoli)
const MAP: Record<string, string[]> = {
  codiceFiscale: ["codice fiscale steuernummer", "codice fiscale", "cf", "codicefiscale"],
  numeroRepertorio: ["repertorio repertoire", "repertorio", "numero repertorio"],
  denominazione: ["denominazione bezeichnung", "denominazione"],
  sezione: ["sezione (*) sektion", "sezione (*)", "sezione", "tipologia"],
  legaleRappresentante: [
    "cognome e nome legali rapp. name und vorname d. gesetzl. vertreters",
    "cognome e nome legali rapp.",
    "legale rappresentante",
  ],
  flagRete: ["rete netzwerk", "rete"],
  comune: ["comune sede legale gemeinsame rechtssitz", "comune sede legale", "comune"],
  provincia: ["provincia sede legale provinz rechtssitz", "provincia sede legale", "provincia"],
  flag5x1000: ["5x 1000", "5x1000", "5 per mille"],
  dataIscrizione: ["data iscrizione anmeldedatum", "data iscrizione"],
  // campi extra opzionali da altri dump
  partitaIva: ["partita iva", "p iva", "piva"],
  naturaGiuridica: ["natura giuridica", "forma giuridica"],
  email: ["email", "e-mail"],
  pec: ["pec", "indirizzo pec"],
  telefono: ["telefono", "tel"],
  sitoWeb: ["sito web", "sito internet", "url"],
  cap: ["cap"],
  indirizzo: ["indirizzo", "via"],
  scopo: ["scopo", "oggetto sociale"],
  attivitaInteresse: ["attivita di interesse generale", "attivita interesse"],
  statoIscrizione: ["stato iscrizione", "stato"],
  dataCostituzione: ["data costituzione"],
};

const SEZIONI_ALIAS: Record<string, "ODV" | "APS" | "FIL" | "IS" | "RA" | "SMS" | "ALTRI"> = {
  "organizzazioni di volontariato": "ODV",
  "organizzazione di volontariato": "ODV",
  "odv": "ODV",
  "associazioni di promozione sociale": "APS",
  "associazione di promozione sociale": "APS",
  "aps": "APS",
  "enti filantropici": "FIL",
  "ente filantropico": "FIL",
  "filantropico": "FIL",
  "fil": "FIL",
  "imprese sociali": "IS",
  "impresa sociale": "IS",
  "is": "IS",
  "reti associative": "RA",
  "rete associativa": "RA",
  "ra": "RA",
  "societa di mutuo soccorso": "SMS",
  "societa' di mutuo soccorso": "SMS",
  "società di mutuo soccorso": "SMS",
  "sms": "SMS",
  "altri enti del terzo settore": "ALTRI",
  "altri ets": "ALTRI",
  "altri": "ALTRI",
  "altro": "ALTRI",
};

const PROV_TO_REG: Record<string, string> = {
  AQ: "Abruzzo", CH: "Abruzzo", PE: "Abruzzo", TE: "Abruzzo",
  MT: "Basilicata", PZ: "Basilicata",
  CS: "Calabria", CZ: "Calabria", KR: "Calabria", RC: "Calabria", VV: "Calabria",
  AV: "Campania", BN: "Campania", CE: "Campania", NA: "Campania", SA: "Campania",
  BO: "Emilia-Romagna", FC: "Emilia-Romagna", FE: "Emilia-Romagna", MO: "Emilia-Romagna",
  PC: "Emilia-Romagna", PR: "Emilia-Romagna", RA: "Emilia-Romagna", RE: "Emilia-Romagna", RN: "Emilia-Romagna",
  GO: "Friuli-Venezia Giulia", PN: "Friuli-Venezia Giulia", TS: "Friuli-Venezia Giulia", UD: "Friuli-Venezia Giulia",
  FR: "Lazio", LT: "Lazio", RI: "Lazio", RM: "Lazio", VT: "Lazio",
  GE: "Liguria", IM: "Liguria", SP: "Liguria", SV: "Liguria",
  BG: "Lombardia", BS: "Lombardia", CO: "Lombardia", CR: "Lombardia", LC: "Lombardia",
  LO: "Lombardia", MB: "Lombardia", MI: "Lombardia", MN: "Lombardia", PV: "Lombardia",
  SO: "Lombardia", VA: "Lombardia",
  AN: "Marche", AP: "Marche", FM: "Marche", MC: "Marche", PU: "Marche",
  CB: "Molise", IS: "Molise",
  AL: "Piemonte", AT: "Piemonte", BI: "Piemonte", CN: "Piemonte", NO: "Piemonte",
  TO: "Piemonte", VB: "Piemonte", VC: "Piemonte",
  BA: "Puglia", BR: "Puglia", BT: "Puglia", FG: "Puglia", LE: "Puglia", TA: "Puglia",
  CA: "Sardegna", NU: "Sardegna", OR: "Sardegna", SS: "Sardegna", SU: "Sardegna",
  AG: "Sicilia", CL: "Sicilia", CT: "Sicilia", EN: "Sicilia", ME: "Sicilia",
  PA: "Sicilia", RG: "Sicilia", SR: "Sicilia", TP: "Sicilia",
  AR: "Toscana", FI: "Toscana", GR: "Toscana", LI: "Toscana", LU: "Toscana",
  MS: "Toscana", PI: "Toscana", PO: "Toscana", PT: "Toscana", SI: "Toscana",
  BZ: "Trentino-Alto Adige", TN: "Trentino-Alto Adige",
  PG: "Umbria", TR: "Umbria",
  AO: "Valle d'Aosta",
  BL: "Veneto", PD: "Veneto", RO: "Veneto", TV: "Veneto", VE: "Veneto", VI: "Veneto", VR: "Veneto",
};

function normalizeKey(k: string) {
  return k
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/['’`]/g, "")
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ");
}

function buildHeaderIndex(header: string[]) {
  const idx: Record<string, number> = {};
  const normHeader = header.map(normalizeKey);
  for (const [field, aliases] of Object.entries(MAP)) {
    for (const a of aliases) {
      const i = normHeader.indexOf(a);
      if (i !== -1) {
        idx[field] = i;
        break;
      }
    }
  }
  return idx;
}

function pick(row: string[], idx: Record<string, number>, field: string): string | null {
  const i = idx[field];
  if (i === undefined) return null;
  const v = row[i];
  if (v === undefined) return null;
  const trimmed = v.trim();
  return trimmed === "" ? null : trimmed;
}

function parseSezione(raw: string | null): "ODV" | "APS" | "FIL" | "IS" | "RA" | "SMS" | "ALTRI" {
  if (!raw) return "ALTRI";
  return SEZIONI_ALIAS[normalizeKey(raw)] ?? "ALTRI";
}

function parseDate(raw: string | null): Date | null {
  if (!raw) return null;
  const s = raw.trim();
  let m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) return new Date(`${m[3]}-${m[2]}-${m[1]}`);
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return new Date(s);
  return null;
}

function parseSiNo(raw: string | null): boolean | null {
  if (!raw) return null;
  const s = raw.trim().toLowerCase();
  if (s === "si" || s === "sì" || s === "yes" || s === "1" || s === "true") return true;
  if (s === "no" || s === "0" || s === "false") return false;
  return null;
}

async function detectDelimiter(file: string): Promise<"," | ";"> {
  return new Promise((resolve) => {
    const stream = createReadStream(file, { encoding: "utf8" });
    let buf = "";
    stream.on("data", (chunk) => {
      buf += chunk;
      if (buf.length > 4096) {
        stream.destroy();
        const semis = (buf.match(/;/g) ?? []).length;
        const commas = (buf.match(/,/g) ?? []).length;
        resolve(semis > commas ? ";" : ",");
      }
    });
    stream.on("end", () => {
      const semis = (buf.match(/;/g) ?? []).length;
      const commas = (buf.match(/,/g) ?? []).length;
      resolve(semis > commas ? ";" : ",");
    });
    stream.on("error", () => resolve(","));
  });
}

async function importFile(file: string) {
  const st = await stat(file);
  console.log(`-> ${file} (${(st.size / 1024 / 1024).toFixed(1)} MB)`);
  const delimiter = await detectDelimiter(file);
  console.log(`   delimitatore: ${delimiter}`);

  let idx: Record<string, number> | null = null;
  let inserted = 0;
  let skipped = 0;
  const seenCf = new Set<string>();
  const seenSlug = new Set<string>();
  const buffer: Array<Record<string, unknown>> = [];
  const BATCH = 500;

  async function flush() {
    if (buffer.length === 0) return;
    try {
      const r = await prisma.ets.createMany({ data: buffer as never, skipDuplicates: true });
      inserted += r.count;
    } catch (err) {
      console.error("batch error:", (err as Error).message);
    }
    buffer.length = 0;
    if (inserted > 0 && inserted % 5000 < BATCH) console.log(`   inseriti ${inserted}…`);
  }

  await new Promise<void>((resolve, reject) => {
    const parser = createReadStream(file).pipe(
      parse({
        delimiter,
        relax_quotes: true,
        relax_column_count: true,
        skip_empty_lines: true,
        bom: true,
      }),
    );
    parser.on("data", async (row: string[]) => {
      if (!idx) {
        idx = buildHeaderIndex(row);
        const found = Object.keys(idx);
        console.log(`   colonne mappate: ${found.join(", ")}`);
        const missing = ["codiceFiscale", "denominazione", "sezione"].filter((k) => idx![k] === undefined);
        if (missing.length) {
          parser.destroy();
          reject(new Error(`Colonne obbligatorie non trovate: ${missing.join(", ")}`));
          return;
        }
        return;
      }

      const cf = pick(row, idx, "codiceFiscale");
      const denominazione = pick(row, idx, "denominazione");
      if (!cf || !denominazione) {
        skipped++;
        return;
      }
      if (seenCf.has(cf)) {
        skipped++;
        return;
      }
      seenCf.add(cf);

      const sezione = parseSezione(pick(row, idx, "sezione"));
      const provincia = pick(row, idx, "provincia");
      const regione = provincia ? PROV_TO_REG[provincia.toUpperCase()] ?? null : null;

      let slug = slugify(`${denominazione}-${cf.slice(-4)}`);
      if (seenSlug.has(slug)) {
        slug = slugify(`${denominazione}-${cf}`);
      }
      seenSlug.add(slug);

      buffer.push({
        slug,
        codiceFiscale: cf,
        partitaIva: pick(row, idx, "partitaIva"),
        numeroRepertorio: pick(row, idx, "numeroRepertorio"),
        denominazione,
        naturaGiuridica: pick(row, idx, "naturaGiuridica"),
        sezione,
        legaleRappresentante: pick(row, idx, "legaleRappresentante"),
        flag5x1000: parseSiNo(pick(row, idx, "flag5x1000")),
        flagRete: parseSiNo(pick(row, idx, "flagRete")),
        email: pick(row, idx, "email"),
        pec: pick(row, idx, "pec"),
        telefono: pick(row, idx, "telefono"),
        sitoWeb: pick(row, idx, "sitoWeb"),
        regione,
        provincia: provincia ? provincia.toUpperCase() : null,
        comune: pick(row, idx, "comune"),
        cap: pick(row, idx, "cap"),
        indirizzo: pick(row, idx, "indirizzo"),
        scopo: pick(row, idx, "scopo"),
        attivitaInteresse: pick(row, idx, "attivitaInteresse"),
        statoIscrizione: pick(row, idx, "statoIscrizione") ?? "ISCRITTO",
        dataIscrizione: parseDate(pick(row, idx, "dataIscrizione")),
        dataCostituzione: parseDate(pick(row, idx, "dataCostituzione")),
      });

      if (buffer.length >= BATCH) {
        parser.pause();
        flush().then(() => parser.resume()).catch(reject);
      }
    });
    parser.on("end", () => flush().then(resolve).catch(reject));
    parser.on("error", reject);
  });

  console.log(`   ✔ inseriti ${inserted}, saltati ${skipped} (mancanti/duplicati)`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Uso: npm run import-runts -- <file.csv>");
    process.exit(1);
  }
  for (const f of args) await importFile(path.resolve(f));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
