/**
 * Standalone script for GitHub Actions.
 * Searches PubMed, selects best articles via Claude, generates bilingual summaries,
 * and saves them to content/articles.json.
 *
 * Env vars required: ANTHROPIC_API_KEY, PUBMED_API_KEY (optional)
 */

import fs from "fs";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";

// ─── Config ───
const BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
const ARTICLES_PATH = path.join(process.cwd(), "content", "articles.json");
const MAX_SELECTION = 5;
const DAYS_BACK = 14;

const SEARCH_QUERIES = [
  '(periodontal disease[MeSH] OR periodontitis[MeSH] OR periodontal treatment) AND "free full text"[Filter]',
  '(dental implants[MeSH] OR peri-implantitis OR implant osseointegration) AND "free full text"[Filter]',
  '(bone regeneration[MeSH] AND (dental OR alveolar OR maxillary OR mandibular)) AND "free full text"[Filter]',
  '(guided tissue regeneration OR guided bone regeneration) AND (periodontal OR implant) AND "free full text"[Filter]',
  '(mucogingival surgery OR soft tissue graft OR connective tissue graft) AND "free full text"[Filter]',
  '(peri-implant OR peri-implantitis OR peri-implant mucositis) AND "free full text"[Filter]',
];

// ─── Types ───
interface Article {
  pmid: string;
  title: string;
  titleIt: string;
  authors: string[];
  journal: string;
  pubDate: string;
  doi: string;
  abstractText: string;
  summaryEn: string;
  summaryIt: string;
  slug: string;
  fetchedAt: string;
  url: string;
}

interface ArticlesStore {
  lastUpdated: string;
  articles: Article[];
}

interface PubMedArticle {
  uid: string;
  title: string;
  authors: { name: string }[];
  source: string;
  pubdate: string;
  elocationid: string;
  fulljournalname: string;
}

// ─── PubMed ───
async function searchPubMed(query: string, daysBack: number): Promise<string[]> {
  const fullQuery = `${query} AND "last ${daysBack} days"[EDAT]`;
  const params = new URLSearchParams({
    db: "pubmed",
    term: fullQuery,
    retmax: "30",
    retmode: "json",
    sort: "relevance",
  });
  if (process.env.PUBMED_API_KEY) params.set("api_key", process.env.PUBMED_API_KEY);

  const res = await fetch(`${BASE_URL}/esearch.fcgi?${params}`);
  if (!res.ok) throw new Error(`PubMed search failed: ${res.status}`);
  const data = await res.json();
  return data.esearchresult.idlist;
}

async function searchRecentOpenAccess(): Promise<string[]> {
  const allPmids = new Set<string>();
  for (const query of SEARCH_QUERIES) {
    try {
      const pmids = await searchPubMed(query, DAYS_BACK);
      pmids.forEach((id: string) => allPmids.add(id));
      await sleep(350);
    } catch (err) {
      console.error(`[PubMed] Query failed:`, err);
    }
  }
  console.log(`[PubMed] Found ${allPmids.size} unique articles`);
  return Array.from(allPmids);
}

async function getArticleSummaries(pmids: string[]): Promise<PubMedArticle[]> {
  const articles: PubMedArticle[] = [];
  for (let i = 0; i < pmids.length; i += 50) {
    const batch = pmids.slice(i, i + 50);
    const params = new URLSearchParams({
      db: "pubmed",
      id: batch.join(","),
      retmode: "json",
    });
    if (process.env.PUBMED_API_KEY) params.set("api_key", process.env.PUBMED_API_KEY);

    const res = await fetch(`${BASE_URL}/esummary.fcgi?${params}`);
    if (!res.ok) throw new Error(`PubMed summary failed: ${res.status}`);
    const data = await res.json();

    for (const uid of data.result.uids) {
      const article = data.result[uid];
      if (article && typeof article === "object" && "title" in article) {
        articles.push(article);
      }
    }
    if (i + 50 < pmids.length) await sleep(350);
  }
  return articles;
}

async function getAbstract(pmid: string): Promise<string> {
  const params = new URLSearchParams({
    db: "pubmed",
    id: pmid,
    rettype: "abstract",
    retmode: "xml",
  });
  if (process.env.PUBMED_API_KEY) params.set("api_key", process.env.PUBMED_API_KEY);

  const res = await fetch(`${BASE_URL}/efetch.fcgi?${params}`);
  if (!res.ok) throw new Error(`PubMed fetch failed: ${res.status}`);
  const xml = await res.text();

  const matches = xml.match(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g);
  if (!matches) return "";

  return matches
    .map((match) => {
      const labelMatch = match.match(/Label="([^"]+)"/);
      const textMatch = match.match(/>([^<]+)</);
      const label = labelMatch ? labelMatch[1] : "";
      const text = textMatch ? textMatch[1].trim() : "";
      return label ? `${label}: ${text}` : text;
    })
    .join("\n\n");
}

// ─── AI ───
const anthropic = new Anthropic();

async function selectBestArticles(articles: PubMedArticle[]): Promise<string[]> {
  const articleList = articles
    .map(
      (a) =>
        `PMID:${a.uid} | ${a.fulljournalname || a.source} | ${a.title} | ${a.authors
          .slice(0, 3)
          .map((au) => au.name)
          .join(", ")}`
    )
    .join("\n");

  const prompt = `You are a periodontist and implantologist curating a weekly literature digest.

From the following ${articles.length} recently published open access articles, select the ${MAX_SELECTION} most relevant for an audience of periodontists, implantologists, and oral surgeons.

Prioritize:
- Clinical relevance and applicability
- Novel findings or techniques
- High-quality journals (J Periodontol, J Clin Periodontol, Clin Oral Implants Res, IJOMI, J Dental Research, Periodontology 2000, etc.)
- Systematic reviews and RCTs over case reports
- Avoid predatory or low-impact journals

ARTICLES:
${articleList}

Respond ONLY with a JSON array of selected PMIDs, e.g.: ["12345678", "23456789", ...]`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response");
  const match = content.text.match(/\[[\s\S]*?\]/);
  if (!match) throw new Error("Failed to parse selection");

  const selected: string[] = JSON.parse(match[0]);
  console.log(`[AI] Selected ${selected.length} articles`);
  return selected;
}

async function generateBilingualSummary(
  title: string,
  authors: string[],
  journal: string,
  abstractText: string
): Promise<{ en: string; it: string; titleIt: string }> {
  const prompt = `You are a scientific communicator for a dental periodontology and implantology audience.
You write in a clear, essential style — no fluff, no redundancy. Think Alessandro Baricco applied to science: precise, elegant, direct.

Given this article:
Title: ${title}
Authors: ${authors.join(", ")}
Journal: ${journal}
Abstract: ${abstractText}

Generate:
1. An Italian translation of the article title (accurate, natural-sounding Italian — not a literal word-by-word translation)
2. TWO summaries — one in English, one in Italian. Each summary should be 300-500 words and include:
   a. The clinical question or research problem
   b. The key methodology
   c. The main findings
   d. The clinical relevance / take-home message

Write for an audience of periodontists, implantologists, and oral surgeons. Use appropriate technical terminology but keep the prose readable.

Respond ONLY with valid JSON in this exact format:
{
  "titleIt": "Italian title here...",
  "en": "English summary here...",
  "it": "Italian summary here..."
}`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response");

  try {
    const parsed = JSON.parse(content.text);
    return { en: parsed.en || "", it: parsed.it || "", titleIt: parsed.titleIt || "" };
  } catch {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return { en: parsed.en || "", it: parsed.it || "", titleIt: parsed.titleIt || "" };
    }
    throw new Error("Failed to parse summary");
  }
}

// ─── Helpers ───
function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function createSlug(title: string, pmid: string): string {
  const base = title
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80)
    .replace(/-+$/, "");
  return `${base}-${pmid}`;
}

function extractDoi(elocationid: string): string {
  const match = elocationid.match(/doi:\s*(10\.\S+)/i);
  return match ? match[1] : "";
}

// ─── Main ───
async function main() {
  console.log("[UPDATE] Starting weekly article update...");

  // Load existing store
  let store: ArticlesStore = { lastUpdated: "", articles: [] };
  try {
    const raw = fs.readFileSync(ARTICLES_PATH, "utf-8");
    store = JSON.parse(raw);
  } catch {
    console.log("[UPDATE] No existing articles.json, starting fresh.");
  }

  const existingPmids = new Set(store.articles.map((a) => a.pmid));

  // 1. Search PubMed
  const pmids = await searchRecentOpenAccess();
  if (pmids.length === 0) {
    console.log("[UPDATE] No new articles found. Done.");
    return;
  }

  // 2. Get metadata
  const allSummaries = await getArticleSummaries(pmids);
  console.log(`[UPDATE] Retrieved metadata for ${allSummaries.length} articles`);

  // 3. AI selection
  const selectedPmids = await selectBestArticles(allSummaries);
  const selected = allSummaries.filter((s) => selectedPmids.includes(s.uid));

  // 4. Process each selected article
  const newArticles: Article[] = [];

  for (const summary of selected) {
    if (existingPmids.has(summary.uid)) {
      console.log(`[UPDATE] PMID ${summary.uid} already exists, skipping.`);
      continue;
    }

    try {
      const abstractText = await getAbstract(summary.uid);
      if (!abstractText) {
        console.log(`[UPDATE] No abstract for PMID ${summary.uid}, skipping.`);
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

      newArticles.push({
        pmid: summary.uid,
        title: summary.title,
        titleIt: aiSummary.titleIt,
        authors,
        journal: summary.fulljournalname || summary.source,
        pubDate: summary.pubdate,
        doi,
        abstractText,
        summaryEn: aiSummary.en,
        summaryIt: aiSummary.it,
        slug: createSlug(summary.title, summary.uid),
        fetchedAt: new Date().toISOString(),
        url: doi ? `https://doi.org/${doi}` : `https://pubmed.ncbi.nlm.nih.gov/${summary.uid}/`,
      });

      await sleep(500);
    } catch (err) {
      console.error(`[UPDATE] Error processing PMID ${summary.uid}:`, err);
    }
  }

  // 5. Save
  if (newArticles.length > 0) {
    store.articles = [...newArticles, ...store.articles];
    store.lastUpdated = new Date().toISOString();
    fs.writeFileSync(ARTICLES_PATH, JSON.stringify(store, null, 2), "utf-8");
    console.log(`[UPDATE] Added ${newArticles.length} new articles. Total: ${store.articles.length}`);
  } else {
    console.log("[UPDATE] No new articles to add.");
  }
}

main().catch((err) => {
  console.error("[UPDATE] Fatal error:", err);
  process.exit(1);
});
