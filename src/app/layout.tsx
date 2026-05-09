import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Il portale del terzo settore italiano`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "Sesto Potere APS" }],
  keywords: [
    "terzo settore",
    "ETS",
    "RUNTS",
    "APS",
    "ODV",
    "impresa sociale",
    "associazione di promozione sociale",
    "organizzazione di volontariato",
    "non profit",
  ],
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
