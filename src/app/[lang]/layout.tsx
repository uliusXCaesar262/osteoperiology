import type { Lang } from "@/lib/types";
import { getDictionary } from "@/i18n/config";
import { languages } from "@/i18n/config";
import { Inter, Lora } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  display: "swap",
});

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
    <html lang={lang} className={`h-full antialiased ${inter.variable} ${lora.variable}`}>
      <head>
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
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
