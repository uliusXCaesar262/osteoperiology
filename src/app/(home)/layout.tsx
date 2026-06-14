import type { Metadata } from "next";
import { baseMetadata } from "@/lib/seo";
import RootHtml from "@/components/RootHtml";
import "../globals.css";

/**
 * Root layout for the bare `/` landing.
 *
 * Part of a multiple-root-layout setup: there is no single `app/layout.tsx`.
 * This layout owns the <html> shell for `/` and declares Italian (the
 * primary audience) as the document language. Localized routes are served by
 * the sibling `[lang]` root layout, which sets `lang` per locale.
 */
export const metadata: Metadata = baseMetadata;

export default function HomeRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <RootHtml lang="it">{children}</RootHtml>;
}
