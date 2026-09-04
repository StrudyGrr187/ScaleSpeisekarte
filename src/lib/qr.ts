import "server-only";

import QRCode from "qrcode";

/**
 * QR codes encode the public menu URL and nothing else, so a printed plate stays
 * valid for the life of the slug — which is exactly what makes them sellable.
 */

const OPTIONS = {
  // Level M survives a scuffed table sticker without inflating the module count.
  errorCorrectionLevel: "M" as const,
  margin: 2,
};

export async function qrDataUrl(url: string, size = 640): Promise<string> {
  return QRCode.toDataURL(url, {
    ...OPTIONS,
    width: size,
    color: { dark: "#1a1614", light: "#ffffff" },
  });
}

/** Vector output — the format a print shop actually wants. */
export async function qrSvg(url: string): Promise<string> {
  return QRCode.toString(url, {
    ...OPTIONS,
    type: "svg",
    color: { dark: "#1a1614", light: "#ffffff" },
  });
}
