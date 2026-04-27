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
    <noscript>
      <p>
        <a href="/en">English</a> · <a href="/it">Italiano</a>
      </p>
    </noscript>
  );
}
