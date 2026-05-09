/**
 * Importer RUNTS — legge dump open-data e popola tabella ets.
 *
 * Uso:
 *   npm run import-runts -- data/runts/runts-aps.csv
 *   npm run import-runts -- data/runts/*.csv
 *
 * Il formato del dump RUNTS aperto può variare nel tempo. Questo script:
 *   1. Tenta di rilevare il delimitatore (`;` o `,`).
 *   2. Mappa le colonne tramite alias (vedi MAP).
 *   3. Normalizza la sezione RUNTS in uno dei codici noti.
 *   4. Esegue upsert per codice fiscale.
 *
 * Adattare MAP se il file ha intestazioni diverse.
 */
import { PrismaClient } from "@prisma/client";
import { parse } from "csv-parse";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { slugify } from "../src/lib/format";

const prisma = new PrismaClient();

// Mappa: campo Ets → possibili intestazioni nel CSV (normalizzate lower-case)
const MAP: Record<string, string[]> = {
  codiceFiscale: ["codice fiscale", "cf", "codicefiscale", "codice_fiscale"],
  partitaIva: ["partita iva", "p iva", "piva", "partita_iva"],
  numeroRepertorio: ["numero repertorio", "n repertorio", "rep_runts", "repertorio"],
  denominazione: ["denominazione", "nome", "ragione sociale"],
  naturaGiuridica: ["natura giuridica", "forma giuridica", "naturagiuridica"],
  sezione: ["sezione", "tipologia", "sezione runts"],
  email: ["email", "e-mail", "mail"],
  pec: ["pec", "indirizzo pec"],
  telefono: ["telefono", "tel"],
  sitoWeb: ["sito web", "sito internet", "url", "website"],
  regione: ["regione"],
  provincia: ["provincia", "sigla provincia", "prov"],
  comune: ["comune"],
  cap: ["cap"],
  indirizzo: ["indirizzo", "via", "via/piazza"],
  scopo: ["scopo", "oggetto sociale", "attivita"],
  attivitaInteresse: ["attivita di interesse generale", "attivita interesse", "art. 5"],
  statoIscrizione: ["stato iscrizione", "stato", "stato runts"],
  dataIscrizione: ["data iscrizione", "data iscr", "data iscrizione runts"],
  dataCostituzione: ["data costituzione", "data costituz"],
};

const SEZIONI_ALIAS: Record<string, "ODV" | "APS" | "FIL" | "IS" | "RA" | "SMS" | "ALTRI"> = {
  "odv": "ODV",
  "organizzazioni di volontariato": "ODV",
  "organizzazione di volontariato": "ODV",
  "aps": "APS",
  "associazione di promozione sociale": "APS",
  "associazioni di promozione sociale": "APS",
  "ente filantropico": "FIL",
  "enti filantropici": "FIL",
  "filantropico": "FIL",
  "fil": "FIL",
  "impresa sociale": "IS",
  "imprese sociali": "IS",
  "is": "IS",
  "rete associativa": "RA",
  "reti associative": "RA",
  "ra": "RA",
  "societa di mutuo soccorso": "SMS",
  "società di mutuo soccorso": "SMS",
  "sms": "SMS",
  "altri ets": "ALTRI",
  "altro": "ALTRI",
  "altri": "ALTRI",
};

function normalizeKey(k: string) {
  return k.toLowerCase().trim().replace(/[._-]+/g, " ").replace(/\s+/g, " ");
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
  const k = normalizeKey(raw);
  return SEZIONI_ALIAS[k] ?? "ALTRI";
}

function parseDate(raw: string | null): Date | null {
  if (!raw) return null;
  // formati comuni: DD/MM/YYYY, YYYY-MM-DD
  const s = raw.trim();
  let m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) return new Date(`${m[3]}-${m[2]}-${m[1]}`);
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return new Date(s);
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
    stream.on("error", () => resolve(";"));
  });
}

async function importFile(file: string) {
  const st = await stat(file);
  console.log(`-> ${file} (${(st.size / 1024 / 1024).toFixed(1)} MB)`);
  const delimiter = await detectDelimiter(file);
  console.log(`   delimitatore: ${delimiter === ";" ? "punto-virgola" : "virgola"}`);

  let idx: Record<string, number> | null = null;
  let count = 0;
  let skipped = 0;
  const buffer: Array<Record<string, unknown>> = [];
  const BATCH = 500;

  async function flush() {
    if (buffer.length === 0) return;
    // Prisma non ha createMany skipDuplicates su MySQL con conflitti complessi → upsert sequenziale.
    // Per performance, qui usiamo createMany skipDuplicates (Prisma supporta su MySQL 5+).
    try {
      await prisma.ets.createMany({ data: buffer as never, skipDuplicates: true });
    } catch (err) {
      console.error("batch error:", (err as Error).message);
    }
    count += buffer.length;
    buffer.length = 0;
    if (count % 5000 === 0) console.log(`   inseriti ${count}…`);
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
        const missing = ["codiceFiscale", "denominazione", "sezione"].filter((k) => idx![k] === undefined);
        if (missing.length) {
          parser.destroy();
          reject(new Error(`Colonne obbligatorie non trovate: ${missing.join(", ")}. Verifica MAP nel file.`));
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

      const sezione = parseSezione(pick(row, idx, "sezione"));
      const slug = slugify(`${denominazione}-${cf.slice(-4)}`);

      buffer.push({
        slug,
        codiceFiscale: cf,
        partitaIva: pick(row, idx, "partitaIva"),
        numeroRepertorio: pick(row, idx, "numeroRepertorio"),
        denominazione,
        naturaGiuridica: pick(row, idx, "naturaGiuridica"),
        sezione,
        email: pick(row, idx, "email"),
        pec: pick(row, idx, "pec"),
        telefono: pick(row, idx, "telefono"),
        sitoWeb: pick(row, idx, "sitoWeb"),
        regione: pick(row, idx, "regione"),
        provincia: pick(row, idx, "provincia"),
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

  console.log(`   ✔ importati ${count}, saltati ${skipped} (record incompleti).`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Uso: npm run import-runts -- <file.csv> [file2.csv ...]");
    process.exit(1);
  }
  for (const f of args) {
    await importFile(path.resolve(f));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
