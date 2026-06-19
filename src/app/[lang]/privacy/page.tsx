import type { Metadata } from "next";
import type { Lang } from "@/lib/types";
import { getDictionary } from "@/i18n/config";
import { SITE_URL } from "@/lib/constants";
import { buildAlternates, ogImages } from "@/lib/seo";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const l = (lang === "it" ? "it" : "en") as Lang;
  const dict = await getDictionary(l);
  const url = `${SITE_URL}/${l}/privacy`;

  return {
    title: dict.privacy.title,
    description: dict.privacy.description,
    alternates: buildAlternates(l, "/privacy"),
    openGraph: {
      title: dict.privacy.title,
      description: dict.privacy.description,
      url,
      type: "website",
      locale: l === "it" ? "it_IT" : "en_US",
      alternateLocale: l === "it" ? "en_US" : "it_IT",
      images: ogImages,
    },
    robots: { index: true, follow: true },
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = rawLang as Lang;
  const dict = await getDictionary(lang);
  const p = dict.privacy;

  const sections = [
    { title: p.controllerTitle, text: p.controllerText },
    { title: p.dataCollectedTitle, text: p.dataCollectedText },
    { title: p.purposeTitle, text: p.purposeText },
    { title: p.thirdPartyTitle, text: p.thirdPartyText },
    { title: p.retentionTitle, text: p.retentionText },
    { title: p.rightsTitle, text: p.rightsText },
    { title: p.cookiesTitle, text: p.cookiesText },
    { title: p.changesTitle, text: p.changesText },
  ];

  return (
    <div className="max-w-3xl" style={{ maxWidth: "65ch" }}>
      <Link href={`/${lang}`} className="back-link mb-8 inline-block">
        ← {dict.article.backToList}
      </Link>

      <h1 className="text-2xl sm:text-3xl mb-2 font-semibold">{p.title}</h1>
      <p className="text-xs mb-8" style={{ color: "var(--color-ink-muted)" }}>
        {p.lastUpdated}
      </p>

      <div className="article-summary">
        <p>{p.intro}</p>

        {sections.map((section, i) => (
          <div key={i}>
            <h2 className="text-lg font-semibold mt-8 mb-2">{section.title}</h2>
            <p>{section.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
