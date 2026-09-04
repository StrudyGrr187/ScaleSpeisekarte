import type { Metadata } from "next";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { requireTenant } from "@/lib/tenant";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/page-header";
import { PasswordForm } from "./password-form";

export const metadata: Metadata = { title: "Einstellungen" };

export default async function SettingsPage() {
  const { user, restaurant } = await requireTenant();

  return (
    <>
      <PageHeader title="Einstellungen" description="Dein Konto und dieser Zugang." />

      <div className="max-w-[560px] space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>Konto</CardTitle>
          </CardHeader>
          <CardBody>
            <dl className="space-y-3">
              <Row label="Name" value={user.name ?? "—"} />
              <Row label="E-Mail" value={user.email} />
              <Row label="Rolle" value={user.role === "OWNER" ? "Inhaber" : "Mitarbeiter"} />
              <Row label="Restaurant" value={restaurant.name} />
            </dl>
          </CardBody>
        </Card>

        <PasswordForm />

        <Card>
          <CardHeader>
            <CardTitle>Sitzung</CardTitle>
          </CardHeader>
          <CardBody>
            <p className="mb-4 text-admin-base text-admin-muted">
              Meldet dich auf diesem Gerät ab. Die Speisekarte bleibt für Gäste erreichbar.
            </p>
            <form action={logoutAction}>
              <Button type="submit" variant="secondary">
                <LogOut size={16} strokeWidth={1.75} aria-hidden />
                Abmelden
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-admin-border pb-3 last:border-b-0 last:pb-0">
      <dt className="text-admin-base text-admin-muted">{label}</dt>
      <dd className="text-admin-base font-medium text-admin-ink">{value}</dd>
    </div>
  );
}
