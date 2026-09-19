import fs from "fs";
import path from "path";
import type { Article, NewsItem } from "../src/lib/types";
import { buildMetaDescription } from "../src/lib/article";

const SITE_URL = "https://osteoperionews.bonebenders.com";
const ARTICLES_PATH = path.join(process.cwd(), "content", "articles.json");
const NEWS_PATH = path.join(process.cwd(), "content", "news.json");

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generateFeed(
  articles: Article[],
  lang: "en" | "it",
  filename: string,
) {
  const recent = articles.slice(0, 50);

  const isIt = lang === "it";
  const channelTitle = isIt ? "Osteoperionews (IT)" : "Osteoperionews";
  const channelDesc = isIt
    ? "Notizie curate dalla letteratura parodontale e implantare — Dr. Ernesto Bruschi"
    : "Curated news from the periodontal and implant literature — Dr. Ernesto Bruschi";

  const items = recent
    .map((a) => {
      const link = `${SITE_URL}/${lang}/articles/${a.slug}`;
      // Data della pagina (ingest): il feed deve essere cronologico e senza date future.
      const pubDate = new Date(a.fetchedAt).toUTCString();
      const editorial = isIt ? a.editorialTitleIt : a.editorialTitleEn;
      const title =
        editorial ||
        (isIt && a.titleIt ? a.titleIt : a.title.replace(/<[^>]+>/g, ""));
      const description = buildMetaDescription(a, lang);
      return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(description)}</description>
      <category>${escapeXml(a.journal)}</category>
    </item>`;
    })
    .join("\n");

  const lastBuild = recent.length > 0
    ? new Date(recent[0].fetchedAt).toUTCString()
    : new Date().toUTCString();

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${channelTitle}</title>
    <link>${SITE_URL}/${lang}</link>
    <description>${channelDesc}</description>
    <language>${lang}</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${SITE_URL}/${filename}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  const outputPath = path.join(process.cwd(), "public", filename);
  fs.writeFileSync(outputPath, rss, "utf-8");
  console.log(`[RSS] Generated ${filename} with ${recent.length} items.`);
}

function generateNewsFeed(
  newsItems: NewsItem[],
  lang: "en" | "it",
  filename: string,
) {
  const recent = newsItems.slice(0, 50);
  const isIt = lang === "it";
  const channelTitle = isIt
    ? "Osteoperionews — Notizie di settore (IT)"
    : "Osteoperionews — Society & guidelines (EN)";
  const channelDesc = isIt
    ? "Linee guida, consensus e comunicazioni delle società scientifiche — Dr. Ernesto Bruschi"
    : "Guidelines, consensus statements, and society announcements — Dr. Ernesto Bruschi";

  const items = recent
    .map((n) => {
      const title = isIt ? n.titleIt : n.titleEn;
      const description = isIt ? n.blurbIt : n.blurbEn;
      // Prefer publishedAt when present; fall back to ingest time.
      const pubDate = new Date(n.publishedAt || n.fetchedAt).toUTCString();
      // Item permalink is the external source (no on-site detail pages yet).
      // Stable guid uses our id so URL changes do not spawn duplicates.
      const guid = `${SITE_URL}/news/${n.id}`;
      return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${escapeXml(n.url)}</link>
      <guid isPermaLink="false">${escapeXml(guid)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(description)}</description>
      <category>${escapeXml(n.source)}</category>
    </item>`;
    })
    .join("\n");

  const lastBuild = recent.length > 0
    ? new Date(recent[0].fetchedAt).toUTCString()
    : new Date().toUTCString();

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${channelTitle}</title>
    <link>${SITE_URL}/${lang}/news</link>
    <description>${channelDesc}</description>
    <language>${lang}</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${SITE_URL}/${filename}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  const outputPath = path.join(process.cwd(), "public", filename);
  fs.writeFileSync(outputPath, rss, "utf-8");
  console.log(`[RSS] Generated ${filename} with ${recent.length} news items.`);
}

/**
 * llms.txt — a curated, prose, link-dense map of the corpus for AI/answer
 * engines (the highest-leverage GEO move for a small citation-seeking site).
 * Served verbatim from /public under output:"export".
 */
function generateLlmsTxt(articles: Article[], newsItems: NewsItem[]) {
  const intro = `# Osteoperionews

> Weekly curated English & Italian summaries of peer-reviewed periodontology, dental-implantology and peri-implant research, by Dr. Ernesto Bruschi (periodontist, implantologist, oral surgeon; ORCID 0000-0002-4773-5384). Each entry is an original short summary of a peer-reviewed paper that links to the primary source (DOI and PubMed). English pages are under /en, Italian under /it.

- Site: ${SITE_URL}
- Author: Dr. Ernesto Bruschi — https://orcid.org/0000-0002-4773-5384
- Feeds (articles): ${SITE_URL}/feed.xml (EN), ${SITE_URL}/feed-it.xml (IT)
- Feeds (industry news): ${SITE_URL}/feed-news.xml (EN), ${SITE_URL}/feed-news-it.xml (IT)
- Full archive: ${SITE_URL}/en/articles (EN), ${SITE_URL}/it/articles (IT)
- Industry news: ${SITE_URL}/en/news (EN), ${SITE_URL}/it/news (IT)
`;

  const items = articles
    .map((a) => {
      const title = a.editorialTitleEn || a.title.replace(/<[^>]+>/g, "");
      const url = `${SITE_URL}/en/articles/${a.slug}`;
      const oneLine = buildMetaDescription(a, "en");
      const src = a.doi ? ` (DOI: ${a.doi})` : "";
      return `- [${title}](${url}): ${oneLine} — ${a.journal}${src}`;
    })
    .join("\n");

  const newsBlock =
    newsItems.length === 0
      ? ""
      : `\n## Industry news\n\n${newsItems
          .slice(0, 20)
          .map((n) => `- [${n.titleEn}](${n.url}): ${n.blurbEn} — ${n.source}`)
          .join("\n")}\n`;

  const out = `${intro}\n## Articles\n\n${items}\n${newsBlock}`;
  fs.writeFileSync(path.join(process.cwd(), "public", "llms.txt"), out, "utf-8");
  console.log(
    `[llms.txt] Generated with ${articles.length} articles and ${newsItems.length} news items.`
  );
}

function main() {
  let articles: Article[] = [];
  let newsItems: NewsItem[] = [];

  try {
    const raw = fs.readFileSync(ARTICLES_PATH, "utf-8");
    const store = JSON.parse(raw);
    articles = store.articles || [];
  } catch {
    console.log("[RSS] No articles found, generating empty feeds.");
  }

  try {
    const raw = fs.readFileSync(NEWS_PATH, "utf-8");
    const store = JSON.parse(raw);
    newsItems = store.items || [];
  } catch {
    console.log("[llms.txt] No news.json yet — skipping industry news block.");
  }

  generateFeed(articles, "en", "feed.xml");
  generateFeed(articles, "it", "feed-it.xml");
  generateNewsFeed(newsItems, "en", "feed-news.xml");
  generateNewsFeed(newsItems, "it", "feed-news-it.xml");
  generateLlmsTxt(articles, newsItems);
}

main();
