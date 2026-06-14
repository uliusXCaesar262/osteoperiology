import type { Metadata } from "next";
import type { Lang } from "@/lib/types";
import { getDictionary, languages } from "@/i18n/config";
import { baseMetadata } from "@/lib/seo";
import RootHtml from "@/components/RootHtml";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import "../globals.css";

/**
 * Root layout for localized routes (`/it/*`, `/en/*`).
 *
 * Part of a multiple-root-layout setup (no single `app/layout.tsx`): this
 * layout owns the <html> shell for the locale subtree and sets `lang`
 * to the real route language server-side. That removes the need for the old
 * client-side `LangSetter` hack — search engines now see the correct
 * `lang` in the raw HTML for both Italian and English.
 */
export const metadata: Metadata = baseMetadata;

export async function generateStaticParams() {
  return languages.map((lang) => ({ lang }));
}

export default async function LangRootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = (languages.includes(rawLang as Lang) ? rawLang : "en") as Lang;
  const dict = await getDictionary(lang);

  return (
    <RootHtml lang={lang}>
      <Header lang={lang} dict={dict} />
      <main className="flex-1 w-full max-w-3xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        {children}
      </main>
      <Footer dict={dict} lang={lang} />
      <CookieBanner lang={lang} dict={dict.cookie as never} />
    </RootHtml>
  );
}
