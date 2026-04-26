import type { Lang } from "@/lib/types";
import { getDictionary } from "@/i18n/config";
import { getRecentArticles } from "@/lib/storage";
import ArticleCard from "@/components/ArticleCard";

export const revalidate = 3600; // Revalidate every hour

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const { articles } = await getRecentArticles(20);

  return (
    <div>
      <h2
        className="text-xl sm:text-2xl mb-8"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        {dict.home.latestArticles}
      </h2>

      {articles.length === 0 ? (
        <div
          className="text-center py-16 rounded-lg"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <p
            className="text-lg"
            style={{
              fontFamily: "'Georgia', serif",
              color: "var(--color-ink-light)",
            }}
          >
            {dict.home.noArticles}
          </p>
        </div>
      ) : (
        <div>
          {articles.map((article) => (
            <ArticleCard
              key={article.pmid}
              article={article}
              lang={lang}
              readMore={dict.home.readMore}
              publishedIn={dict.home.publishedIn}
            />
          ))}
        </div>
      )}
    </div>
  );
}
