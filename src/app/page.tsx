"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Root page: serves as language dispatcher.
 * - Meta refresh sends crawlers to /en (the x-default).
 * - JS detects browser language and redirects to /it if Italian.
 * - noscript provides a visible link for non-JS clients.
 */
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const lang = navigator.language?.startsWith("it") ? "it" : "en";
    router.replace(`/${lang}`);
  }, [router]);

  return (
    <html lang="en">
      <head>
        <meta httpEquiv="refresh" content="0;url=/en" />
        <link rel="canonical" href="https://osteoperionews.bonebenders.com/en" />
      </head>
      <body>
        <noscript>
          <p>
            <a href="/en">English</a> · <a href="/it">Italiano</a>
          </p>
        </noscript>
      </body>
    </html>
  );
}
