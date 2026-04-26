import type { Lang } from "@/lib/types";
import { getDictionary } from "@/i18n/config";
import { getArticleBySlug } from "@/lib/storage";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 0;

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang: rawLang, slug } = await params;
  const lang = rawLang as Lang;
  const dict = await getDictionary(lang);
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const summary = lang === "it" ? article.summaryIt : article.summaryEn;

  return (
    <div className="max-w-3xl">
      <Link href={`/${lang}`} className="back-link mb-8 inline-block">
        ← {dict.article.backToList}
      </Link>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="journal-badge">{article.journal}</span>
        <time className="text-xs" style={{ color: "var(--color-ink-muted)" }}>
          {article.pubDate}
        </time>
      </div>

      <h1 className="text-2xl sm:text-4xl mb-4 font-semibold leading-tight">
        {article.title.replace(/<[^>]+>/g, "")}
      </h1>

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
