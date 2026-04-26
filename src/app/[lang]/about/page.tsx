import type { Lang } from "@/lib/types";
import { getDictionary } from "@/i18n/config";
import { SUPPORTED_JOURNALS } from "@/lib/types";

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
      <h1
        className="text-2xl sm:text-3xl mb-6"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        {dict.about.title}
      </h1>

      <div
        className="article-summary mb-8"
        style={{ maxWidth: "65ch" }}
      >
        <p>{dict.about.text}</p>
      </div>

      <h2
        className="text-lg mb-3"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        {dict.about.journals}
      </h2>
      <ul className="mb-8 space-y-1 text-sm" style={{ color: "var(--color-ink-light)" }}>
        {SUPPORTED_JOURNALS.map((j) => (
          <li key={j}>— {j}</li>
        ))}
      </ul>

      <h2
        className="text-lg mb-3"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        {dict.about.curatedBy}
      </h2>
      <div className="text-sm space-y-1 mb-8" style={{ color: "var(--color-ink-light)" }}>
        <p>
          <strong style={{ color: "var(--color-ink)" }}>Dr. Ernesto Bruschi</strong>
        </p>
        <p>Periodontist, Implantologist, Oral Surgeon</p>
        <p>
          ORCID:{" "}
          <a
            href="https://orcid.org/0000-0002-4773-5384"
            target="_blank"
            rel="noopener noreferrer"
          >
            0000-0002-4773-5384
          </a>
        </p>
      </div>

      <h2
        className="text-lg mb-3"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        {dict.about.links}
      </h2>
      <div className="text-sm space-y-1">
        <p>
          <a href="https://bonebenders.com" target="_blank" rel="noopener noreferrer">
            bonebenders.com
          </a>{" "}
          — Blog
        </p>
        <p>
          <a href="https://dentipiu.it" target="_blank" rel="noopener noreferrer">
            dentipiu.it
          </a>{" "}
          — Studio
        </p>
      </div>
    </div>
  );
}
