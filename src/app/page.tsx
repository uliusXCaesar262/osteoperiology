"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Root page: language dispatcher.
 * JS detects browser language and redirects.
 * noscript provides fallback links.
 */
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const lang = navigator.language?.startsWith("it") ? "it" : "en";
    router.replace(`/${lang}`);
  }, [router]);

  return (
    // eslint-disable-next-line @next/next/no-html-link-for-pages
    <noscript>
      <p>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/en">English</a> · {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/it">Italiano</a>
      </p>
    </noscript>
  );
}
