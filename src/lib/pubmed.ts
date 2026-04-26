const BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

// Topic-based search queries for periodontology and implantology
const SEARCH_QUERIES = [
  '(periodontal disease[MeSH] OR periodontitis[MeSH] OR periodontal treatment) AND "free full text"[Filter]',
  '(dental implants[MeSH] OR peri-implantitis OR implant osseointegration) AND "free full text"[Filter]',
  '(bone regeneration[MeSH] AND (dental OR alveolar OR maxillary OR mandibular)) AND "free full text"[Filter]',
  '(guided tissue regeneration OR guided bone regeneration) AND (periodontal OR implant) AND "free full text"[Filter]',
  '(mucogingival surgery OR soft tissue graft OR connective tissue graft) AND "free full text"[Filter]',
  '(peri-implant OR peri-implantitis OR peri-implant mucositis) AND "free full text"[Filter]',
];

interface PubMedSearchResult {
  esearchresult: {
    idlist: string[];
    count: string;
  };
}

export interface PubMedArticle {
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

async function searchPubMed(
  query: string,
  daysBack: number,
  retmax: number = 30
): Promise<string[]> {
  const dateQuery = `"last ${daysBack} days"[EDAT]`;
  const fullQuery = `${query} AND ${dateQuery}`;

  const params = new URLSearchParams({
    db: "pubmed",
    term: fullQuery,
    retmax: String(retmax),
    retmode: "json",
    sort: "relevance",
  });

  if (process.env.PUBMED_API_KEY) {
    params.set("api_key", process.env.PUBMED_API_KEY);
  }

  const res = await fetch(`${BASE_URL}/esearch.fcgi?${params}`);
  if (!res.ok) throw new Error(`PubMed search failed: ${res.status}`);

  const data: PubMedSearchResult = await res.json();
  return data.esearchresult.idlist;
}

export async function searchRecentOpenAccess(
  daysBack: number = 7
): Promise<string[]> {
  const allPmids = new Set<string>();

  for (const query of SEARCH_QUERIES) {
    try {
      const pmids = await searchPubMed(query, daysBack, 30);
      pmids.forEach((id) => allPmids.add(id));
      // Rate limit between queries
      await new Promise((r) => setTimeout(r, 350));
    } catch (err) {
      console.error(`[PubMed] Query failed: ${query}`, err);
    }
  }

  console.log(`[PubMed] Found ${allPmids.size} unique articles across ${SEARCH_QUERIES.length} queries`);
  return Array.from(allPmids);
}

export async function getArticleSummaries(
  pmids: string[]
): Promise<PubMedArticle[]> {
  if (pmids.length === 0) return [];

  // Batch in groups of 50
  const articles: PubMedArticle[] = [];
  for (let i = 0; i < pmids.length; i += 50) {
    const batch = pmids.slice(i, i + 50);

    const params = new URLSearchParams({
      db: "pubmed",
      id: batch.join(","),
      retmode: "json",
    });

    if (process.env.PUBMED_API_KEY) {
      params.set("api_key", process.env.PUBMED_API_KEY);
    }

    const res = await fetch(`${BASE_URL}/esummary.fcgi?${params}`);
    if (!res.ok) throw new Error(`PubMed summary failed: ${res.status}`);

    const data: PubMedSummaryResult = await res.json();

    for (const uid of data.result.uids) {
      const article = data.result[uid] as PubMedArticle;
      if (article && typeof article === "object" && "title" in article) {
        articles.push(article);
      }
    }

    if (i + 50 < pmids.length) {
      await new Promise((r) => setTimeout(r, 350));
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
