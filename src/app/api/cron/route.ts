import { NextResponse } from "next/server";
import {
  searchRecentOpenAccess,
  getArticleSummaries,
  getAbstract,
  extractDoi,
  buildPubMedUrl,
} from "@/lib/pubmed";
import { generateBilingualSummary, selectBestArticles } from "@/lib/summarize";
import { addArticles } from "@/lib/storage";
import { createSlug } from "@/lib/slug";
import { Article } from "@/lib/types";

export const maxDuration = 300;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[CRON] Starting weekly article fetch...");

    // 1. Search PubMed across multiple topic queries
    const pmids = await searchRecentOpenAccess(7);
    console.log(`[CRON] Found ${pmids.length} candidate articles`);

    if (pmids.length === 0) {
      return NextResponse.json({ message: "No new articles found", count: 0 });
    }

    // 2. Get metadata for all candidates
    const allSummaries = await getArticleSummaries(pmids);
    console.log(`[CRON] Retrieved metadata for ${allSummaries.length} articles`);

    // 3. AI selects the best 5
    const selectedPmids = await selectBestArticles(allSummaries, 5);
    const selected = allSummaries.filter((s) => selectedPmids.includes(s.uid));
    console.log(`[CRON] AI selected ${selected.length} articles`);

    // 4. For each selected article, get abstract and generate bilingual summary
    const articles: Article[] = [];

    for (const summary of selected) {
      try {
        const abstractText = await getAbstract(summary.uid);
        if (!abstractText) {
          console.log(`[CRON] No abstract for PMID ${summary.uid}, skipping`);
          continue;
        }

        const doi = extractDoi(summary.elocationid);
        const authors = summary.authors.map((a) => a.name);

        const aiSummary = await generateBilingualSummary(
          summary.title,
          authors,
          summary.fulljournalname || summary.source,
          abstractText
        );

        const article: Article = {
          pmid: summary.uid,
          title: summary.title,
          authors,
          journal: summary.fulljournalname || summary.source,
          pubDate: summary.pubdate,
          doi,
          abstractText,
          summaryEn: aiSummary.en,
          summaryIt: aiSummary.it,
          slug: createSlug(summary.title, summary.uid),
          fetchedAt: new Date().toISOString(),
          url: doi ? `https://doi.org/${doi}` : buildPubMedUrl(summary.uid),
        };

        articles.push(article);
      } catch (err) {
        console.error(`[CRON] Error processing PMID ${summary.uid}:`, err);
      }
    }

    // 5. Store
    if (articles.length > 0) {
      await addArticles(articles);
    }

    console.log(`[CRON] Done: ${articles.length} articles published`);

    return NextResponse.json({
      message: `Processed ${articles.length} articles from ${pmids.length} candidates`,
      count: articles.length,
      pmids: articles.map((a) => a.pmid),
    });
  } catch (error) {
    const errMsg = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    console.error(`[CRON] Fatal: ${errMsg}`);
    return NextResponse.json({ error: "Cron job failed", detail: errMsg }, { status: 500 });
  }
}
