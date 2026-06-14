import type { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";

/**
 * Base site metadata shared by every root layout (`(home)` and `[lang]`).
 * Kept in one place so the multiple-root-layout setup cannot drift:
 * metadataBase, title template, default keywords, robots, Google
 * verification, OpenGraph/Twitter defaults and the RSS alternate all live
 * here. Per-page metadata (canonical, hreflang, localized title) is layered
 * on top by individual pages.
 */
export const baseMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Osteoperionews — Periodontal & Implant Literature",
    template: "%s | Osteoperionews",
  },
  description:
    "Weekly curated summaries of open access articles in periodontology and dental implantology — Dr. Ernesto Bruschi",
  authors: [{ name: "Dr. Ernesto Bruschi", url: "https://orcid.org/0000-0002-4773-5384" }],
  creator: "Dr. Ernesto Bruschi",
  publisher: "Osteoperionews",
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
      "application/rss+xml": `${SITE_URL}/feed.xml`,
    },
    languages: {
      en: `${SITE_URL}/en`,
      it: `${SITE_URL}/it`,
      "x-default": `${SITE_URL}/en`,
    },
  },
  openGraph: {
    title: "Osteoperionews",
    description:
      "Weekly curated summaries of open access articles in periodontology and dental implantology",
    type: "website",
    siteName: "Osteoperionews",
    url: SITE_URL,
    locale: "en_US",
    alternateLocale: "it_IT",
    images: [
      {
        url: `${SITE_URL}/og-default.png`,
        width: 1200,
        height: 630,
        alt: "Osteoperionews — Curated periodontal and implant literature",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Osteoperionews",
    description:
      "Weekly curated summaries of open access articles in periodontology and dental implantology",
    images: [`${SITE_URL}/og-default.png`],
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

/** schema.org WebSite + Person graph, injected by each root layout. */
export const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      "name": "Osteoperionews",
      "url": SITE_URL,
      "description":
        "Weekly curated summaries of open-access research in periodontology, dental implantology, and peri-implant medicine.",
      "inLanguage": ["en", "it"],
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${SITE_URL}/en?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#author`,
      "name": "Dr. Ernesto Bruschi",
      "jobTitle": "Periodontist, Implantologist, Oral Surgeon",
      "sameAs": [
        "https://orcid.org/0000-0002-4773-5384",
        "https://bonebenders.com",
      ],
    },
  ],
};
