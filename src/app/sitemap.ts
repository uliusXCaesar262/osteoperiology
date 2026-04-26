import type { MetadataRoute } from "next";
import { getRecentArticles } from "@/lib/storage";

const SITE_URL = "https://osteoperiology.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { articles } = await getRecentArticles(500);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/en`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
      alternates: {
        languages: { it: `${SITE_URL}/it`, en: `${SITE_URL}/en` },
      },
    },
    {
      url: `${SITE_URL}/it`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
      alternates: {
        languages: { it: `${SITE_URL}/it`, en: `${SITE_URL}/en` },
      },
    },
    {
      url: `${SITE_URL}/en/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: {
        languages: { it: `${SITE_URL}/it/about`, en: `${SITE_URL}/en/about` },
      },
    },
    {
      url: `${SITE_URL}/it/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: {
        languages: { it: `${SITE_URL}/it/about`, en: `${SITE_URL}/en/about` },
      },
    },
  ];

  const articlePages: MetadataRoute.Sitemap = articles.flatMap((article) => {
    const lastMod = new Date(article.fetchedAt);
    return [
      {
        url: `${SITE_URL}/en/articles/${article.slug}`,
        lastModified: lastMod,
        changeFrequency: "monthly" as const,
        priority: 0.8,
        alternates: {
          languages: {
            en: `${SITE_URL}/en/articles/${article.slug}`,
            it: `${SITE_URL}/it/articles/${article.slug}`,
          },
        },
      },
      {
        url: `${SITE_URL}/it/articles/${article.slug}`,
        lastModified: lastMod,
        changeFrequency: "monthly" as const,
        priority: 0.8,
        alternates: {
          languages: {
            en: `${SITE_URL}/en/articles/${article.slug}`,
            it: `${SITE_URL}/it/articles/${article.slug}`,
          },
        },
      },
    ];
  });

  return [...staticPages, ...articlePages];
}
