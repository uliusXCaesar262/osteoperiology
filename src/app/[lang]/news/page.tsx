import type { Metadata } from "next";
import type { Lang, NewsKind } from "@/lib/types";
import { getDictionary } from "@/i18n/config";
import { getRecentNews } from "@/lib/storage";
import { SITE_URL } from "@/lib/constants";
import { ogImages, buildAlternates } from "@/lib/seo";

function kindLabel(
  kind: NewsKind,
  dict: Awaited<ReturnType<typeof getDictionary>>
): string {
  switch (kind) {
    case "guideline":
      return dict.news.kindGuideline;
    case "consensus":
      return dict.news.kindConsensus;
    case "society":
      return dict.news.kindSociety;
    default:
      return dict.news.kindOther;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const l = (lang === "it" ? "it" : "en") as Lang;
  const dict = await getDictionary(l);
  const url = `${SITE_URL}/${l}/news`;

  return {
    title: dict.news.title,
    description: dict.news.description,
    alternates: buildAlternates(l, "/news"),
    openGraph: {
      title: dict.news.title,
      description: dict.news.description,
      url,
      type: "website",
      locale: l === "it" ? "it_IT" : "en_US",
      alternateLocale: l === "it" ? "en_US" : "it_IT",
      images: ogImages,
    },
  };
}

export default async function NewsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = rawLang as Lang;
  const dict = await getDictionary(lang);
  const { items, total } = getRecentNews(100);

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/${lang}/news`,
    name: dict.news.title,
    description: dict.news.description,
    inLanguage: lang,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((n, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: n.url,
        name: lang === "it" ? n.titleIt : n.titleEn,
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
        {dict.news.title}
      </h1>
      <p
        className="text-base leading-relaxed mb-2"
        style={{ color: "var(--color-ink-secondary)" }}
      >
        {dict.news.intro}
      </p>
      <p className="text-sm mb-10" style={{ color: "var(--color-ink-muted)" }}>
        {dict.news.count.replace("{{count}}", String(total))}
      </p>

      {items.length === 0 ? (
        <p style={{ color: "var(--color-ink-muted)" }}>{dict.news.empty}</p>
      ) : (
        <ul className="flex flex-col">
          {items.map((n) => {
            const title = lang === "it" ? n.titleIt : n.titleEn;
            const blurb = lang === "it" ? n.blurbIt : n.blurbEn;
            return (
              <li
                key={n.id}
                className="py-5"
                style={{ borderBottom: "1px solid var(--color-divider)" }}
              >
                <p
                  className="text-[11px] font-semibold tracking-wide uppercase mb-1"
                  style={{ color: "var(--color-accent)" }}
                >
                  {kindLabel(n.kind, dict)}
                  <span
                    className="font-normal normal-case tracking-normal"
                    style={{ color: "var(--color-ink-muted)" }}
                  >
                    {" "}
                    · {n.source}
                  </span>
                </p>
                <h2
                  className="text-base sm:text-lg leading-snug font-medium mb-2"
                  style={{ color: "var(--color-ink)" }}
                >
                  {title}
                </h2>
                <p
                  className="text-sm leading-relaxed mb-3"
                  style={{ color: "var(--color-ink-secondary)" }}
                >
                  {blurb}
                </p>
                <a
                  href={n.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium underline-offset-2 hover:underline"
                  style={{ color: "var(--color-accent)" }}
                  aria-label={`${dict.news.readSource} (${lang === "it" ? "si apre in una nuova scheda" : "opens in a new tab"})`}
                >
                  {dict.news.readSource} →
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
