import type { Metadata } from "next";
import type { Lang } from "@/lib/types";
import { getDictionary } from "@/i18n/config";
import { getArticleBySlug, getAllSlugs } from "@/lib/storage";
import { languages } from "@/i18n/config";
import Link from "next/link";
import { SITE_URL } from "@/lib/constants";

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

  const plainTitle = article.title.replace(/<[^>]+>/g, "");
  const metaTitle = lang === "it" && article.titleIt ? article.titleIt : plainTitle;
  const summary = lang === "it" ? article.summaryIt : article.summaryEn;
  const description = summary.slice(0, 160).replace(/\s+\S*$/, "") + "…";
  const otherLang = lang === "en" ? "it" : "en";
  const url = `${SITE_URL}/${lang}/articles/${slug}`;

  return {
    title: metaTitle,
    description,
    authors: article.authors.slice(0, 5).map((name) => ({ name })),
    alternates: {
      canonical: url,
      languages: {
        [lang]: url,
        [otherLang]: `${SITE_URL}/${otherLang}/articles/${slug}`,
      },
    },
    openGraph: {
      title: plainTitle,
      description,
      url,
      type: "article",
      locale: lang === "it" ? "it_IT" : "en_US",
      alternateLocale: lang === "it" ? "en_US" : "it_IT",
      publishedTime: article.pubDate,
      authors: article.authors.slice(0, 5),
      tags: [article.journal, "periodontology", "dental implants", "open access"],
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
  const plainTitle = article.title.replace(/<[^>]+>/g, "");
  const displayTitle = lang === "it" && article.titleIt ? article.titleIt : plainTitle;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: plainTitle,
    author: article.authors.map((name) => ({
      "@type": "Person",
      name,
    })),
    datePublished: article.pubDate,
    publisher: {
      "@type": "Organization",
      name: article.journal,
    },
    description: summary.slice(0, 300),
    url: article.doi ? `https://doi.org/${article.doi}` : `https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`,
    isAccessibleForFree: true,
    inLanguage: lang,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/${lang}/articles/${article.slug}`,
    },
  };

  return (
    <div className="max-w-3xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link href={`/${lang}`} className="back-link mb-8 inline-block">
        ← {dict.article.backToList}
      </Link>

      <header className="flex flex-wrap items-center gap-2 mb-4">
        <span className="journal-badge">{article.journal}</span>
        <time
          dateTime={article.pubDate}
          className="text-xs"
          style={{ color: "var(--color-ink-muted)" }}
        >
          {article.pubDate}
        </time>
      </header>

      <h1 className="text-2xl sm:text-4xl mb-4 font-semibold leading-tight">
        {displayTitle}
      </h1>
      {lang === "it" && article.titleIt && (
        <p className="text-xs mb-4 italic" style={{ color: "var(--color-ink-muted)" }}>
          {plainTitle}
        </p>
      )}

      <p className="text-sm mb-8 font-medium" style={{ color: "var(--color-ink-muted)" }}>
        {article.authors.join(", ")}
      </p>

      <div className="article-summary mb-8" style={{ maxWidth: "65ch" }}>
        {summary.split("\n").map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

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
    </div>
  );
}
