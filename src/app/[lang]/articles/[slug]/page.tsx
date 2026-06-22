import type { Metadata } from "next";
import type { Lang } from "@/lib/types";
import { getDictionary } from "@/i18n/config";
import { getArticleBySlug, getAllSlugs, getRelatedArticles } from "@/lib/storage";
import Link from "next/link";
import { SITE_URL } from "@/lib/constants";
import { toIsoDate } from "@/lib/dates";
import { buildAlternates } from "@/lib/seo";
import { displayTitle, paperTitle, takeaways, whyItMatters } from "@/lib/article";

export const dynamicParams = false;

export function generateStaticParams() {
  const slugs = getAllSlugs();
  if (slugs.length === 0) {
    return [{ slug: "_placeholder" }];
  }
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};

  const plainTitle = paperTitle(article);
  const metaTitle = displayTitle(article, lang as Lang);
  const summary = lang === "it" ? article.summaryIt : article.summaryEn;
  // Prefer the purpose-written "why it matters" as the meta description when
  // present (a self-contained takeaway), else fall back to the summary opening.
  const descSource = whyItMatters(article, lang as Lang) || summary;
  const description = descSource.slice(0, 160).replace(/\s+\S*$/, "") + "…";
  const url = `${SITE_URL}/${lang}/articles/${slug}`;

  const metaTags = (lang === "it" ? article.tagsIt : article.tagsEn) || [];

  return {
    title: metaTitle,
    description,
    keywords: metaTags.length > 0 ? metaTags : undefined,
    authors: article.authors.slice(0, 5).map((name) => ({ name })),
    alternates: buildAlternates(lang as Lang, `/articles/${slug}`),
    openGraph: {
      title: metaTitle,
      description,
      url,
      type: "article",
      locale: lang === "it" ? "it_IT" : "en_US",
      alternateLocale: lang === "it" ? "en_US" : "it_IT",
      publishedTime: article.pubDate,
      authors: article.authors.slice(0, 5),
      tags: [
        article.journal,
        ...((lang === "it" ? article.tagsIt : article.tagsEn) || []),
        "open access",
      ],
      images: [
        {
          url: `${SITE_URL}/og-default.png`,
          width: 1200,
          height: 630,
          alt: plainTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description,
      images: [`${SITE_URL}/og-default.png`],
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang: rawLang, slug } = await params;
  const lang = rawLang as Lang;
  const dict = await getDictionary(lang);
  const article = getArticleBySlug(slug);

  if (!article) {
    return (
      <div className="empty-state text-center">
        <p style={{ color: "var(--color-ink-secondary)" }}>Article not found.</p>
        <Link href={`/${lang}`} className="btn-primary mt-4 inline-block">
          {dict.article.backToList}
        </Link>
      </div>
    );
  }

  const summary = lang === "it" ? article.summaryIt : article.summaryEn;
  const source = paperTitle(article);
  const title = displayTitle(article, lang);
  const tks = takeaways(article, lang);
  const why = whyItMatters(article, lang);
  const clinicalNote = lang === "it" ? article.clinicalNoteIt : undefined;
  const showSource = source !== title;

  const articleTags = (lang === "it" ? article.tagsIt : article.tagsEn) || [];
  const related = getRelatedArticles(slug, 4);

  const pageUrl = `${SITE_URL}/${lang}/articles/${article.slug}`;
  const sourceSameAs = [
    article.doi ? `https://doi.org/${article.doi}` : null,
    `https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`,
  ].filter(Boolean) as string[];
  const sourceIdentifiers = [
    article.doi
      ? { "@type": "PropertyValue", propertyID: "DOI", value: article.doi }
      : null,
    article.pmid
      ? { "@type": "PropertyValue", propertyID: "PMID", value: article.pmid }
      : null,
  ].filter(Boolean);

  // Model the PAGE as its own derivative work (authored/published by the site)
  // that *cites* the source paper via isBasedOn — instead of describing the
  // source paper itself. This keeps ownership of the original summaries with
  // the site, attributes them to the credentialed curator, and gives answer
  // engines an explicit, resolvable link to the primary source.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    "@id": pageUrl,
    url: pageUrl,
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    headline: title,
    description: summary.slice(0, 300),
    inLanguage: lang,
    datePublished: toIsoDate(article.pubDate),
    dateModified: toIsoDate(article.fetchedAt),
    isAccessibleForFree: true,
    image: `${SITE_URL}/og-default.png`,
    author: { "@id": `${SITE_URL}/#author` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    isPartOf: { "@id": `${SITE_URL}/#website` },
    ...(articleTags.length > 0 && {
      keywords: articleTags.join(", "),
      about: articleTags.map((t) => ({ "@type": "DefinedTerm", name: t })),
    }),
    isBasedOn: {
      "@type": "ScholarlyArticle",
      name: source,
      author: article.authors.map((name) => ({ "@type": "Person", name })),
      ...(article.doi && { url: `https://doi.org/${article.doi}` }),
      sameAs: sourceSameAs,
      identifier: sourceIdentifiers,
      isPartOf: { "@type": "Periodical", name: article.journal },
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: dict.nav.home, item: `${SITE_URL}/${lang}` },
      { "@type": "ListItem", position: 2, name: dict.nav.articles, item: `${SITE_URL}/${lang}/articles` },
      { "@type": "ListItem", position: 3, name: title, item: pageUrl },
    ],
  };

  return (
    <div className="max-w-3xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <nav aria-label="Breadcrumb" className="text-xs mb-6">
        <Link href={`/${lang}`} style={{ color: "var(--color-accent)" }}>
          {dict.nav.home}
        </Link>
        <span className="mx-1.5" style={{ color: "var(--color-ink-muted)" }}>
          /
        </span>
        <Link href={`/${lang}/articles`} style={{ color: "var(--color-accent)" }}>
          {dict.nav.articles}
        </Link>
      </nav>

      <header className="flex flex-wrap items-center gap-2 mb-4">
        <span className="journal-badge">{article.journal}</span>
        <time
          dateTime={toIsoDate(article.pubDate)}
          className="text-xs"
          style={{ color: "var(--color-ink-muted)" }}
        >
          {article.pubDate}
        </time>
      </header>

      <h1 className="text-2xl sm:text-4xl mb-3 font-semibold leading-tight">
        {title}
      </h1>

      <p className="text-sm mb-6 font-medium" style={{ color: "var(--color-ink-muted)" }}>
        {article.authors.join(", ")}
      </p>

      {showSource && (
        <p className="text-xs mb-8" style={{ color: "var(--color-ink-muted)" }}>
          {dict.article.sourceStudy}:{" "}
          <span className="italic">{source}</span> — {article.journal}
        </p>
      )}

      {tks.length > 0 && (
        <section className="mb-8" aria-labelledby="takeaways-heading">
          <h2
            id="takeaways-heading"
            className="text-sm font-semibold uppercase tracking-wide mb-3"
            style={{ color: "var(--color-accent)" }}
          >
            {dict.article.inBrief}
          </h2>
          <ul className="flex flex-col gap-2" style={{ maxWidth: "65ch" }}>
            {tks.map((t, i) => (
              <li
                key={i}
                className="flex gap-2 text-sm leading-relaxed"
                style={{ color: "var(--color-ink-secondary)" }}
              >
                <span style={{ color: "var(--color-accent)" }}>•</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="article-summary mb-8" style={{ maxWidth: "65ch" }}>
        {summary.split("\n").map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      {why && (
        <section className="mb-8" style={{ maxWidth: "65ch" }} aria-labelledby="why-heading">
          <h2 id="why-heading" className="text-lg font-semibold mb-2">
            {dict.article.whyItMatters}
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--color-ink-secondary)" }}
          >
            {why}
          </p>
        </section>
      )}

      {clinicalNote && (
        <aside
          className="mb-8 p-5 rounded-xl"
          style={{
            background: "var(--color-accent-subtle)",
            border: "1px solid var(--color-border)",
            maxWidth: "65ch",
          }}
          aria-labelledby="note-heading"
        >
          <h2
            id="note-heading"
            className="text-sm font-semibold mb-2"
            style={{ color: "var(--color-accent)" }}
          >
            {dict.article.clinicalNote}
          </h2>
          <p
            className="text-sm leading-relaxed italic"
            style={{ color: "var(--color-ink)" }}
          >
            {clinicalNote}
          </p>
        </aside>
      )}

      <div className="ai-disclaimer mb-8">
        {dict.article.aiDisclaimer}
      </div>

      <div className="flex flex-wrap gap-3">
        {article.doi && (
          <a
            href={`https://doi.org/${article.doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            {dict.article.originalArticle} ↗
          </a>
        )}
        <a
          href={`https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary"
        >
          {dict.article.pubmed} ↗
        </a>
      </div>

      {related.length > 0 && (
        <section
          className="mt-12 pt-8"
          style={{ borderTop: "1px solid var(--color-divider)" }}
          aria-labelledby="related-heading"
        >
          <h2 id="related-heading" className="text-lg font-semibold mb-4">
            {dict.article.related}
          </h2>
          <ul className="flex flex-col gap-4">
            {related.map((r) => {
              const rTitle = displayTitle(r, lang);
              return (
                <li key={r.pmid}>
                  <Link
                    href={`/${lang}/articles/${r.slug}`}
                    className="block group"
                  >
                    <span
                      className="block text-[11px] font-semibold tracking-wide uppercase mb-1"
                      style={{ color: "var(--color-accent)" }}
                    >
                      {r.journal}
                    </span>
                    <span
                      className="block text-base font-medium leading-snug group-hover:underline"
                      style={{ color: "var(--color-ink)" }}
                    >
                      {rTitle}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
