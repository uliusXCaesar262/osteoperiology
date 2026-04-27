import fs from "fs";
import path from "path";

const SITE_URL = "https://osteoperionews.bonebenders.com";
const ARTICLES_PATH = path.join(process.cwd(), "content", "articles.json");

interface Article {
  pmid: string;
  title: string;
  titleIt?: string;
  journal: string;
  pubDate: string;
  slug: string;
  summaryEn: string;
  summaryIt: string;
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
      const pubDate = new Date(a.pubDate || a.fetchedAt).toUTCString();
      const title = isIt && a.titleIt
        ? a.titleIt
        : a.title.replace(/<[^>]+>/g, "");
      const summary = isIt ? a.summaryIt : a.summaryEn;
      return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(summary.slice(0, 500))}</description>
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

function main() {
  let articles: Article[] = [];

  try {
    const raw = fs.readFileSync(ARTICLES_PATH, "utf-8");
    const store = JSON.parse(raw);
    articles = store.articles || [];
  } catch {
    console.log("[RSS] No articles found, generating empty feeds.");
  }

  generateFeed(articles, "en", "feed.xml");
  generateFeed(articles, "it", "feed-it.xml");
}

main();
