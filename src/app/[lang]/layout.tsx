import type { Lang } from "@/lib/types";
import { getDictionary } from "@/i18n/config";
import { languages } from "@/i18n/config";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LangSetter from "@/components/LangSetter";
import CookieBanner from "@/components/CookieBanner";

export async function generateStaticParams() {
  return languages.map((lang) => ({ lang }));
}

export default async function LangLayout({
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
    <>
      <LangSetter lang={lang} />
      <Header lang={lang} dict={dict} />
      <main className="flex-1 w-full max-w-3xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        {children}
      </main>
      <Footer dict={dict} lang={lang} />
      <CookieBanner lang={lang} dict={dict.cookie as never} />
    </>
  );
}
