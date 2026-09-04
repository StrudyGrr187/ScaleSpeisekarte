import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthShell } from "@/components/admin/auth-shell";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Restaurant anlegen" };

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/admin");

  return (
    <AuthShell
      title="Restaurant anlegen"
      subtitle="In zwei Minuten zur eigenen digitalen Speisekarte."
      footer={
        <>
          Schon registriert?{" "}
          <Link href="/admin/login" className="font-semibold text-admin-primary hover:underline">
            Anmelden
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
