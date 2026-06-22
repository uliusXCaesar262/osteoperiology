export interface Article {
  pmid: string;
  title: string;
  titleIt?: string;
  authors: string[];
  journal: string;
  pubDate: string;
  doi: string;
  abstractText: string;
  summaryEn: string;
  summaryIt: string;
  tagsEn?: string[];
  tagsIt?: string[];
  slug: string;
  fetchedAt: string;
  url: string;

  // Editorial differentiation layer (P3-1, anti scaled-content). All optional
  // so existing/un-backfilled articles degrade gracefully to the paper title.
  // editorialTitle* is an original clinical angle shown as the H1/<title>/
  // headline instead of the verbatim paper title; the paper title is kept as a
  // labelled "source study" citation. takeaways*/whyItMatters* are LLM-drafted
  // added value; clinicalNoteIt is Dr. Bruschi's human review note (new
  // articles only, via the weekly review step).
  editorialTitleEn?: string;
  editorialTitleIt?: string;
  takeawaysEn?: string[];
  takeawaysIt?: string[];
  whyItMattersEn?: string;
  whyItMattersIt?: string;
  clinicalNoteIt?: string;
}

export interface ArticlesStore {
  lastUpdated: string;
  articles: Article[];
}

export type Lang = "en" | "it";

export const SEARCH_TOPICS = [
  "Periodontal disease & treatment",
  "Dental implants & osseointegration",
  "Bone regeneration",
  "Guided tissue / bone regeneration",
  "Mucogingival & soft tissue surgery",
  "Peri-implant disease",
] as const;
