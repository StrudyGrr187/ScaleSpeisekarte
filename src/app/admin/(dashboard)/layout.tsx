import { redirect } from "next/navigation";
import { requireTenant } from "@/lib/tenant";
import { isAiConfigured } from "@/lib/ai";
import { SidebarNav } from "@/components/admin/sidebar-nav";
import { ImpersonationBanner } from "@/components/admin/impersonation-banner";
import { ToastProvider } from "@/components/ui/toast";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, restaurant, impersonating, suspended, canManage } = await requireTenant();

  // A brand-new tenant goes through the starter wizard before seeing an empty
  // dashboard. The wizard builds categories, so it is the admin's to run; the
  // restaurant's own login sees the empty overview until then.
  if (!restaurant.onboardedAt && canManage) redirect("/admin/onboarding");

  return (
    <ToastProvider>
      <div className="min-h-dvh bg-admin-bg">
        <SidebarNav
          aiReady={isAiConfigured()}
          canManage={canManage}
          restaurantName={restaurant.name}
          email={user.email}
        />
        <div className="lg:pl-[264px]">
          {impersonating ? <ImpersonationBanner restaurantName={restaurant.name} suspended={suspended} /> : null}
          <main className="mx-auto max-w-builder px-5 pt-16 pb-10 lg:px-8 lg:pt-7">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
