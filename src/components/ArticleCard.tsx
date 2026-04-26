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
  publishedIn,
}: ArticleCardProps) {
  const summary = lang === "it" ? article.summaryIt : article.summaryEn;
  const excerpt = summary.slice(0, 250) + (summary.length > 250 ? "..." : "");

  return (
    <article
      className="py-6 first:pt-0"
      style={{ borderBottom: "1px solid var(--color-border)" }}
    >
      <div className="flex items-center gap-2 text-xs mb-2" style={{ color: "var(--color-ink-light)" }}>
        <span>{article.journal}</span>
        <span>·</span>
        <time>{article.pubDate}</time>
      </div>

      <h2 className="text-lg sm:text-xl mb-2" style={{ fontFamily: "'Georgia', serif" }}>
        <Link
          href={`/${lang}/articles/${article.slug}`}
          className="hover:underline"
          style={{ color: "var(--color-ink)" }}
        >
          {article.title.replace(/<[^>]+>/g, "")}
        </Link>
      </h2>

      <p className="text-sm mb-2" style={{ color: "var(--color-ink-light)" }}>
        {article.authors.slice(0, 3).join(", ")}
        {article.authors.length > 3 ? " et al." : ""}
      </p>

      <p className="text-sm mb-3 article-summary" style={{ color: "var(--color-ink-light)" }}>
        {excerpt}
      </p>

      <Link
        href={`/${lang}/articles/${article.slug}`}
        className="text-sm font-medium"
      >
        {readMore} →
      </Link>
    </article>
  );
}
