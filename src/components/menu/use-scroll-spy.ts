"use client";

import * as React from "react";

/**
 * Tracks which category section is currently in view.
 *
 * `root` is null on the public page (the viewport scrolls) and the phone
 * viewport element inside the admin preview — the same component therefore
 * works on both surfaces without branching.
 */
export function useScrollSpy(
  ids: string[],
  root: HTMLElement | null,
  navHeight = 56
): [string | null, (id: string) => void] {
  const [activeId, setActiveId] = React.useState<string | null>(ids[0] ?? null);
  // While a chip-triggered smooth scroll is running, the observer would fight
  // the animation and flicker through every section it passes.
  const lockUntil = React.useRef(0);

  React.useEffect(() => {
    setActiveId((current) => (current && ids.includes(current) ? current : (ids[0] ?? null)));
  }, [ids]);

  React.useEffect(() => {
    if (ids.length === 0) return;

    const visible = new Map<string, boolean>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visible.set(entry.target.id, entry.isIntersecting);
        }
        if (Date.now() < lockUntil.current) return;

        // The last section whose top has passed the nav wins, which matches
        // what the reader perceives as "the section I'm in".
        const current = ids.filter((id) => visible.get(id)).pop();
        if (current) setActiveId(current);
      },
      {
        root,
        rootMargin: `-${navHeight + 16}px 0px -65% 0px`,
        threshold: 0,
      }
    );

    const elements = ids
      .map((id) => (root ?? document).querySelector<HTMLElement>(`#${CSS.escape(id)}`))
      .filter((el): el is HTMLElement => el !== null);

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids, root, navHeight]);

  const scrollTo = React.useCallback(
    (id: string) => {
      const target = (root ?? document).querySelector<HTMLElement>(`#${CSS.escape(id)}`);
      if (!target) return;

      setActiveId(id);
      lockUntil.current = Date.now() + 600;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const behavior: ScrollBehavior = reduced ? "auto" : "smooth";

      if (root) {
        // scrollIntoView would also scroll the outer page; move the container.
        // Measure against the scroller rather than trusting offsetParent.
        const delta = target.getBoundingClientRect().top - root.getBoundingClientRect().top;
        const top = root.scrollTop + delta - navHeight - 8;
        root.scrollTo({ top: Math.max(0, top), behavior });
      } else {
        target.scrollIntoView({ behavior, block: "start" });
      }
    },
    [root, navHeight]
  );

  return [activeId, scrollTo];
}
