import { redirect } from "next/navigation";
import { requireTenant } from "@/lib/tenant";
import { isAiConfigured } from "@/lib/ai";
import { SidebarNav } from "@/components/admin/sidebar-nav";
import { ImpersonationBanner } from "@/components/admin/impersonation-banner";
import { ToastProvider } from "@/components/ui/toast";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, restaurant, impersonating } = await requireTenant();

  // A brand-new tenant goes through the starter wizard before seeing an empty
  // dashboard — an empty menu is where owners give up.
  if (!restaurant.onboardedAt) redirect("/admin/onboarding");

  return (
    <ToastProvider>
      <div className="min-h-dvh bg-admin-bg">
        <SidebarNav
          aiReady={isAiConfigured()}
          restaurantName={restaurant.name}
          email={user.email}
        />
        <div className="lg:pl-[264px]">
          {impersonating ? <ImpersonationBanner restaurantName={restaurant.name} /> : null}
          <main className="mx-auto max-w-builder px-5 pt-16 pb-10 lg:px-8 lg:pt-7">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
