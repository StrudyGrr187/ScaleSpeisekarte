import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireTenant } from "@/lib/tenant";
import { ToastProvider } from "@/components/ui/toast";
import { OnboardingWizard } from "./wizard";

export const metadata: Metadata = { title: "Erste Schritte" };

export default async function OnboardingPage() {
  const { restaurant } = await requireTenant();

  // Already set up — nothing to do here.
  if (restaurant.onboardedAt) redirect("/admin");

  return (
    <ToastProvider>
      <OnboardingWizard restaurantName={restaurant.name} />
    </ToastProvider>
  );
}
