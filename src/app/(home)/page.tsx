import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/constants";
import { ogImages } from "@/lib/seo";
import { displayTitle } from "@/lib/article";
import { getRecentArticles } from "@/lib/storage";
import SiteWordmark from "@/components/SiteWordmark";

/**
 * Root landing page (`/`).
 *
 * Statically rendered with real, crawlable content — NOT a client-side
 * redirect. Search engines reach `/` and find indexable HTML, a clear
 * bilingual entry point, hreflang alternates, and internal links into the
 * site (language hubs + latest articles). Humans pick their language once.
 */
export const metadata: Metadata = {
  title:
    "Osteoperionews — Ricerca clinica in Parodontologia e Implantologia",
  description:
    "Rassegna settimanale di studi peer-reviewed open access in parodontologia, implantologia e rigenerazione ossea — a weekly digest of open-access periodontology and dental-implant research. A cura del Dr. Ernesto Bruschi.",
  alternates: {
    canonical: `${SITE_URL}/`,
    languages: {
      it: `${SITE_URL}/it`,
      en: `${SITE_URL}/en`,
      "x-default": `${SITE_URL}/en`,
    },
  },
  openGraph: {
    title: "Osteoperionews",
    description:
      "Ricerca clinica open access in parodontologia e implantologia — curated open-access periodontology and dental-implant research.",
    type: "website",
    url: `${SITE_URL}/`,
    locale: "it_IT",
    alternateLocale: "en_US",
    images: ogImages,
  },
};

export default function RootLandingPage() {
  const { articles } = getRecentArticles(6);

  return (
    <main id="main" className="max-w-3xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
      {/* Wordmark */}
      <SiteWordmark lang="it" size="hero" linked={false} />

      {/* Bilingual value proposition — Italian prominent (primary audience) */}
      <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4 mt-6">
        Ricerca clinica in parodontologia e implantologia
      </h1>
      <p
        className="text-base sm:text-lg leading-relaxed mb-2"
        style={{ color: "var(--color-ink-secondary)" }}
      >
        Rassegna settimanale di studi peer-reviewed open access in
        parodontologia, implantologia dentale e rigenerazione ossea, selezionati
        e riassunti dal Dr.&nbsp;Ernesto Bruschi.
      </p>
      <p
        className="text-sm sm:text-base leading-relaxed mb-10"
        style={{ color: "var(--color-ink-muted)" }}
        lang="en"
      >
        A weekly digest of peer-reviewed, open-access research in periodontology,
        dental implantology and bone regeneration.
      </p>

      {/* Language entry points */}
      <div className="flex flex-col sm:flex-row gap-3 mb-14">
        <Link
          href="/it"
          className="inline-flex items-center justify-center px-6 py-3 rounded-md text-base font-semibold transition-colors hover:brightness-110"
          style={{ background: "var(--color-accent)", color: "#ffffff" }}
        >
          Leggi in italiano &rarr;
        </Link>
        <Link
          href="/en"
          className="inline-flex items-center justify-center px-6 py-3 rounded-md text-base font-medium transition-colors"
          style={{
            border: "1px solid var(--color-border-strong)",
            color: "var(--color-ink-secondary)",
          }}
          hrefLang="en"
        >
          Read in English &rarr;
        </Link>
      </div>

      {/* Latest articles teaser — gives `/` real internal links and freshness */}
      {articles.length > 0 && (
        <section aria-labelledby="latest-heading">
          <h2 id="latest-heading" className="text-xl sm:text-2xl font-semibold mb-6">
            Ultimi articoli
          </h2>
          <ul className="flex flex-col gap-5">
            {articles.map((a) => (
              <li
                key={a.pmid}
                className="pb-5"
                style={{ borderBottom: "1px solid var(--color-divider)" }}
              >
                <Link href={`/it/articles/${a.slug}`} className="block group">
                  <p
                    className="text-[11px] font-semibold tracking-wide uppercase mb-1"
                    style={{ color: "var(--color-accent)" }}
                  >
                    {a.journal}
                  </p>
                  <p
                    className="text-base sm:text-lg leading-snug font-medium"
                    style={{ color: "var(--color-ink)" }}
                  >
                    {displayTitle(a, "it")}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Link
              href="/it/articles"
              className="text-sm font-medium"
              style={{ color: "var(--color-accent)" }}
            >
              Tutti gli articoli &rarr;
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
