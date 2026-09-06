import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireTenant } from "@/lib/tenant";
import { ToastProvider } from "@/components/ui/toast";
import { ImpersonationBanner } from "@/components/admin/impersonation-banner";
import { OnboardingWizard } from "./wizard";

export const metadata: Metadata = { title: "Erste Schritte" };

export default async function OnboardingPage() {
  const { restaurant, impersonating } = await requireTenant();

  // Already set up — nothing to do here.
  if (restaurant.onboardedAt) redirect("/admin");

  return (
    <ToastProvider>
      {/* The wizard sits outside the dashboard layout, so it needs its own way
          back — an admin who lands here must not be stranded in a customer. */}
      {impersonating ? <ImpersonationBanner restaurantName={restaurant.name} /> : null}
      <OnboardingWizard restaurantName={restaurant.name} />
    </ToastProvider>
  );
}
