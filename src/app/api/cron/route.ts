import { NextResponse } from "next/server";
import {
  searchRecentOpenAccess,
  getArticleSummaries,
  getAbstract,
  extractDoi,
  buildPubMedUrl,
} from "@/lib/pubmed";
import { generateBilingualSummary } from "@/lib/summarize";
import { addArticles } from "@/lib/storage";
import { createSlug } from "@/lib/slug";
import { Article } from "@/lib/types";

export const maxDuration = 300; // 5 minutes for Pro plan

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[CRON] Starting weekly article fetch...");

    // 1. Search PubMed for recent open access articles
    const pmids = await searchRecentOpenAccess(7);
    console.log(`[CRON] Found ${pmids.length} articles`);

    if (pmids.length === 0) {
      return NextResponse.json({
        message: "No new articles found",
        count: 0,
      });
    }

    // 2. Get article metadata
    const summaries = await getArticleSummaries(pmids);

    // 3. For each article, get abstract and generate AI summary
    const articles: Article[] = [];

    for (const summary of summaries) {
      try {
        const abstractText = await getAbstract(summary.uid);
        if (!abstractText) {
          console.log(`[CRON] No abstract for PMID ${summary.uid}, skipping`);
          continue;
        }

        const doi = extractDoi(summary.elocationid);
        const authors = summary.authors.map((a) => a.name);

        // Generate bilingual AI summary
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
          url: doi
            ? `https://doi.org/${doi}`
            : buildPubMedUrl(summary.uid),
        };

        articles.push(article);

        // Rate limiting: wait between API calls
        await new Promise((r) => setTimeout(r, 500));
      } catch (err) {
        console.error(
          `[CRON] Error processing PMID ${summary.uid}:`,
          err
        );
      }
    }

    // 4. Store in Vercel Blob
    if (articles.length > 0) {
      await addArticles(articles);
    }

    console.log(`[CRON] Successfully processed ${articles.length} articles`);

    return NextResponse.json({
      message: `Processed ${articles.length} articles`,
      count: articles.length,
      pmids: articles.map((a) => a.pmid),
    });
  } catch (error) {
    console.error("[CRON] Fatal error:", error);
    return NextResponse.json(
      { error: "Cron job failed" },
      { status: 500 }
    );
  }
}
