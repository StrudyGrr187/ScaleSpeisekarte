"use client";

import * as React from "react";
import { Smartphone } from "lucide-react";
import type { PublicMenu } from "@/lib/menu-query";
import { MenuView } from "@/components/menu/menu-view";

/**
 * The guest menu rendered inside a device frame from the exact same components
 * as the public route — the preview cannot drift from reality because there is
 * only one implementation.
 */
export function PhonePreview({
  menu,
  focusedItemId,
}: {
  menu: PublicMenu;
  focusedItemId: string | null;
}) {
  const frameRef = React.useRef<HTMLDivElement>(null);

  // When the owner focuses a field on the left, bring that dish into view on
  // the right and flash it, so the two panels read as one surface.
  React.useEffect(() => {
    if (!focusedItemId) return;
    const root = frameRef.current;
    if (!root) return;

    const target = root.querySelector<HTMLElement>(`[data-preview-item="${focusedItemId}"]`);
    if (!target) return;

    const scroller = root.querySelector<HTMLElement>("[data-preview-scroller]");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (scroller) {
      // offsetTop is relative to the nearest positioned ancestor — here the
      // sticky wrapper, not the scroller — so measure against the scroller.
      const delta = target.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
      const top = scroller.scrollTop + delta - scroller.clientHeight / 2 + target.clientHeight / 2;
      scroller.scrollTo({ top: Math.max(0, top), behavior: reduced ? "auto" : "smooth" });
    }

    target.classList.remove("preview-flash");
    // Force a reflow so re-adding the class restarts the animation.
    void target.offsetWidth;
    target.classList.add("preview-flash");
  }, [focusedItemId, menu]);

  return (
    <div className="sticky top-6">
      <div className="mb-3 flex items-center gap-2 text-admin-sm font-medium text-admin-muted">
        <Smartphone size={16} strokeWidth={1.75} aria-hidden />
        Gastansicht — live
      </div>

      <div
        ref={frameRef}
        className="mx-auto w-[390px] max-w-full rounded-[42px] bg-[#17181c] p-[10px] shadow-admin-pop"
      >
        <div className="h-[760px] overflow-hidden rounded-[32px] bg-guest-bg">
          <PreviewScroller>
            <MenuView menu={menu} embedded />
          </PreviewScroller>
        </div>
      </div>
    </div>
  );
}

/**
 * MenuView owns its own scroll container when embedded; this marks it so the
 * focus-follow effect above can find it without reaching into MenuView's DOM.
 */
function PreviewScroller({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const scroller = ref.current?.querySelector<HTMLElement>(".overflow-y-auto");
    scroller?.setAttribute("data-preview-scroller", "");
  }, []);

  return (
    <div ref={ref} className="h-full">
      {children}
    </div>
  );
}
