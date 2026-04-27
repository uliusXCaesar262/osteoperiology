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
  slug: string;
  fetchedAt: string;
  url: string;
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
