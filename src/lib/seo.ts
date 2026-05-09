import type { Metadata } from "next";

export const SITE_NAME = "MondoEts";
export const SITE_URL = process.env.SITE_URL ?? "https://mondoets.it";
export const SITE_DESCRIPTION =
  "Il portale del terzo settore italiano. Cerca tra tutti gli ETS iscritti al RUNTS, scarica modelli e modulistica, usa calcolatori e tool documentali per la tua APS, ODV o impresa sociale.";

export function buildMetadata(opts: {
  title: string;
  description?: string;
  path?: string;
  noindex?: boolean;
  ogImage?: string;
}): Metadata {
  const { title, description, path = "/", noindex, ogImage } = opts;
  const url = new URL(path, SITE_URL).toString();
  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
  const desc = description ?? SITE_DESCRIPTION;

  return {
    title: fullTitle,
    description: desc,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "it_IT",
      url,
      siteName: SITE_NAME,
      title: fullTitle,
      description: desc,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}
