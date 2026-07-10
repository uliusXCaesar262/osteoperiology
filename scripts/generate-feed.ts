import fs from "fs";
import path from "path";
import type { Article } from "../src/lib/types";
import { buildMetaDescription } from "../src/lib/article";

const SITE_URL = "https://osteoperionews.bonebenders.com";
const ARTICLES_PATH = path.join(process.cwd(), "content", "articles.json");

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

/**
 * llms.txt — a curated, prose, link-dense map of the corpus for AI/answer
 * engines (the highest-leverage GEO move for a small citation-seeking site).
 * Served verbatim from /public under output:"export".
 */
function generateLlmsTxt(articles: Article[]) {
  const intro = `# Osteoperionews

> Weekly curated English & Italian summaries of open-access periodontology, dental-implantology and peri-implant research, by Dr. Ernesto Bruschi (periodontist, implantologist, oral surgeon; ORCID 0000-0002-4773-5384). Each entry is an original short summary of a peer-reviewed paper that links to the primary source (DOI and PubMed). English pages are under /en, Italian under /it.

- Site: ${SITE_URL}
- Author: Dr. Ernesto Bruschi — https://orcid.org/0000-0002-4773-5384
- Feeds: ${SITE_URL}/feed.xml (EN), ${SITE_URL}/feed-it.xml (IT)
- Full archive: ${SITE_URL}/en/articles (EN), ${SITE_URL}/it/articles (IT)
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

  const out = `${intro}\n## Articles\n\n${items}\n`;
  fs.writeFileSync(path.join(process.cwd(), "public", "llms.txt"), out, "utf-8");
  console.log(`[llms.txt] Generated with ${articles.length} articles.`);
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
  generateLlmsTxt(articles);
}

main();
