import type { Metadata } from "next";
import { requireTenant } from "@/lib/tenant";
import { getAppOrigin } from "@/lib/public-url";
import { PageHeader } from "@/components/admin/page-header";
import { RestaurantForm } from "./restaurant-form";
import { OpeningHoursForm } from "./opening-hours-form";

export const metadata: Metadata = { title: "Restaurant" };

export default async function RestaurantPage() {
  const { restaurant } = await requireTenant();
  const origin = await getAppOrigin();

  return (
    <>
      <PageHeader
        title="Restaurant"
        description="Profil, Erscheinungsbild und Öffnungszeiten. Diese Angaben erscheinen auf der Gastansicht."
      />
      <div className="max-w-[720px] space-y-5">
        <RestaurantForm restaurant={restaurant} origin={origin} />
        <OpeningHoursForm hours={restaurant.openingHours} />
      </div>
    </>
  );
}
