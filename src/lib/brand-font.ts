import { Schibsted_Grotesk } from "next/font/google";

/**
 * The one product typeface (design/DESIGN.md). Declared outside the root layout
 * on purpose: only routes that import it preload it, so guests opening a menu
 * never download it. Put `brandFont.variable` on the route's wrapper and use the
 * `font-grotesk` utility.
 */
export const brandFont = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-schibsted",
  display: "swap",
});
