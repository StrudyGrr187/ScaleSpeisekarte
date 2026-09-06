import { ShieldCheck } from "lucide-react";
import { stopImpersonatingAction } from "@/app/actions/platform";

/**
 * A platform admin editing a customer's menu looks exactly like the customer to
 * every screen below. This bar is the only thing that says otherwise, so it is
 * always visible and never dismissable.
 */
export function ImpersonationBanner({ restaurantName }: { restaurantName: string }) {
  return (
    <div className="sticky top-0 z-50 bg-[#17181c] text-white">
      <div className="mx-auto flex max-w-builder flex-wrap items-center justify-between gap-2 px-5 py-2 lg:px-8">
        <p className="flex items-center gap-2 text-admin-sm">
          <ShieldCheck size={15} strokeWidth={1.75} aria-hidden className="shrink-0" />
          <span>
            Du arbeitest im Konto von <strong className="font-semibold">{restaurantName}</strong>.
          </span>
        </p>
        <form action={stopImpersonatingAction}>
          <button
            type="submit"
            className="h-7 rounded-admin bg-white/15 px-3 text-admin-sm font-semibold transition-colors hover:bg-white/25"
          >
            Zurück zur Plattform
          </button>
        </form>
      </div>
    </div>
  );
}
