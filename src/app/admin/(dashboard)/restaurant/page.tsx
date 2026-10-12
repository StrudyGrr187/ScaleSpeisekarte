import type { Metadata } from "next";
import { requireTenant } from "@/lib/tenant";
import { getAppOrigin } from "@/lib/public-url";
import { WEEKDAYS } from "@/lib/constants";
import { PageHeader } from "@/components/admin/page-header";
import { AdminOnlyNote } from "@/components/admin/admin-only-note";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { RestaurantForm } from "./restaurant-form";
import { OpeningHoursForm } from "./opening-hours-form";
import { RestaurantImages } from "./restaurant-images";

export const metadata: Metadata = { title: "Restaurant" };

export default async function RestaurantPage() {
  const { restaurant, canManage } = await requireTenant();

  if (canManage) {
    const origin = await getAppOrigin();
    return (
      <>
        <PageHeader
          title="Restaurant"
          description="Name, Kontakt, Bilder und Öffnungszeiten — so stehen sie auf der Karte."
        />
        <div className="max-w-[720px] space-y-5">
          <RestaurantForm restaurant={restaurant} origin={origin} />
          <OpeningHoursForm hours={restaurant.openingHours} />
        </div>
      </>
    );
  }

  const profile = [
    { label: "Name", value: restaurant.name },
    { label: "Beschreibung", value: restaurant.description },
    { label: "Adresse", value: restaurant.address },
    { label: "Telefon", value: restaurant.phone },
    { label: "Website", value: restaurant.website },
  ];

  return (
    <>
      <PageHeader
        title="Restaurant"
        description="Name, Kontakt, Bilder und Öffnungszeiten — so stehen sie auf der Karte."
      />
      <div className="max-w-[720px] space-y-5">
        <RestaurantImages logo={restaurant.logo} coverImage={restaurant.coverImage} />

        <Card>
          <CardHeader>
            <CardTitle>Profil</CardTitle>
            <AdminOnlyNote />
          </CardHeader>
          <CardBody>
            <dl className="divide-y divide-admin-border">
              {profile.map((row) => (
                <div
                  key={row.label}
                  className="grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[160px_1fr]"
                >
                  <dt className="text-admin-base text-admin-muted">{row.label}</dt>
                  <dd className="text-admin-base break-words text-admin-ink">{row.value || "—"}</dd>
                </div>
              ))}
            </dl>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Öffnungszeiten</CardTitle>
            <AdminOnlyNote />
          </CardHeader>
          <CardBody>
            {restaurant.openingHours.length === 0 ? (
              <p className="text-admin-base text-admin-muted">Noch keine Zeiten eingetragen.</p>
            ) : (
              <dl className="divide-y divide-admin-border">
                {restaurant.openingHours.map((hour) => (
                  <div
                    key={hour.dayOfWeek}
                    className="flex justify-between gap-4 py-2.5 first:pt-0 last:pb-0"
                  >
                    <dt className="text-admin-base font-medium text-admin-ink">
                      {WEEKDAYS[hour.dayOfWeek]}
                    </dt>
                    <dd className="text-admin-base tabular-nums text-admin-ink-2">
                      {hour.closed ? "Geschlossen" : `${hour.opensAt} – ${hour.closesAt}`}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
