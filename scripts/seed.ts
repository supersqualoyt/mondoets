import { PrismaClient } from "@prisma/client";
import { slugify } from "../src/lib/format";

const prisma = new PrismaClient();

const dummyEts: Array<{
  codiceFiscale: string;
  denominazione: string;
  sezione: "ODV" | "APS" | "FIL" | "IS" | "RA" | "SMS" | "ALTRI";
  naturaGiuridica?: string;
  email?: string;
  pec?: string;
  sitoWeb?: string;
  regione: string;
  provincia: string;
  comune: string;
  cap?: string;
  indirizzo?: string;
  scopo?: string;
}> = [
  {
    codiceFiscale: "97000000001",
    denominazione: "Sesto Potere APS",
    sezione: "APS",
    naturaGiuridica: "Associazione riconosciuta",
    email: "info@sestopotere.it",
    regione: "Lazio",
    provincia: "RM",
    comune: "Roma",
    scopo: "Promuovere l'accesso alle tecnologie digitali per il terzo settore italiano.",
  },
  {
    codiceFiscale: "97000000002",
    denominazione: "Volontari del Quartiere ODV",
    sezione: "ODV",
    naturaGiuridica: "Associazione non riconosciuta",
    regione: "Lombardia",
    provincia: "MI",
    comune: "Milano",
  },
  {
    codiceFiscale: "97000000003",
    denominazione: "Cooperativa Sociale Solidale",
    sezione: "IS",
    naturaGiuridica: "Cooperativa sociale",
    regione: "Emilia-Romagna",
    provincia: "BO",
    comune: "Bologna",
  },
  {
    codiceFiscale: "97000000004",
    denominazione: "Fondazione Filantropica Italia",
    sezione: "FIL",
    naturaGiuridica: "Fondazione",
    regione: "Toscana",
    provincia: "FI",
    comune: "Firenze",
  },
  {
    codiceFiscale: "97000000005",
    denominazione: "Rete Nazionale Terzo Settore",
    sezione: "RA",
    naturaGiuridica: "Rete associativa",
    regione: "Lazio",
    provincia: "RM",
    comune: "Roma",
  },
  {
    codiceFiscale: "97000000006",
    denominazione: "Società Operaia di Mutuo Soccorso Torino",
    sezione: "SMS",
    naturaGiuridica: "Società di mutuo soccorso",
    regione: "Piemonte",
    provincia: "TO",
    comune: "Torino",
  },
  {
    codiceFiscale: "97000000007",
    denominazione: "Insieme per i Bambini APS",
    sezione: "APS",
    regione: "Campania",
    provincia: "NA",
    comune: "Napoli",
  },
  {
    codiceFiscale: "97000000008",
    denominazione: "Volontari Protezione Civile Sicilia ODV",
    sezione: "ODV",
    regione: "Sicilia",
    provincia: "PA",
    comune: "Palermo",
  },
  {
    codiceFiscale: "97000000009",
    denominazione: "Centro Studi Terzo Settore",
    sezione: "ALTRI",
    regione: "Veneto",
    provincia: "VE",
    comune: "Venezia",
  },
  {
    codiceFiscale: "97000000010",
    denominazione: "Cooperativa Inclusione Lavoro",
    sezione: "IS",
    naturaGiuridica: "Cooperativa sociale di tipo B",
    regione: "Puglia",
    provincia: "BA",
    comune: "Bari",
  },
];

async function main() {
  console.log("Seed dummy ETS...");
  for (const e of dummyEts) {
    const slug = slugify(`${e.denominazione}-${e.codiceFiscale.slice(-4)}`);
    await prisma.ets.upsert({
      where: { codiceFiscale: e.codiceFiscale },
      update: {},
      create: {
        slug,
        codiceFiscale: e.codiceFiscale,
        denominazione: e.denominazione,
        sezione: e.sezione,
        naturaGiuridica: e.naturaGiuridica,
        email: e.email,
        pec: e.pec,
        sitoWeb: e.sitoWeb,
        regione: e.regione,
        provincia: e.provincia,
        comune: e.comune,
        cap: e.cap,
        indirizzo: e.indirizzo,
        scopo: e.scopo,
        statoIscrizione: "ISCRITTO",
        dataIscrizione: new Date("2023-01-15"),
      },
    });
  }
  console.log(`OK: ${dummyEts.length} ETS dummy inseriti.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
