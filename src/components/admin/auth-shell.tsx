import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";

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
            className="mb-8 inline-flex text-admin-ink"
            aria-label="ScaleMenu Startseite"
          >
            <Wordmark className="text-[22px]" />
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
