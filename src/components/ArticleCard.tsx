import Link from "next/link";
import type { Article, Lang } from "@/lib/types";

interface ArticleCardProps {
  article: Article;
  lang: Lang;
  readMore: string;
  publishedIn: string;
}

export default function ArticleCard({
  article,
  lang,
  readMore,
}: ArticleCardProps) {
  const summary = lang === "it" ? article.summaryIt : article.summaryEn;
  const excerpt = summary.slice(0, 220) + (summary.length > 220 ? "..." : "");

  return (
    <article className="article-card mb-4">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="journal-badge">{article.journal}</span>
        <time className="text-xs" style={{ color: "var(--color-ink-muted)" }}>
          {article.pubDate}
        </time>
      </div>

      <h2 className="text-lg sm:text-xl mb-2 font-semibold leading-snug">
        <Link
          href={`/${lang}/articles/${article.slug}`}
          className="hover:underline"
          style={{ color: "var(--color-ink)" }}
        >
          {article.title.replace(/<[^>]+>/g, "")}
        </Link>
      </h2>

      <p className="text-xs mb-3 font-medium" style={{ color: "var(--color-ink-muted)" }}>
        {article.authors.slice(0, 3).join(", ")}
        {article.authors.length > 3 ? " et al." : ""}
      </p>

      <p className="text-sm mb-4 leading-relaxed" style={{ color: "var(--color-ink-secondary)" }}>
        {excerpt}
      </p>

      <Link
        href={`/${lang}/articles/${article.slug}`}
        className="text-sm font-medium"
        style={{ color: "var(--color-accent)" }}
      >
        {readMore} →
      </Link>
    </article>
  );
}
