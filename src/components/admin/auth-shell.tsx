import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-admin-bg">
      <div className="flex flex-1 items-center justify-center px-5 py-10">
        <div className="w-full max-w-[420px]">
          <Link
            href="/"
            className="mb-8 flex items-center gap-2.5 text-admin-ink transition-colors hover:text-admin-primary"
          >
            <span className="flex size-9 items-center justify-center rounded-admin bg-admin-primary text-white">
              <UtensilsCrossed size={18} strokeWidth={2} aria-hidden />
            </span>
            <span className="text-admin-h2 font-semibold">ScaleSpeisekarte</span>
          </Link>

          <div className="rounded-admin-lg border border-admin-border bg-admin-surface p-6 shadow-admin-card sm:p-7">
            <h1 className="text-admin-h1 font-semibold text-admin-ink">{title}</h1>
            <p className="mt-1.5 text-admin-base text-admin-muted">{subtitle}</p>
            <div className="mt-6">{children}</div>
          </div>

          <p className="mt-5 text-center text-admin-base text-admin-muted">{footer}</p>
        </div>
      </div>
    </div>
  );
}
