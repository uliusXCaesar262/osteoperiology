import type { Article, Lang } from "./types";

/**
 * Original source-paper title (English), HTML stripped. Used as the labelled
 * "source study" citation and in the isBasedOn JSON-LD — never as the page H1
 * once an editorial title exists.
 */
export function paperTitle(article: Article): string {
  return article.title.replace(/<[^>]+>/g, "");
}

/**
 * The title shown to humans and engines (H1, <title>, headline, list cards,
 * related, ItemList, newsletter): the original editorial angle when present
 * (P3-1, breaks title-cannibalization with the source), else the localized
 * paper title, else the English paper title.
 */
export function displayTitle(article: Article, lang: Lang): string {
  const editorial =
    lang === "it" ? article.editorialTitleIt : article.editorialTitleEn;
  if (editorial) return editorial;
  if (lang === "it" && article.titleIt) return article.titleIt;
  return paperTitle(article);
}

export function takeaways(article: Article, lang: Lang): string[] {
  return (lang === "it" ? article.takeawaysIt : article.takeawaysEn) || [];
}

export function whyItMatters(article: Article, lang: Lang): string | undefined {
  return lang === "it" ? article.whyItMattersIt : article.whyItMattersEn;
}

/** Google SERP snippets truncate around ~155 chars; keep a small safety margin. */
export const META_DESCRIPTION_MAX = 155;

export function truncateMeta(text: string, max = META_DESCRIPTION_MAX): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  const cut = normalized.slice(0, max).replace(/\s+\S*$/, "");
  return `${cut}…`;
}

/**
 * Meta description for SERP / OG / JSON-LD: lead with the on-page "In breve"
 * bullets when present (highest CTR signal vs. a generic summary opening), else
 * the self-contained "why it matters" paragraph, else the summary lead.
 */
export function buildMetaDescription(article: Article, lang: Lang): string {
  const bullets = takeaways(article, lang);
  if (bullets.length > 0) {
    const prefix = lang === "it" ? "In breve: " : "In brief: ";
    let body = bullets[0];
    if (bullets.length > 1) {
      const withSecond = `${body} ${bullets[1]}`;
      if (`${prefix}${withSecond}`.length <= META_DESCRIPTION_MAX) {
        body = withSecond;
      }
    }
    return truncateMeta(`${prefix}${body}`);
  }

  const why = whyItMatters(article, lang);
  if (why) return truncateMeta(why);

  const summary = lang === "it" ? article.summaryIt : article.summaryEn;
  return truncateMeta(summary);
}
