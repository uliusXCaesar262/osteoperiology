"use client";

import { useState, useMemo } from "react";
import type { Article, Lang } from "@/lib/types";
import ArticleCard from "./ArticleCard";

interface SearchableArticleListProps {
  articles: Article[];
  lang: Lang;
  dict: {
    searchPlaceholder: string;
    searchNoResults: string;
    searchResultCount: string;
    readMore: string;
    publishedIn: string;
  };
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export default function SearchableArticleList({
  articles,
  lang,
  dict,
}: SearchableArticleListProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return articles;

    const terms = q.split(/\s+/).filter(Boolean);

    return articles.filter((article) => {
      const title = normalize(
        lang === "it" && article.titleIt ? article.titleIt : article.title
      );
      const summary = normalize(
        lang === "it" ? article.summaryIt : article.summaryEn
      );
      const authors = normalize(article.authors.join(" "));
      const journal = normalize(article.journal);
      const haystack = `${title} ${authors} ${journal} ${summary}`;

      return terms.every((term) => haystack.includes(term));
    });
  }, [articles, query, lang]);

  const showCount = query.trim().length > 0;

  return (
    <div>
      <div className="search-container mb-8">
        <div className="search-input-wrapper">
          <svg
            className="search-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            className="search-input"
            placeholder={dict.searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={dict.searchPlaceholder}
          />
          {query && (
            <button
              className="search-clear"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          )}
        </div>
        {showCount && (
          <p className="search-result-count">
            {dict.searchResultCount.replace(
              "{{count}}",
              String(filtered.length)
            )}
          </p>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state text-center">
          <div className="text-4xl mb-4">🔍</div>
          <p
            className="text-sm"
            style={{ color: "var(--color-ink-secondary)" }}
          >
            {dict.searchNoResults}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((article) => (
            <ArticleCard
              key={article.pmid}
              article={article}
              lang={lang}
              readMore={dict.readMore}
              publishedIn={dict.publishedIn}
            />
          ))}
        </div>
      )}
    </div>
  );
}
