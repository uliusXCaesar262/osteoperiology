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
