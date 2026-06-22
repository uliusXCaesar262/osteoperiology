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
