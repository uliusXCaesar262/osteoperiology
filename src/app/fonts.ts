import { Inter, Lora } from "next/font/google";

/**
 * Shared font instances. Defined once and imported by every root layout
 * (`(home)` and `[lang]`) so the CSS variables stay identical across the
 * multiple-root-layout setup.
 */
export const inter = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const lora = Lora({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  display: "swap",
});
