import type { Metadata } from "next";
import { requirePlatformAdmin } from "@/lib/tenant";
import { PageHeader } from "@/components/admin/page-header";
import { CreateTenantForm } from "./create-form";

export const metadata: Metadata = { title: "Kunde anlegen" };

export default async function NewTenantPage() {
  await requirePlatformAdmin();

  return (
    <>
      <PageHeader
        title="Kunde anlegen"
        description="Restaurant und Login in einem Schritt. Die Zugangsdaten siehst du danach einmal — gib sie dem Kunden weiter."
      />
      <CreateTenantForm />
    </>
  );
}
