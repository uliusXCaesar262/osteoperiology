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
