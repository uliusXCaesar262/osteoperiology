import Anthropic from "@anthropic-ai/sdk";
import type { PubMedArticle } from "./pubmed";

const client = new Anthropic();

interface BilingualSummary {
  en: string;
  it: string;
}

/**
 * From a pool of PubMed articles, AI selects the 10-20 most relevant
 * for a periodontology/implantology audience.
 */
export async function selectBestArticles(
  articles: PubMedArticle[],
  maxSelection: number = 15
): Promise<string[]> {
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

From the following ${articles.length} recently published open access articles, select the ${maxSelection} most relevant for an audience of periodontists, implantologists, and oral surgeons.

Prioritize:
- Clinical relevance and applicability
- Novel findings or techniques
- High-quality journals (J Periodontol, J Clin Periodontol, Clin Oral Implants Res, IJOMI, J Dental Research, Periodontology 2000, etc.)
- Systematic reviews and RCTs over case reports
- Avoid predatory or low-impact journals

ARTICLES:
${articleList}

Respond ONLY with a JSON array of selected PMIDs, e.g.: ["12345678", "23456789", ...]
Select exactly ${maxSelection} articles — the absolute best. If fewer are worth selecting, select fewer.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response");

  const match = content.text.match(/\[[\s\S]*?\]/);
  if (!match) throw new Error("Failed to parse selection");

  const selected: string[] = JSON.parse(match[0]);
  console.log(`[AI] Selected ${selected.length} articles from ${articles.length} candidates`);
  return selected;
}

/**
 * Generate bilingual summary for a single article.
 */
export async function generateBilingualSummary(
  title: string,
  authors: string[],
  journal: string,
  abstractText: string
): Promise<BilingualSummary> {
  const prompt = `You are a scientific communicator for a dental periodontology and implantology audience.
You write in a clear, essential style — no fluff, no redundancy. Think Alessandro Baricco applied to science: precise, elegant, direct.

Given this article:
Title: ${title}
Authors: ${authors.join(", ")}
Journal: ${journal}
Abstract: ${abstractText}

Generate TWO summaries — one in English, one in Italian. Each summary should be 300-500 words and include:
1. The clinical question or research problem
2. The key methodology
3. The main findings
4. The clinical relevance / take-home message

Write for an audience of periodontists, implantologists, and oral surgeons. Use appropriate technical terminology but keep the prose readable.

Respond ONLY with valid JSON in this exact format:
{
  "en": "English summary here...",
  "it": "Italian summary here..."
}`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  try {
    const parsed = JSON.parse(content.text);
    return { en: parsed.en || "", it: parsed.it || "" };
  } catch {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return { en: parsed.en || "", it: parsed.it || "" };
    }
    throw new Error("Failed to parse summary response");
  }
}
