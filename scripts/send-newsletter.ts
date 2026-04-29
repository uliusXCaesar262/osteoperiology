/**
 * Sends a weekly newsletter via Brevo API with the latest articles.
 * Called by GitHub Actions after update-articles adds new content.
 *
 * Env vars required:
 *   BREVO_API_KEY    — Brevo API key
 *   BREVO_LIST_ID    — Brevo contact list ID for Osteoperionews
 *   BREVO_SENDER_EMAIL — Sender email (must be verified in Brevo)
 *   BREVO_SENDER_NAME  — Sender display name
 */

import fs from "fs";
import path from "path";

const ARTICLES_PATH = path.join(process.cwd(), "content", "articles.json");
const SITE_URL = "https://osteoperionews.bonebenders.com";

interface Article {
  pmid: string;
  title: string;
  titleIt?: string;
  authors: string[];
  journal: string;
  pubDate: string;
  summaryEn: string;
  summaryIt: string;
  slug: string;
  fetchedAt: string;
}

interface ArticlesStore {
  lastUpdated: string;
  articles: Article[];
}

function getNewArticles(): Article[] {
  const raw = fs.readFileSync(ARTICLES_PATH, "utf-8");
  const store: ArticlesStore = JSON.parse(raw);

  // Articles fetched in the last 2 days (covers the weekly update window)
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 2);

  return store.articles.filter(
    (a) => new Date(a.fetchedAt) > cutoff
  );
}

function buildEmailHtml(articles: Article[], lang: "en" | "it"): string {
  const isIt = lang === "it";
  const heading = isIt ? "Nuovi articoli della settimana" : "This week's new articles";
  const readMore = isIt ? "Leggi il riassunto" : "Read the summary";
  const footer = isIt
    ? "Ricevi questa email perché sei iscritto a Osteoperionews."
    : "You receive this email because you subscribed to Osteoperionews.";

  const articleBlocks = articles
    .map((a) => {
      const title = isIt && a.titleIt ? a.titleIt : a.title.replace(/<[^>]+>/g, "");
      const summary = (isIt ? a.summaryIt : a.summaryEn).slice(0, 200) + "...";
      const url = `${SITE_URL}/${lang}/articles/${a.slug}`;

      return `
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #e8e8e6;">
          <p style="margin: 0 0 4px; font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">${a.journal}</p>
          <p style="margin: 0 0 6px; font-size: 16px; font-weight: 600; color: #1c1c1c; line-height: 1.3;">${title}</p>
          <p style="margin: 0 0 8px; font-size: 13px; color: #4a4a4a; line-height: 1.5;">${summary}</p>
          <a href="${url}" style="font-size: 13px; color: #2c5545; font-weight: 500; text-decoration: none;">${readMore} →</a>
        </td>
      </tr>`;
    })
    .join("");

  return `
<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background: #f7f7f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f7f7f5; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 4px; overflow: hidden;">
          <tr>
            <td style="background: #e8f4f2; padding: 24px 32px; border-bottom: 1px solid #c8ddd9;">
              <h1 style="margin: 0; font-size: 22px; color: #1c1c1c; font-weight: 700;">Osteoperionews</h1>
              <p style="margin: 4px 0 0; font-size: 12px; color: #999;">${heading}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                ${articleBlocks}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 32px; background: #f7f7f5; font-size: 11px; color: #999; text-align: center; line-height: 1.5;">
              <p style="margin: 0 0 8px;">${footer}</p>
              <p style="margin: 0;">
                <a href="${SITE_URL}/${lang}" style="color: #2c5545; text-decoration: none;">osteoperionews.bonebenders.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendNewsletter(articles: Article[]) {
  const apiKey = process.env.BREVO_API_KEY;
  const listId = parseInt((process.env.BREVO_LIST_ID || "0").replace(/\D/g, ""), 10);
  const senderEmail = process.env.BREVO_SENDER_EMAIL || "dott.bruschi@gmail.com";
  const senderName = process.env.BREVO_SENDER_NAME || "Osteoperionews";

  if (!apiKey || !listId) {
    throw new Error("Missing BREVO_API_KEY or BREVO_LIST_ID");
  }

  // Send bilingual: two campaigns — EN and IT
  for (const lang of ["en", "it"] as const) {
    const subject =
      lang === "it"
        ? `Osteoperionews — ${articles.length} nuovi articoli`
        : `Osteoperionews — ${articles.length} new articles`;

    const htmlContent = buildEmailHtml(articles, lang);

    const res = await fetch("https://api.brevo.com/v3/emailCampaigns", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name: `Weekly Update ${new Date().toISOString().slice(0, 10)} (${lang.toUpperCase()})`,
        subject,
        sender: { name: senderName, email: senderEmail },
        htmlContent,
        recipients: { listIds: [listId] },
        // Send immediately
        scheduledAt: new Date(Date.now() + 60_000).toISOString(),
        tag: `weekly-${lang}`,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`[NEWSLETTER] Failed to create ${lang} campaign:`, err);
    } else {
      const data = await res.json();
      console.log(`[NEWSLETTER] Created ${lang} campaign, ID: ${data.id}`);
    }
  }
}

async function main() {
  const newArticles = getNewArticles();

  if (newArticles.length === 0) {
    console.log("[NEWSLETTER] No new articles, skipping newsletter.");
    return;
  }

  console.log(`[NEWSLETTER] Sending newsletter with ${newArticles.length} articles...`);
  await sendNewsletter(newArticles);
  console.log("[NEWSLETTER] Done.");
}

main().catch((err) => {
  console.error("[NEWSLETTER] Fatal error:", err);
  process.exit(1);
});
