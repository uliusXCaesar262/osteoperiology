import type { Metadata } from "next";
import type { Lang } from "@/lib/types";
import { getDictionary } from "@/i18n/config";
import { getRecentArticles } from "@/lib/storage";
import { SITE_URL } from "@/lib/constants";
import SearchableArticleList from "@/components/SearchableArticleList";

const homeMeta = {
  en: {
    title: "Osteoperionews — Periodontal & Implant Literature",
    description:
      "Weekly curated summaries of open access articles in periodontology and dental implantology — Dr. Ernesto Bruschi",
  },
  it: {
    title: "Osteoperionews — Letteratura parodontale e implantare",
    description:
      "Riassunti settimanali curati di articoli open access in parodontologia e implantologia dentale — Dr. Ernesto Bruschi",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const l = (lang === "it" ? "it" : "en") as Lang;
  const otherLang = l === "en" ? "it" : "en";
  const url = `${SITE_URL}/${l}`;

  return {
    title: homeMeta[l].title,
    description: homeMeta[l].description,
    alternates: {
      canonical: url,
      languages: {
        [l]: url,
        [otherLang]: `${SITE_URL}/${otherLang}`,
        "x-default": `${SITE_URL}/en`,
      },
    },
    openGraph: {
      title: homeMeta[l].title,
      description: homeMeta[l].description,
      url,
      locale: l === "it" ? "it_IT" : "en_US",
      alternateLocale: l === "it" ? "en_US" : "it_IT",
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = rawLang as Lang;
  const dict = await getDictionary(lang);
  const { articles } = getRecentArticles(20);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl sm:text-3xl font-semibold">
          {dict.home.latestArticles}
        </h2>
        <a
          href={lang === "it" ? "/feed-it.xml" : "/feed.xml"}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary"
          title="RSS Feed"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <circle cx="6.18" cy="17.82" r="2.18" />
            <path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z" />
          </svg>
          RSS
        </a>
      </div>

      {articles.length === 0 ? (
        <div className="empty-state text-center">
          <div className="text-4xl mb-4">📚</div>
          <p className="text-lg mb-2" style={{ color: "var(--color-ink-secondary)" }}>
            {dict.home.noArticles}
          </p>
        </div>
      ) : (
        <SearchableArticleList
          articles={articles}
          lang={lang}
          dict={{
            searchPlaceholder: dict.home.searchPlaceholder,
            searchNoResults: dict.home.searchNoResults,
            searchResultCount: dict.home.searchResultCount,
            readMore: dict.home.readMore,
            publishedIn: dict.home.publishedIn,
          }}
        />
      )}
    </div>
  );
}
