import type { Lang } from "@/lib/types";
import { getDictionary } from "@/i18n/config";
import { languages } from "@/i18n/config";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
    <html lang={lang} className="h-full antialiased">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Header lang={lang} dict={dict} />
        <main className="flex-1 w-full max-w-3xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
          {children}
        </main>
        <Footer dict={dict} />
      </body>
    </html>
  );
}
