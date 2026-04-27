import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import { SITE_URL } from "@/lib/constants";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  display: "swap",
});

export const metadata: Metadata = {
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${inter.variable} ${lora.variable}`}>
      <head>
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Osteoperionews (IT)"
          href={`${SITE_URL}/feed-it.xml`}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
