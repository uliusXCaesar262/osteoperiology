import type { Lang } from "@/lib/types";
import { getDictionary } from "@/i18n/config";
import { getRecentArticles } from "@/lib/storage";
import ArticleCard from "@/components/ArticleCard";

export const revalidate = 3600;

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = rawLang as Lang;
  const dict = await getDictionary(lang);
  const { articles } = await getRecentArticles(20);

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl mb-8 font-semibold">
        {dict.home.latestArticles}
      </h2>

      {articles.length === 0 ? (
        <div className="empty-state text-center">
          <div className="text-4xl mb-4">📚</div>
          <p className="text-lg mb-2" style={{ color: "var(--color-ink-secondary)" }}>
            {dict.home.noArticles}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
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
