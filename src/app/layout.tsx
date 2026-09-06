import type { Metadata, Viewport } from "next";
import {
  Cinzel,
  Cormorant_Garamond,
  EB_Garamond,
  DM_Sans,
  DM_Serif_Display,
  Fraunces,
  Inter,
  Karla,
  Lato,
  Libre_Bodoni,
  Nunito_Sans,
  Oswald,
  Outfit,
  Playfair_Display,
  Public_Sans,
  Space_Grotesk,
  Varela_Round,
  Work_Sans,
} from "next/font/google";
import "./globals.css";

/**
 * All selectable pairings (see src/lib/fonts.ts) are declared here so next/font
 * self-hosts them. Only the default pair is preloaded; the browser fetches a
 * non-default face only when a tenant actually uses it, so the extra choices
 * cost CSS, not bandwidth.
 */
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-playfair",
  display: "swap",
});

const karla = Karla({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-karla",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-cormorant",
  display: "swap",
  preload: false,
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato",
  display: "swap",
  preload: false,
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-fraunces",
  display: "swap",
  preload: false,
});

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-worksans",
  display: "swap",
  preload: false,
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-dmserif",
  display: "swap",
  preload: false,
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dmsans",
  display: "swap",
  preload: false,
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-outfit",
  display: "swap",
  preload: false,
});

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-oswald",
  display: "swap",
  preload: false,
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
  preload: false,
});

const libreBodoni = Libre_Bodoni({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-librebodoni",
  display: "swap",
  preload: false,
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-publicsans",
  display: "swap",
  preload: false,
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-cinzel",
  display: "swap",
  preload: false,
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-spacegrotesk",
  display: "swap",
  preload: false,
});

const varelaRound = Varela_Round({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-varelaround",
  display: "swap",
  preload: false,
});

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-nunitosans",
  display: "swap",
  preload: false,
});

/**
 * The book serif for the `print` archetype. A Didone display face — Playfair, Libre
 * Bodoni — has hairlines that break down at 17px on a phone in restaurant
 * light, so the printed look carries name, description and price in one true
 * text serif instead.
 */
const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-eb-garamond",
  display: "swap",
  preload: false,
});

const FONT_VARIABLES = [
  playfair.variable,
  karla.variable,
  cormorant.variable,
  lato.variable,
  fraunces.variable,
  workSans.variable,
  dmSerif.variable,
  dmSans.variable,
  outfit.variable,
  oswald.variable,
  inter.variable,
  libreBodoni.variable,
  publicSans.variable,
  cinzel.variable,
  spaceGrotesk.variable,
  varelaRound.variable,
  nunitoSans.variable,
  ebGaramond.variable,
].join(" ");

export const metadata: Metadata = {
  title: {
    default: "ScaleSpeisekarte",
    template: "%s · ScaleSpeisekarte",
  },
  description:
    "Digitale Speisekarten für Restaurants, Cafés und Bars — per QR-Code und NFC direkt auf das Handy des Gastes.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // No maximum-scale: guests must be able to zoom the menu.
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={FONT_VARIABLES}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
