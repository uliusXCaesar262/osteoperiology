import Link from "next/link";
import type { Lang } from "@/lib/types";
import NewsletterForm from "./NewsletterForm";

interface FooterProps {
  dict: Record<string, Record<string, string>>;
  lang: Lang;
}

export default function Footer({ dict, lang }: FooterProps) {
  return (
    <footer className="site-footer mt-auto py-8 text-center text-xs">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 space-y-6">
        <NewsletterForm lang={lang} dict={dict.footer as never} />
        <div className="space-y-2">
          <p>{dict.footer.disclaimer}</p>
          <p>
            <Link href={`/${lang}/privacy`} className="footer-link">
              {dict.footer.privacy}
            </Link>
            {" · "}
            <a href="https://bonebenders.com" target="_blank" rel="noopener noreferrer">
              bonebenders.com
            </a>
            {" · "}
            <a href="https://dentipiu.it" target="_blank" rel="noopener noreferrer">
              dentipiu.it
            </a>
          </p>
        </div>

        {/* Titolare del sito — identificazione professionale (persona fisica,
            Legge Balduzzi). NON i dati della clinica: il sito è personale. */}
        <address
          className="not-italic space-y-1 leading-relaxed"
          style={{ color: "var(--color-ink-secondary)" }}
        >
          <p style={{ color: "var(--color-ink)", fontWeight: 500 }}>
            Dr. Ernesto Bruschi — Medico Odontoiatra
          </p>
          <p>
            Iscrizione all&apos;Albo degli Odontoiatri di Frosinone n. 594 ·
            P.IVA 02316180609
          </p>
        </address>
      </div>
    </footer>
  );
}
