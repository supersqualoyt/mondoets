import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { SITE_URL } from "@/lib/seo";
import { SEZIONI_LIST } from "@/lib/sezioni";
import { slugify } from "@/lib/format";

// Next.js limita a 50000 URL per file. Con ~120k ETS serviranno sitemap multipli.
// Per ora unico file (statiche + sezioni + regioni). Per ETS si aggiungerà /sitemap-ets-N.xml dopo import.

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticUrls: MetadataRoute.Sitemap = [
    "", "/cerca", "/sezione", "/regione", "/strumenti", "/calcolatori", "/modelli",
    "/guide", "/diventa-socio", "/chi-siamo", "/contatti", "/privacy",
  ].map((p) => ({ url: `${SITE_URL}${p || "/"}`, lastModified: now, priority: p === "" ? 1 : 0.7 }));

  const sezioniUrls: MetadataRoute.Sitemap = SEZIONI_LIST.map((s) => ({
    url: `${SITE_URL}/sezione/${s.slug}`,
    lastModified: now,
    priority: 0.8,
  }));

  let regioniUrls: MetadataRoute.Sitemap = [];
  try {
    const regs = await prisma.$queryRaw<Array<{ regione: string }>>`
      SELECT DISTINCT regione FROM ets WHERE regione IS NOT NULL
    `;
    regioniUrls = regs.map((r) => ({
      url: `${SITE_URL}/regione/${slugify(r.regione)}`,
      lastModified: now,
      priority: 0.7,
    }));
  } catch {
    // DB non pronto
  }

  return [...staticUrls, ...sezioniUrls, ...regioniUrls];
}
