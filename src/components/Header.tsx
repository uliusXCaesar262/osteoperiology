import Link from "next/link";
import type { Lang } from "@/lib/types";

interface HeaderProps {
  lang: Lang;
  dict: Record<string, Record<string, string>>;
}

export default function Header({ lang, dict }: HeaderProps) {
  const otherLang = lang === "en" ? "it" : "en";

  return (
    <header className="site-header w-full">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-7 sm:py-10 flex items-end justify-between">
        <div>
          <Link href={`/${lang}`}>
            <h1 className="text-3xl sm:text-4xl tracking-tight font-semibold">
              {dict.site.title}
            </h1>
          </Link>
          <p className="text-sm mt-2 opacity-75 font-light">
            {dict.site.subtitle} — {dict.site.author}
          </p>
        </div>
        <nav className="flex items-center gap-5 text-sm">
          <Link href={`/${lang}`} className="nav-link hidden sm:inline">
            {dict.nav.home}
          </Link>
          <Link href={`/${lang}/about`} className="nav-link">
            {dict.nav.about}
          </Link>
          <a
            href="/api/feed"
            target="_blank"
            rel="noopener noreferrer"
            className="rss-link"
            title="RSS Feed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <circle cx="6.18" cy="17.82" r="2.18" />
              <path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z" />
            </svg>
          </a>
          <Link
            href={`/${otherLang}`}
            className="lang-switch px-2.5 py-1 rounded text-xs font-semibold tracking-wider"
          >
            {dict.nav.language}
          </Link>
        </nav>
      </div>
    </header>
  );
}
