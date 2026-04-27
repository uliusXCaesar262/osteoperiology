import fs from "fs";
import path from "path";

const SITE_URL = "https://osteoperiology.bonebenders.com";
const ARTICLES_PATH = path.join(process.cwd(), "content", "articles.json");
const OUTPUT_PATH = path.join(process.cwd(), "public", "feed.xml");

interface Article {
  pmid: string;
  title: string;
  journal: string;
  pubDate: string;
  slug: string;
  summaryEn: string;
  fetchedAt: string;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function main() {
  let articles: Article[] = [];

  try {
    const raw = fs.readFileSync(ARTICLES_PATH, "utf-8");
    const store = JSON.parse(raw);
    articles = store.articles || [];
  } catch {
    console.log("[RSS] No articles found, generating empty feed.");
  }

  const recent = articles.slice(0, 50);

  const items = recent
    .map((a) => {
      const link = `${SITE_URL}/en/articles/${a.slug}`;
      const pubDate = new Date(a.pubDate || a.fetchedAt).toUTCString();
      return `    <item>
      <title>${escapeXml(a.title.replace(/<[^>]+>/g, ""))}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(a.summaryEn.slice(0, 500))}</description>
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
    <title>Osteoperiology</title>
    <link>${SITE_URL}</link>
    <description>Curated news from the periodontal and implant literature — Dr. Ernesto Bruschi</description>
    <language>en</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  fs.writeFileSync(OUTPUT_PATH, rss, "utf-8");
  console.log(`[RSS] Generated feed.xml with ${recent.length} items.`);
}

main();
