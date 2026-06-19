import type { MetadataRoute } from "next";
import { getRecentArticles } from "@/lib/storage";
import { SITE_URL } from "@/lib/constants";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const { articles } = getRecentArticles(500);

  // Real freshness dates instead of build time, so engines can trust the
  // lastmod signal. Home/hubs advance only when the newest article changes;
  // about/privacy carry the date their copy was last edited.
  const latest = articles.length
    ? new Date(Math.max(...articles.map((a) => new Date(a.fetchedAt).getTime())))
    : new Date();
  const CONTENT_LAST_EDIT = new Date("2026-06-14");

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: latest,
      changeFrequency: "weekly",
      priority: 1.0,
      alternates: {
        languages: {
          it: `${SITE_URL}/it`,
          en: `${SITE_URL}/en`,
          "x-default": `${SITE_URL}/en`,
        },
      },
    },
    {
      url: `${SITE_URL}/en`,
      lastModified: latest,
      changeFrequency: "weekly",
      priority: 1.0,
      alternates: {
        languages: {
          en: `${SITE_URL}/en`,
          it: `${SITE_URL}/it`,
          "x-default": `${SITE_URL}/en`,
        },
      },
    },
    {
      url: `${SITE_URL}/it`,
      lastModified: latest,
      changeFrequency: "weekly",
      priority: 1.0,
      alternates: {
        languages: {
          en: `${SITE_URL}/en`,
          it: `${SITE_URL}/it`,
          "x-default": `${SITE_URL}/en`,
        },
      },
    },
    {
      url: `${SITE_URL}/en/articles`,
      lastModified: latest,
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: {
        languages: {
          en: `${SITE_URL}/en/articles`,
          it: `${SITE_URL}/it/articles`,
          "x-default": `${SITE_URL}/en/articles`,
        },
      },
    },
    {
      url: `${SITE_URL}/it/articles`,
      lastModified: latest,
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: {
        languages: {
          en: `${SITE_URL}/en/articles`,
          it: `${SITE_URL}/it/articles`,
          "x-default": `${SITE_URL}/en/articles`,
        },
      },
    },
    {
      url: `${SITE_URL}/en/about`,
      lastModified: CONTENT_LAST_EDIT,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: {
        languages: {
          en: `${SITE_URL}/en/about`,
          it: `${SITE_URL}/it/about`,
          "x-default": `${SITE_URL}/en/about`,
        },
      },
    },
    {
      url: `${SITE_URL}/it/about`,
      lastModified: CONTENT_LAST_EDIT,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: {
        languages: {
          en: `${SITE_URL}/en/about`,
          it: `${SITE_URL}/it/about`,
          "x-default": `${SITE_URL}/en/about`,
        },
      },
    },
    {
      url: `${SITE_URL}/en/privacy`,
      lastModified: CONTENT_LAST_EDIT,
      changeFrequency: "yearly",
      priority: 0.3,
      alternates: {
        languages: {
          en: `${SITE_URL}/en/privacy`,
          it: `${SITE_URL}/it/privacy`,
          "x-default": `${SITE_URL}/en/privacy`,
        },
      },
    },
    {
      url: `${SITE_URL}/it/privacy`,
      lastModified: CONTENT_LAST_EDIT,
      changeFrequency: "yearly",
      priority: 0.3,
      alternates: {
        languages: {
          en: `${SITE_URL}/en/privacy`,
          it: `${SITE_URL}/it/privacy`,
          "x-default": `${SITE_URL}/en/privacy`,
        },
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
            "x-default": `${SITE_URL}/en/articles/${article.slug}`,
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
            "x-default": `${SITE_URL}/en/articles/${article.slug}`,
          },
        },
      },
    ];
  });

  return [...staticPages, ...articlePages];
}
