"use client";

import { useEffect } from "react";

/**
 * Sets the `lang` attribute on <html> to match the current route language.
 * Needed because the root layout can't access dynamic route params.
 */
export default function LangSetter({ lang }: { lang: string }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return null;
}
