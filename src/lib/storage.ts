import { put, list, del } from "@vercel/blob";
import { Article, ArticlesStore } from "./types";

const BLOB_STORE_KEY = "articles/store.json";

export async function getArticlesStore(): Promise<ArticlesStore> {
  try {
    const { blobs } = await list({ prefix: "articles/" });
    const storeBlob = blobs.find((b) => b.pathname === BLOB_STORE_KEY);

    if (!storeBlob) {
      return { lastUpdated: "", articles: [] };
    }

    const res = await fetch(storeBlob.url);
    const data: ArticlesStore = await res.json();
    return data;
  } catch {
    return { lastUpdated: "", articles: [] };
  }
}

export async function saveArticlesStore(
  store: ArticlesStore
): Promise<string> {
  // Delete existing blob if present
  try {
    const { blobs } = await list({ prefix: "articles/" });
    const existing = blobs.find((b) => b.pathname === BLOB_STORE_KEY);
    if (existing) {
      await del(existing.url);
    }
  } catch {
    // Ignore deletion errors
  }

  const blob = await put(
    BLOB_STORE_KEY,
    JSON.stringify(store, null, 2),
    {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    }
  );

  return blob.url;
}

export async function addArticles(newArticles: Article[]): Promise<void> {
  const store = await getArticlesStore();

  // Deduplicate by PMID
  const existingPmids = new Set(store.articles.map((a) => a.pmid));
  const unique = newArticles.filter((a) => !existingPmids.has(a.pmid));

  if (unique.length === 0) return;

  store.articles = [...unique, ...store.articles]; // Newest first
  store.lastUpdated = new Date().toISOString();

  await saveArticlesStore(store);
}

export async function getRecentArticles(
  limit: number = 20,
  offset: number = 0
): Promise<{ articles: Article[]; total: number }> {
  const store = await getArticlesStore();
  const total = store.articles.length;
  const articles = store.articles.slice(offset, offset + limit);
  return { articles, total };
}

export async function getArticleBySlug(
  slug: string
): Promise<Article | null> {
  const store = await getArticlesStore();
  return store.articles.find((a) => a.slug === slug) || null;
}
