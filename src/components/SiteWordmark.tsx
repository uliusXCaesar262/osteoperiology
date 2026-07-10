import Link from "next/link";
import type { Lang } from "@/lib/types";

interface SiteWordmarkProps {
  lang: Lang;
  /** header = nav bar; hero = landing page */
  size?: "header" | "hero";
  linked?: boolean;
}

/**
 * Text wordmark replacing the raster logo: Playfair "Osteo Perio" +
 * sans-serif "news" badge — echoes the old two-tone mark without the globe.
 */
export default function SiteWordmark({
  lang,
  size = "header",
  linked = true,
}: SiteWordmarkProps) {
  const mark = (
    <span
      className={`site-wordmark site-wordmark--${size}`}
      aria-label="Osteoperionews"
    >
      <span className="site-wordmark__brand" aria-hidden="true">
        <span className="site-wordmark__osteo">Osteo</span>
        <span className="site-wordmark__perio">Perio</span>
      </span>
      <span className="site-wordmark__news" aria-hidden="true">
        news
      </span>
    </span>
  );

  if (!linked) return mark;

  return (
    <Link href={`/${lang}`} className="site-wordmark-link">
      {mark}
    </Link>
  );
}
