import Link from "next/link";
import { Building2, LogOut, ShieldCheck } from "lucide-react";
import { requirePlatformAdmin } from "@/lib/tenant";
import { logoutAction } from "@/app/actions/auth";
import { ToastProvider } from "@/components/ui/toast";

/**
 * The operator surface. Deliberately not the tenant sidebar: a dark bar makes
 * it obvious at a glance that these actions reach every customer, not one.
 */
export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const admin = await requirePlatformAdmin();

  return (
    <ToastProvider>
      <div className="min-h-dvh bg-admin-bg">
        <header className="bg-[#17181c] text-white">
          <div className="mx-auto flex h-[60px] max-w-admin items-center justify-between gap-4 px-5 lg:px-8">
            <Link href="/platform" className="flex min-w-0 items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-admin bg-white/10">
                <ShieldCheck size={16} strokeWidth={2} aria-hidden />
              </span>
              <span className="truncate text-admin-base font-semibold">Plattform-Verwaltung</span>
            </Link>

            <div className="flex items-center gap-1">
              <Link
                href="/platform"
                className="flex h-9 items-center gap-2 rounded-admin px-3 text-admin-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Building2 size={16} strokeWidth={1.75} aria-hidden />
                Kunden
              </Link>
              <span className="mx-2 hidden truncate text-admin-sm text-white/50 sm:block">
                {admin.email}
              </span>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex h-9 items-center gap-2 rounded-admin px-3 text-admin-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <LogOut size={16} strokeWidth={1.75} aria-hidden />
                  Abmelden
                </button>
              </form>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-admin px-5 pt-7 pb-10 lg:px-8">{children}</main>
      </div>
    </ToastProvider>
  );
}
