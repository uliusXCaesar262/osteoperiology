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
 * Newsletter subscription form using Brevo REST API.
 * Uses NEXT_PUBLIC_BREVO_API_KEY (scoped to contact creation)
 * and NEXT_PUBLIC_BREVO_LIST_ID, both injected at build time.
 */
export default function NewsletterForm({ lang, dict }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [consent, setConsent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!consent || !email) return;

    const apiKey = process.env.NEXT_PUBLIC_BREVO_API_KEY;
    const listId = parseInt(process.env.NEXT_PUBLIC_BREVO_LIST_ID || "0", 10);

    if (!apiKey || !listId) {
      setStatus("error");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("https://api.brevo.com/v3/contacts", {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email,
          listIds: [listId],
          attributes: { LANG: lang.toUpperCase() },
          updateEnabled: true,
        }),
      });

      if (res.ok || res.status === 201 || res.status === 204) {
        setStatus("success");
        setEmail("");
        setConsent(false);
      } else {
        const data = await res.json().catch(() => null);
        // "Contact already exist" is not an error for the user
        if (data?.code === "duplicate_parameter") {
          setStatus("success");
          setEmail("");
          setConsent(false);
        } else {
          setStatus("error");
        }
      }
    } catch {
      setStatus("error");
    }
  }

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
