import Link from "next/link";
import type { Lang } from "@/lib/types";

interface HeaderProps {
  lang: Lang;
  dict: Record<string, Record<string, string>>;
}

export default function Header({ lang, dict }: HeaderProps) {
  const otherLang = lang === "en" ? "it" : "en";

  return (
    <header
      className="border-b w-full"
      style={{
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-surface)",
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
        <div>
          <Link href={`/${lang}`}>
            <h1
              className="text-2xl sm:text-3xl tracking-tight"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              {dict.site.title}
            </h1>
          </Link>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--color-ink-light)" }}
          >
            {dict.site.subtitle} — {dict.site.author}
          </p>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href={`/${lang}`}
            className="hidden sm:inline"
          >
            {dict.nav.home}
          </Link>
          <Link href={`/${lang}/about`}>{dict.nav.about}</Link>
          <Link
            href={`/${otherLang}`}
            className="px-2 py-1 rounded text-xs font-semibold tracking-wide"
            style={{
              border: "1px solid var(--color-border)",
              color: "var(--color-ink-light)",
            }}
          >
            {dict.nav.language}
          </Link>
        </nav>
      </div>
    </header>
  );
}
