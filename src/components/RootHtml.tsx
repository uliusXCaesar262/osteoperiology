import { inter, lora } from "@/app/fonts";
import { siteJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/constants";

/**
 * Shared <html>/<head>/<body> shell used by both root layouts
 * (`(home)` for `/` and `[lang]` for localized routes). Centralizing it
 * keeps the head identical across the multiple-root-layout setup; only the
 * `lang` attribute varies, which is the whole point — each locale subtree
 * now declares its real language server-side (no client-side patch).
 */
export default function RootHtml({
  lang,
  children,
}: {
  lang: string;
  children: React.ReactNode;
}) {
  return (
    <html
      lang={lang}
      className={`h-full antialiased ${inter.variable} ${lora.variable}`}
    >
      <head>
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Osteoperionews (EN)"
          href={`${SITE_URL}/feed.xml`}
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Osteoperionews (IT)"
          href={`${SITE_URL}/feed-it.xml`}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <a href="#main" className="skip-link">
          {lang === "en" ? "Skip to main content" : "Vai al contenuto principale"}
        </a>
        {children}
      </body>
    </html>
  );
}
