interface FooterProps {
  dict: Record<string, Record<string, string>>;
}

export default function Footer({ dict }: FooterProps) {
  return (
    <footer className="site-footer mt-auto py-8 text-center text-xs">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 space-y-2" style={{ color: "var(--color-ink-muted)" }}>
        <p>{dict.footer.disclaimer}</p>
        <p>
          {dict.footer.poweredBy} ·{" "}
          <a href="https://bonebenders.com" target="_blank" rel="noopener noreferrer">
            bonebenders.com
          </a>{" "}
          ·{" "}
          <a href="https://dentipiu.it" target="_blank" rel="noopener noreferrer">
            dentipiu.it
          </a>
        </p>
      </div>
    </footer>
  );
}
