"use client";

import * as React from "react";
import { UtensilsCrossed } from "lucide-react";
import type { PublicMenu } from "@/lib/menu-query";
import { AllergenLegend } from "@/components/menu/allergen-legend";
import { CategoryIcon } from "@/components/menu/category-icon";
import { CategoryNav } from "@/components/menu/category-nav";
import { MenuFooter } from "@/components/menu/menu-footer";
import { MenuHeader } from "@/components/menu/menu-header";
import { MenuItemRow } from "@/components/menu/menu-item-row";
import { useScrollSpy } from "@/components/menu/use-scroll-spy";
import { accentStyle } from "@/lib/color";
import { fontStyle } from "@/lib/fonts";
import { resolveTheme, themeAttribute } from "@/lib/themes";
import { cn } from "@/lib/utils";

/**
 * The guest menu. Rendered identically on the public route and inside the
 * admin phone preview — `embedded` only switches which element scrolls.
 */
export function MenuView({ menu, embedded = false }: { menu: PublicMenu; embedded?: boolean }) {
  const { restaurant, categories, allergenLegend } = menu;

  const [legendOpen, setLegendOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [scrollRoot, setScrollRoot] = React.useState<HTMLElement | null>(null);

  const scrollerRef = React.useCallback((node: HTMLDivElement | null) => {
    setScrollRoot(node);
  }, []);

  // A category with no visible items renders nothing, so "is this menu empty?"
  // must be asked of the categories that actually have content — otherwise a
  // published menu whose dishes are all hidden shows a blank page.
  const visibleCategories = React.useMemo(
    () => categories.filter((c) => c.items.length > 0),
    [categories]
  );

  const sectionIds = React.useMemo(
    () => visibleCategories.map((c) => `section-${c.id}`),
    [visibleCategories]
  );

  const [activeId, scrollToSection] = useScrollSpy(sectionIds, embedded ? scrollRoot : null);

  // Sentinel just below the header: once it leaves the top, the sticky nav
  // grows its border so it reads as "sitting on" the content.
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    if (embedded && !scrollRoot) return;

    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { root: embedded ? scrollRoot : null, threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [embedded, scrollRoot]);

  const openLegend = React.useCallback(() => setLegendOpen(true), []);
  const hasAllergens = allergenLegend.length > 0;
  // One lookup, one branch: components render by archetype, never by theme name.
  const archetype = resolveTheme(restaurant.menuTheme).archetype;
  const classic = archetype === "print";

  const content = (
    <>
      <MenuHeader restaurant={restaurant} archetype={archetype} />
      <div ref={sentinelRef} aria-hidden className={classic ? "h-4" : "h-9"} />

      <CategoryNav
        categories={visibleCategories}
        activeId={activeId}
        onSelect={scrollToSection}
        scrolled={scrolled}
        archetype={archetype}
        onOpenLegend={openLegend}
        hasAllergens={hasAllergens}
      />

      <main className="px-gutter">
        {visibleCategories.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-16 text-center">
            <span
              className="flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand-text"
              aria-hidden
            >
              <UtensilsCrossed size={22} strokeWidth={1.75} />
            </span>
            <p className="mt-4 font-display text-cat text-guest-ink">Karte in Arbeit</p>
            <p className="mt-2 max-w-[280px] text-body text-guest-muted">
              Diese Speisekarte wird gerade zusammengestellt und ist gleich für Sie da.
            </p>
          </div>
        ) : (
          visibleCategories.map((category, categoryIndex) => {
            return (
              <section
                key={category.id}
                id={`section-${category.id}`}
                data-menu-section
                className="pt-section first:pt-8"
              >
                {classic ? (
                  <>
                    <h2 className="text-center font-display text-cat text-guest-ink uppercase">
                      {category.name}
                    </h2>
                    <div className="rule-ornament mt-3" aria-hidden>
                      <i />
                    </div>
                    {category.description ? (
                      <p className="mx-auto mt-3 max-w-[34ch] text-center text-body italic text-guest-ink-2">
                        {category.description}
                      </p>
                    ) : null}
                  </>
                ) : (
                  <>
                    <h2 className="flex items-center gap-2 font-display text-cat text-guest-ink">
                      <CategoryIcon icon={category.icon} size={18} className="text-brand-text" />
                      {category.name}
                    </h2>
                    <span className="mt-2 block h-px w-10 bg-brand" aria-hidden />
                    {category.description ? (
                      <p className="mt-3 text-body text-guest-muted">{category.description}</p>
                    ) : null}
                  </>
                )}

                <div className={classic ? "mt-6" : "mt-4"}>
                  {category.items.map((item, itemIndex) => (
                    <MenuItemRow
                      key={item.id}
                      item={item}
                      currency={restaurant.currency}
                      locale={restaurant.locale}
                      archetype={archetype}
                      onAllergenClick={openLegend}
                      priority={categoryIndex === 0 && itemIndex < 2}
                    />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </main>

      <MenuFooter
        restaurant={restaurant}
        archetype={archetype}
        onOpenLegend={openLegend}
        hasAllergens={hasAllergens}
        hasFeatured={categories.some((c) => c.items.some((i) => i.featured && i.available))}
      />

      <AllergenLegend
        open={legendOpen}
        onClose={() => setLegendOpen(false)}
        allergens={allergenLegend}
      />
    </>
  );

  return (
    <div
      data-guest-root
      data-guest-theme={themeAttribute(restaurant.menuTheme)}
      style={
        {
          ...accentStyle(restaurant.primaryColor, restaurant.menuTheme),
          ...fontStyle(restaurant.fontPair, archetype),
        } as React.CSSProperties
      }
      className={cn(
        "bg-guest-bg font-sans text-guest-ink",
        embedded ? "h-full overflow-hidden" : "min-h-dvh"
      )}
    >
      {embedded ? (
        <div ref={scrollerRef} className="no-scrollbar h-full overflow-y-auto overscroll-contain">
          <div className="mx-auto max-w-menu">{content}</div>
        </div>
      ) : (
        <div className="mx-auto max-w-menu">{content}</div>
      )}
    </div>
  );
}
