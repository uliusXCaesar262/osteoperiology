interface FooterProps {
  dict: Record<string, Record<string, string>>;
}

export default function Footer({ dict }: FooterProps) {
  return (
    <footer
      className="border-t mt-auto py-6 text-center text-xs"
      style={{
        borderColor: "var(--color-border)",
        color: "var(--color-ink-light)",
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-2">
        <p>{dict.footer.disclaimer}</p>
        <p>
          {dict.footer.poweredBy} ·{" "}
          <a
            href="https://bonebenders.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            bonebenders.com
          </a>{" "}
          ·{" "}
          <a
            href="https://dentipiu.it"
            target="_blank"
            rel="noopener noreferrer"
          >
            dentipiu.it
          </a>
        </p>
      </div>
    </footer>
  );
}
