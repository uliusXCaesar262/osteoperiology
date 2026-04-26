import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/cron", "/api/articles"],
      },
    ],
    sitemap: "https://osteoperiology.vercel.app/sitemap.xml",
  };
}
