import type { Metadata } from "next";
import type { Lang } from "@/lib/types";
import { getDictionary } from "@/i18n/config";
import { SEARCH_TOPICS } from "@/lib/types";
import { SITE_URL } from "@/app/layout";

const aboutMeta = {
  en: {
    title: "About Osteoperiology",
    description:
      "Curated open access periodontology and implantology research by Dr. Ernesto Bruschi — periodontist, implantologist, oral surgeon.",
  },
  it: {
    title: "Info — Osteoperiology",
    description:
      "Ricerca open access curata in parodontologia e implantologia dal Dr. Ernesto Bruschi — parodontologo, implantologo, chirurgo orale.",
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
  const url = `${SITE_URL}/${l}/about`;

  return {
    title: aboutMeta[l].title,
    description: aboutMeta[l].description,
    alternates: {
      canonical: url,
      languages: {
        [l]: url,
        [otherLang]: `${SITE_URL}/${otherLang}/about`,
      },
    },
    openGraph: {
      title: aboutMeta[l].title,
      description: aboutMeta[l].description,
      url,
      type: "profile",
      locale: l === "it" ? "it_IT" : "en_US",
      alternateLocale: l === "it" ? "en_US" : "it_IT",
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = rawLang as Lang;
  const dict = await getDictionary(lang);

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl sm:text-4xl mb-8 font-semibold">
        {dict.about.title}
      </h1>

      <div className="article-summary mb-10" style={{ maxWidth: "65ch" }}>
        <p>{dict.about.text}</p>
      </div>

      <div
        className="p-6 rounded-xl mb-10"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <h2 className="text-xl mb-4 font-semibold">{dict.about.topics}</h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {SEARCH_TOPICS.map((t) => (
            <div key={t} className="flex items-center gap-2 text-sm" style={{ color: "var(--color-ink-secondary)" }}>
              <span className="journal-badge" style={{ fontSize: "0.65rem" }}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        className="p-6 rounded-xl mb-10"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <h2 className="text-xl mb-4 font-semibold">{dict.about.curatedBy}</h2>
        <div className="text-sm space-y-1.5" style={{ color: "var(--color-ink-secondary)" }}>
          <p>
            <strong style={{ color: "var(--color-ink)" }}>Dr. Ernesto Bruschi</strong>
          </p>
          <p>Periodontist · Implantologist · Oral Surgeon</p>
          <p>
            ORCID:{" "}
            <a href="https://orcid.org/0000-0002-4773-5384" target="_blank" rel="noopener noreferrer">
              0000-0002-4773-5384
            </a>
          </p>
        </div>
      </div>

      <h2 className="text-xl mb-4 font-semibold">{dict.about.links}</h2>
      <div className="flex flex-wrap gap-3">
        <a href="https://bonebenders.com" target="_blank" rel="noopener noreferrer" className="btn-secondary">
          bonebenders.com — Blog
        </a>
        <a href="https://dentipiu.it" target="_blank" rel="noopener noreferrer" className="btn-secondary">
          dentipiu.it — Studio
        </a>
      </div>
    </div>
  );
}
