"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface CookieBannerProps {
  lang: string;
  dict: {
    message: string;
    accept: string;
    reject: string;
    learnMore: string;
  };
}

function getCookieConsent(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)cookie_consent=([^;]*)/);
  return match ? match[1] : null;
}

function setCookieConsent(value: "accepted" | "rejected") {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  document.cookie = `cookie_consent=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

export default function CookieBanner({ lang, dict }: CookieBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = getCookieConsent();
    if (!consent) setVisible(true);
  }, []);

  function handleAccept() {
    setCookieConsent("accepted");
    setVisible(false);
  }

  function handleReject() {
    setCookieConsent("rejected");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookie consent">
      <div className="cookie-banner-inner">
        <p className="cookie-message">
          {dict.message}{" "}
          <Link href={`/${lang}/privacy`} className="cookie-learn-more">
            {dict.learnMore}
          </Link>
        </p>
        <div className="cookie-buttons">
          <button onClick={handleReject} className="cookie-btn-reject">
            {dict.reject}
          </button>
          <button onClick={handleAccept} className="cookie-btn-accept">
            {dict.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
