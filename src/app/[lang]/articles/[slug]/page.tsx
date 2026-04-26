import type { Lang } from "@/lib/types";
import { getDictionary } from "@/i18n/config";
import { getArticleBySlug } from "@/lib/storage";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 3600;

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
      <Link
        href={`/${lang}`}
        className="text-sm mb-6 inline-block"
      >
        ← {dict.article.backToList}
      </Link>

      <div
        className="flex items-center gap-2 text-xs mb-3"
        style={{ color: "var(--color-ink-light)" }}
      >
        <span>{article.journal}</span>
        <span>·</span>
        <time>{article.pubDate}</time>
      </div>

      <h1
        className="text-2xl sm:text-3xl mb-4"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        {article.title.replace(/<[^>]+>/g, "")}
      </h1>

      <p className="text-sm mb-6" style={{ color: "var(--color-ink-light)" }}>
        {article.authors.join(", ")}
      </p>

      <div
        className="article-summary mb-8"
        style={{ maxWidth: "65ch" }}
      >
        {summary.split("\n").map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      <div
        className="text-xs p-4 rounded mb-8"
        style={{
          backgroundColor: "var(--color-bone-dark)",
          color: "var(--color-ink-light)",
          fontStyle: "italic",
        }}
      >
        {dict.article.aiDisclaimer}
      </div>

      <div className="flex flex-wrap gap-3">
        {article.doi && (
          <a
            href={`https://doi.org/${article.doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm px-4 py-2 rounded font-medium"
            style={{
              backgroundColor: "var(--color-accent)",
              color: "#fff",
            }}
          >
            {dict.article.originalArticle} ↗
          </a>
        )}
        <a
          href={`https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm px-4 py-2 rounded font-medium"
          style={{
            border: "1px solid var(--color-border)",
            color: "var(--color-ink-light)",
          }}
        >
          {dict.article.pubmed} ↗
        </a>
      </div>
    </div>
  );
}
