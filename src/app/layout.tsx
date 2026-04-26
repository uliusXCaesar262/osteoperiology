import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Osteoperiology",
  description:
    "Curated news from the periodontal and implant literature — Dr. Ernesto Bruschi",
  authors: [{ name: "Dr. Ernesto Bruschi" }],
  alternates: {
    types: {
      "application/rss+xml": "https://osteoperiology.vercel.app/api/feed",
    },
  },
  openGraph: {
    title: "Osteoperiology",
    description:
      "Weekly curated summaries of open access articles in periodontology and dental implantology",
    type: "website",
  },
  verification: {
    google: "P-TyqXVijEz-GwPYFRRAas17YSe5Zkc97sEqz7ofDbM",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
