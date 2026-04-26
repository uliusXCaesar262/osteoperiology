export interface Article {
  pmid: string;
  title: string;
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

export const SUPPORTED_JOURNALS = [
  "J Periodontol",
  "J Clin Periodontol",
  "Clin Oral Implants Res",
  "Int J Oral Maxillofac Implants",
] as const;

export const JOURNAL_ISSNS: Record<string, string> = {
  "J Periodontol": "1943-3670",
  "J Clin Periodontol": "1600-051X",
  "Clin Oral Implants Res": "1600-0501",
  "Int J Oral Maxillofac Implants": "1942-4434",
};
