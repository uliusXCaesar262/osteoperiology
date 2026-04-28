"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

interface NewsletterFormProps {
  lang: string;
  dict: {
    newsletterTitle: string;
    newsletterDesc: string;
    newsletterPlaceholder: string;
    newsletterButton: string;
    newsletterSuccess: string;
    newsletterError: string;
    newsletterConsent: string;
    privacy: string;
  };
}

/**
 * Newsletter subscription form.
 * Calls a Cloudflare Worker that proxies to Brevo API.
 * No API keys in the browser.
 */
const WORKER_URL = process.env.NEXT_PUBLIC_NEWSLETTER_WORKER_URL;

export default function NewsletterForm({ lang, dict }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [consent, setConsent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!consent || !email || !WORKER_URL) return;

    setStatus("loading");
    try {
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, lang }),
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok) {
        setStatus("success");
        setEmail("");
        setConsent(false);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (!WORKER_URL) return null;

  if (status === "success") {
    return (
      <div className="newsletter-form">
        <p className="newsletter-success">{dict.newsletterSuccess}</p>
      </div>
    );
  }

  return (
    <div className="newsletter-form">
      <p className="newsletter-title">{dict.newsletterTitle}</p>
      <p className="newsletter-desc">{dict.newsletterDesc}</p>
      <form onSubmit={handleSubmit} className="newsletter-fields">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={dict.newsletterPlaceholder}
          className="newsletter-input"
          aria-label="Email"
        />
        <button
          type="submit"
          disabled={!consent || status === "loading"}
          className="newsletter-btn"
        >
          {status === "loading" ? "..." : dict.newsletterButton}
        </button>
      </form>
      <label className="newsletter-consent">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        <span>
          {dict.newsletterConsent}{" "}
          <Link href={`/${lang}/privacy`}>{dict.privacy}</Link>
        </span>
      </label>
      {status === "error" && (
        <p className="newsletter-error">{dict.newsletterError}</p>
      )}
    </div>
  );
}
