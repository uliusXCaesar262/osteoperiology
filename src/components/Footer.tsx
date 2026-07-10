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

        {/* Titolare del sito / informazioni sanitarie obbligatorie (Italia) */}
        <address
          className="not-italic space-y-1 leading-relaxed"
          style={{ color: "var(--color-ink-secondary)" }}
        >
          <p style={{ color: "var(--color-ink)", fontWeight: 500 }}>
            Denti+ Centro Odontoiatrico del Dott. Ernesto Bruschi
          </p>
          <p>
            Corso Lazio 17, Scala B, 2° Piano · 03100 Frosinone (FR) · Tel.{" "}
            <a href="tel:+390775889009" className="footer-link">
              +39 0775 889009
            </a>{" "}
            · Lun–Ven 10:00–18:00
          </p>
          <p>
            P.IVA 15092531001 · Direttore Sanitario: Dr. Ernesto Bruschi —
            Odontoiatra
          </p>
          <p>
            Iscrizione all&apos;Albo degli Odontoiatri di Frosinone n. 594 ·
            Autorizzazione sanitaria n. 406946 del 15/06/2020
          </p>
        </address>
      </div>
    </footer>
  );
}
