import type { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Osteoperiology — Periodontal & Implant Literature",
    template: "%s | Osteoperiology",
  },
  description:
    "Weekly curated summaries of open access articles in periodontology and dental implantology — Dr. Ernesto Bruschi",
  authors: [{ name: "Dr. Ernesto Bruschi", url: "https://orcid.org/0000-0002-4773-5384" }],
  creator: "Dr. Ernesto Bruschi",
  publisher: "Osteoperiology",
  keywords: [
    "periodontology", "parodontologia",
    "dental implants", "implantologia dentale",
    "osseointegration", "osteointegrazione",
    "bone regeneration", "rigenerazione ossea",
    "peri-implantitis", "perimplantite",
    "guided tissue regeneration", "rigenerazione tissutale guidata",
    "oral surgery", "chirurgia orale",
    "open access", "evidence-based dentistry",
  ],
  alternates: {
    types: {
      "application/rss+xml": `${SITE_URL}/api/feed`,
    },
    canonical: SITE_URL,
    languages: {
      en: `${SITE_URL}/en`,
      it: `${SITE_URL}/it`,
    },
  },
  openGraph: {
    title: "Osteoperiology",
    description:
      "Weekly curated summaries of open access articles in periodontology and dental implantology",
    type: "website",
    siteName: "Osteoperiology",
    url: SITE_URL,
    locale: "en_US",
    alternateLocale: "it_IT",
  },
  twitter: {
    card: "summary",
    title: "Osteoperiology",
    description:
      "Weekly curated summaries of open access articles in periodontology and dental implantology",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
    },
  },
  verification: {
    google: "P-TyqXVijEz-GwPYFRRAas17YSe5Zkc97sEqz7ofDbM",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
