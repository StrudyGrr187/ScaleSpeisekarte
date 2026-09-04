"use client";

import * as React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Downloads the QR code without a server round trip. SVG is what a print shop
 * wants; PNG is what people paste into a flyer.
 */
export function QrDownload({
  pngDataUrl,
  svg,
  filename,
}: {
  pngDataUrl: string;
  svg: string;
  filename: string;
}) {
  const download = (href: string, extension: string) => {
    const link = document.createElement("a");
    link.href = href;
    link.download = `${filename}.${extension}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => download(pngDataUrl, "png")}>
        <Download size={16} strokeWidth={1.75} aria-hidden />
        PNG herunterladen
      </Button>
      <Button
        variant="secondary"
        onClick={() => {
          const blob = new Blob([svg], { type: "image/svg+xml" });
          const url = URL.createObjectURL(blob);
          download(url, "svg");
          // Revoke after the click has been handled.
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }}
      >
        <Download size={16} strokeWidth={1.75} aria-hidden />
        SVG für den Druck
      </Button>
    </div>
  );
}
