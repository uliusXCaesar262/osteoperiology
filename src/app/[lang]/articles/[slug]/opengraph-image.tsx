import { ImageResponse } from "next/og";
import { getArticleBySlug } from "@/lib/storage";
import { displayTitle } from "@/lib/article";
import type { Lang } from "@/lib/types";
import { getAllSlugs } from "@/lib/storage";

export function generateStaticParams() {
  const slugs = getAllSlugs();
  if (slugs.length === 0) {
    return [
      { lang: "it", slug: "_placeholder" },
      { lang: "en", slug: "_placeholder" },
    ];
  }
  return slugs.flatMap((slug) => [
    { lang: "it", slug },
    { lang: "en", slug },
  ]);
}

export const alt = "Osteoperionews Article";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return new ImageResponse(
      (
        <div
          style={{
            background: "#065f46",
            width: "100%",
            height: "100%",
            display: "flex",
          }}
        />
      ),
      { ...size }
    );
  }

  const title = displayTitle(article, lang as Lang);
  const authorsText =
    article.authors.slice(0, 3).join(", ") +
    (article.authors.length > 3 ? " et al." : "");

  return new ImageResponse(
    (
      <div
        style={{
          background: "#065f46", // var(--color-accent) emerald-800
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          color: "white",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 24,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "#6ee7b7", // emerald-300
              display: "flex",
              marginBottom: 20,
            }}
          >
            OSTEOPERIONEWS • {article.journal.toUpperCase()}
          </div>

          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              lineHeight: 1.2,
              display: "flex",
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            fontSize: 32,
            color: "#a7f3d0", // emerald-200
            display: "flex",
          }}
        >
          {authorsText}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
