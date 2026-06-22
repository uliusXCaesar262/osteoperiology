import type { Metadata } from "next";
import Link from "next/link";
import type { Lang } from "@/lib/types";
import { getDictionary } from "@/i18n/config";
import { getRecentArticles } from "@/lib/storage";
import { SITE_URL } from "@/lib/constants";
import { ogImages, buildAlternates } from "@/lib/seo";
import { displayTitle } from "@/lib/article";

/**
 * Full article archive (`/en/articles`, `/it/articles`).
 *
 * Statically rendered list of EVERY article as a plain crawlable <a> link —
 * NOT behind the client-side search filter. This is the canonical fix for the
 * orphan problem: the locale hub only renders the 20 most recent, leaving older
 * summaries reachable only via the sitemap. The archive gives every article an
 * in-page internal link so crawlers and answer engines can discover the whole
 * corpus from one page.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const l = (lang === "it" ? "it" : "en") as Lang;
  const dict = await getDictionary(l);
  const url = `${SITE_URL}/${l}/articles`;

  return {
    title: dict.archive.title,
    description: dict.archive.description,
    alternates: buildAlternates(l, "/articles"),
    openGraph: {
      title: dict.archive.title,
      description: dict.archive.description,
      url,
      type: "website",
      locale: l === "it" ? "it_IT" : "en_US",
      alternateLocale: l === "it" ? "en_US" : "it_IT",
      images: ogImages,
    },
  };
}

export default async function ArticlesArchivePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = rawLang as Lang;
  const dict = await getDictionary(lang);
  const { articles, total } = getRecentArticles(500);

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/${lang}/articles`,
    name: dict.archive.title,
    description: dict.archive.description,
    inLanguage: lang,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: articles.length,
      itemListElement: articles.map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/${lang}/articles/${a.slug}`,
        name: displayTitle(a, lang),
      })),
    },
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
      <h1
        className="text-3xl sm:text-4xl font-bold mb-3"
        style={{ fontFamily: "var(--font-lora)" }}
      >
        {dict.archive.title}
      </h1>
      <p
        className="text-base leading-relaxed mb-2"
        style={{ color: "var(--color-ink-secondary)" }}
      >
        {dict.archive.intro}
      </p>
      <p className="text-sm mb-10" style={{ color: "var(--color-ink-muted)" }}>
        {dict.archive.count.replace("{{count}}", String(total))}
      </p>

      <ul className="flex flex-col">
        {articles.map((a) => {
          const t = displayTitle(a, lang);
          return (
            <li
              key={a.pmid}
              className="py-4"
              style={{ borderBottom: "1px solid var(--color-divider)" }}
            >
              <Link
                href={`/${lang}/articles/${a.slug}`}
                className="block group"
              >
                <span
                  className="block text-[11px] font-semibold tracking-wide uppercase mb-1"
                  style={{ color: "var(--color-accent)" }}
                >
                  {a.journal}
                </span>
                <span
                  className="block text-base sm:text-lg leading-snug font-medium group-hover:underline"
                  style={{ color: "var(--color-ink)" }}
                >
                  {t}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
