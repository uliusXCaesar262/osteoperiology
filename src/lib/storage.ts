import { Article, ArticlesStore } from "./types";
import fs from "fs";
import path from "path";

const ARTICLES_PATH = path.join(process.cwd(), "content", "articles.json");

export function getArticlesStore(): ArticlesStore {
  try {
    const raw = fs.readFileSync(ARTICLES_PATH, "utf-8");
    return JSON.parse(raw) as ArticlesStore;
  } catch {
    return { lastUpdated: "", articles: [] };
  }
}

export function saveArticlesStore(store: ArticlesStore): void {
  fs.writeFileSync(ARTICLES_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export function addArticles(newArticles: Article[]): void {
  const store = getArticlesStore();

  const existingPmids = new Set(store.articles.map((a) => a.pmid));
  const unique = newArticles.filter((a) => !existingPmids.has(a.pmid));

  if (unique.length === 0) return;

  store.articles = [...unique, ...store.articles];
  store.lastUpdated = new Date().toISOString();

  saveArticlesStore(store);
}

export function getRecentArticles(
  limit: number = 20,
  offset: number = 0
): { articles: Article[]; total: number } {
  const store = getArticlesStore();
  const total = store.articles.length;
  const articles = store.articles.slice(offset, offset + limit);
  return { articles, total };
}

export function getArticleBySlug(slug: string): Article | null {
  const store = getArticlesStore();
  return store.articles.find((a) => a.slug === slug) || null;
}

export function getAllSlugs(): string[] {
  const store = getArticlesStore();
  return store.articles.map((a) => a.slug);
}

/**
 * Related articles for a given slug, ranked by shared tags, then same
 * journal, then recency (the store is newest-first, so a stable sort keeps
 * recency as the tiebreak). Always returns up to `limit` items — when there
 * is no topical overlap it falls back to the most recent articles, so an
 * article is never an internal dead-end. Build-time only (static export safe).
 */
export function getRelatedArticles(slug: string, limit: number = 4): Article[] {
  const store = getArticlesStore();
  const current = store.articles.find((a) => a.slug === slug);
  if (!current) return [];

  const currentTags = new Set(
    [...(current.tagsEn || []), ...(current.tagsIt || [])].map((t) =>
      t.toLowerCase()
    )
  );

  const scored = store.articles
    .filter((a) => a.slug !== slug)
    .map((a) => {
      const tags = [...(a.tagsEn || []), ...(a.tagsIt || [])].map((t) =>
        t.toLowerCase()
      );
      const sharedTags = tags.filter((t) => currentTags.has(t)).length;
      const sameJournal = a.journal === current.journal ? 1 : 0;
      return { a, score: sharedTags * 10 + sameJournal };
    });

  scored.sort((x, y) => y.score - x.score);
  return scored.slice(0, limit).map((s) => s.a);
}
