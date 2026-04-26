import { JOURNAL_ISSNS } from "./types";

const BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

interface PubMedSearchResult {
  esearchresult: {
    idlist: string[];
    count: string;
  };
}

interface PubMedArticle {
  uid: string;
  title: string;
  authors: { name: string }[];
  source: string;
  pubdate: string;
  elocationid: string;
  fulljournalname: string;
  sortfirstauthor: string;
}

interface PubMedSummaryResult {
  result: {
    uids: string[];
    [pmid: string]: PubMedArticle | string[];
  };
}

interface PubMedFetchResult {
  PubmedArticleSet?: {
    PubmedArticle?: Array<{
      MedlineCitation: {
        Article: {
          Abstract?: {
            AbstractText: string | string[];
          };
        };
      };
    }>;
  };
}

function buildJournalQuery(): string {
  const issns = Object.values(JOURNAL_ISSNS);
  const journalTerms = issns.map((issn) => `${issn}[ISSN]`);
  return `(${journalTerms.join(" OR ")})`;
}

export async function searchRecentOpenAccess(
  daysBack: number = 7
): Promise<string[]> {
  const journalQuery = buildJournalQuery();
  const dateQuery = `"last ${daysBack} days"[EDAT]`;
  const openAccessFilter = "free full text[Filter]";

  const query = `${journalQuery} AND ${dateQuery} AND ${openAccessFilter}`;

  const params = new URLSearchParams({
    db: "pubmed",
    term: query,
    retmax: "50",
    retmode: "json",
    sort: "date",
  });

  if (process.env.PUBMED_API_KEY) {
    params.set("api_key", process.env.PUBMED_API_KEY);
  }

  const res = await fetch(`${BASE_URL}/esearch.fcgi?${params}`);
  if (!res.ok) throw new Error(`PubMed search failed: ${res.status}`);

  const data: PubMedSearchResult = await res.json();
  return data.esearchresult.idlist;
}

export async function getArticleSummaries(
  pmids: string[]
): Promise<PubMedArticle[]> {
  if (pmids.length === 0) return [];

  const params = new URLSearchParams({
    db: "pubmed",
    id: pmids.join(","),
    retmode: "json",
  });

  if (process.env.PUBMED_API_KEY) {
    params.set("api_key", process.env.PUBMED_API_KEY);
  }

  const res = await fetch(`${BASE_URL}/esummary.fcgi?${params}`);
  if (!res.ok) throw new Error(`PubMed summary failed: ${res.status}`);

  const data: PubMedSummaryResult = await res.json();
  const articles: PubMedArticle[] = [];

  for (const uid of data.result.uids) {
    const article = data.result[uid] as PubMedArticle;
    if (article && typeof article === "object" && "title" in article) {
      articles.push(article);
    }
  }

  return articles;
}

export async function getAbstract(pmid: string): Promise<string> {
  const params = new URLSearchParams({
    db: "pubmed",
    id: pmid,
    rettype: "abstract",
    retmode: "xml",
  });

  if (process.env.PUBMED_API_KEY) {
    params.set("api_key", process.env.PUBMED_API_KEY);
  }

  const res = await fetch(`${BASE_URL}/efetch.fcgi?${params}`);
  if (!res.ok) throw new Error(`PubMed fetch failed: ${res.status}`);

  const xml = await res.text();

  // Extract abstract text from XML
  const abstractMatch = xml.match(
    /<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g
  );
  if (!abstractMatch) return "";

  return abstractMatch
    .map((match) => {
      const labelMatch = match.match(/Label="([^"]+)"/);
      const textMatch = match.match(/>([^<]+)</);
      const label = labelMatch ? labelMatch[1] : "";
      const text = textMatch ? textMatch[1].trim() : "";
      return label ? `${label}: ${text}` : text;
    })
    .join("\n\n");
}

export function extractDoi(elocationid: string): string {
  const doiMatch = elocationid.match(/doi:\s*(10\.\S+)/i);
  return doiMatch ? doiMatch[1] : "";
}

export function buildPubMedUrl(pmid: string): string {
  return `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;
}

export function buildDoiUrl(doi: string): string {
  return doi ? `https://doi.org/${doi}` : "";
}
