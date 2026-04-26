import { getRecentArticles } from "@/lib/storage";

const SITE_URL = "https://osteoperiology.vercel.app";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const { articles } = await getRecentArticles(50);

  const items = articles
    .map((a) => {
      const link = `${SITE_URL}/en/articles/${a.slug}`;
      const pubDate = new Date(a.pubDate || a.fetchedAt).toUTCString();

      return `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(a.summaryEn.slice(0, 500))}</description>
      <category>${escapeXml(a.journal)}</category>
    </item>`;
    })
    .join("\n");

  const lastBuild = articles.length > 0
    ? new Date(articles[0].fetchedAt).toUTCString()
    : new Date().toUTCString();

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Osteoperiology</title>
    <link>${SITE_URL}</link>
    <description>Curated news from the periodontal and implant literature — Dr. Ernesto Bruschi</description>
    <language>en</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${SITE_URL}/api/feed" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
