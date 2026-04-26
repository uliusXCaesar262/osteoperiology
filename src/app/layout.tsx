import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Osteoperiology",
  description:
    "Curated news from the periodontal and implant literature — Dr. Ernesto Bruschi",
  authors: [{ name: "Dr. Ernesto Bruschi" }],
  openGraph: {
    title: "Osteoperiology",
    description:
      "Weekly AI-curated summaries of open access articles in periodontology and dental implantology",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
