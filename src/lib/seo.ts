import type { Metadata } from "next";
import type { Lang } from "@/lib/types";
import { SITE_URL } from "@/lib/constants";

/**
 * Build a reciprocal, self-referencing hreflang/canonical set for a localized
 * page. Centralized so every [lang] page type emits an identical, consistent
 * map (en + it + x-default), fixing the earlier drift where about/privacy/
 * articles omitted x-default. `path` is the suffix after the locale segment,
 * e.g. "" for the hub, "/about", "/articles", "/articles/<slug>".
 */
export function buildAlternates(lang: Lang, path: string = "") {
  const other: Lang = lang === "en" ? "it" : "en";
  return {
    canonical: `${SITE_URL}/${lang}${path}`,
    languages: {
      [lang]: `${SITE_URL}/${lang}${path}`,
      [other]: `${SITE_URL}/${other}${path}`,
      "x-default": `${SITE_URL}/en${path}`,
    },
  };
}

/**
 * Shared OpenGraph/Twitter image. Exported so page-level metadata that
 * overrides `openGraph` can re-add it — Next.js does NOT deep-merge
 * `openGraph`, so a page that sets its own `openGraph` without `images`
 * would otherwise drop the preview image entirely.
 */
export const ogImages = [
  {
    url: `${SITE_URL}/og-default.png`,
    width: 1200,
    height: 630,
    alt: "Osteoperionews — Curated periodontal and implant literature",
  },
];

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
    images: ogImages,
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
      "publisher": { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#author`,
      "name": "Dr. Ernesto Bruschi",
      "jobTitle": "Periodontist, Implantologist, Oral Surgeon",
      "sameAs": [
        "https://orcid.org/0000-0002-4773-5384",
        "https://bonebenders.com",
        "https://www.instagram.com/bonebenders/",
        "https://www.linkedin.com/in/thelastbonebender/",
        "https://www.youtube.com/@bonebenders",
        "https://www.facebook.com/thelastbonebender",
      ],
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      "name": "Osteoperionews",
      "url": SITE_URL,
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/og-default.png`,
        "width": 1200,
        "height": 630,
      },
      "founder": { "@id": `${SITE_URL}/#author` },
      "sameAs": ["https://bonebenders.com"],
    },
  ],
};
