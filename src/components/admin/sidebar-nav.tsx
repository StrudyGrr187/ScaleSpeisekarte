"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Palette,
  Sparkles,
  LogOut,
  Menu as MenuIcon,
  QrCode,
  Settings,
  Store,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  /** Hidden while no Claude key is configured — the page would be a dead end. */
  needsAi?: boolean;
};

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/builder", label: "Speisekarte", icon: UtensilsCrossed },
  { href: "/admin/import", label: "Karte importieren", icon: Sparkles, needsAi: true },
  { href: "/admin/design", label: "Design", icon: Palette },
  { href: "/admin/restaurant", label: "Restaurant", icon: Store },
  { href: "/admin/qr", label: "QR & NFC", icon: QrCode },
  { href: "/admin/settings", label: "Einstellungen", icon: Settings },
];

export function SidebarNav({
  restaurantName,
  email,
  aiReady,
}: {
  restaurantName: string;
  email: string;
  aiReady: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  // A navigation should never leave the drawer covering the page it opened.
  React.useEffect(() => setOpen(false), [pathname]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Navigation öffnen"
        aria-expanded={open}
        className="fixed top-3 left-3 z-30 flex size-10 items-center justify-center rounded-admin border border-admin-border bg-admin-surface text-admin-ink-2 shadow-admin-card lg:hidden"
      >
        <MenuIcon size={18} strokeWidth={1.75} aria-hidden />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-40 bg-guest-overlay lg:hidden motion-safe:animate-[fade-in_var(--dur-base)_ease-out]"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[264px] flex-col border-r border-admin-border bg-admin-surface",
          "transition-transform duration-[220ms] ease-[var(--ease-out-soft)] lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-[60px] items-center justify-between gap-2 px-4">
          <Link href="/admin" className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-admin bg-admin-primary text-white">
              <UtensilsCrossed size={16} strokeWidth={2} aria-hidden />
            </span>
            <span className="truncate text-admin-base font-semibold text-admin-ink">
              {restaurantName}
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Navigation schließen"
            className="flex size-9 items-center justify-center rounded-admin text-admin-muted hover:bg-[#f3f4f6] lg:hidden"
          >
            <X size={18} strokeWidth={1.75} aria-hidden />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Hauptnavigation">
          <p className="px-3 pt-5 pb-1.5 text-[11px] font-bold tracking-[0.08em] text-admin-muted uppercase">
            Verwaltung
          </p>
          <ul className="space-y-0.5">
            {NAV.filter((item) => aiReady || !item.needsAi).map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-10 items-center gap-2.5 rounded-admin px-3 text-admin-base",
                      "transition-colors duration-[var(--dur-fast)]",
                      active
                        ? "bg-admin-primary-soft font-semibold text-[#4338ca]"
                        : "font-medium text-admin-ink-2 hover:bg-[#f3f4f6]"
                    )}
                  >
                    <item.icon
                      size={18}
                      strokeWidth={1.75}
                      aria-hidden
                      className={active ? "text-admin-primary" : "text-admin-muted"}
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-admin-border p-3">
          <p className="truncate px-3 pb-2 text-admin-sm text-admin-muted" title={email}>
            {email}
          </p>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex h-10 w-full items-center gap-2.5 rounded-admin px-3 text-admin-base font-medium text-admin-ink-2 transition-colors duration-[var(--dur-fast)] hover:bg-[#f3f4f6]"
            >
              <LogOut size={18} strokeWidth={1.75} aria-hidden className="text-admin-muted" />
              Abmelden
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
