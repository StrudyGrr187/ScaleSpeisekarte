import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthShell } from "@/components/admin/auth-shell";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Anmelden" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/admin");

  return (
    <AuthShell
      title="Willkommen zurück"
      subtitle="Melde dich an, um deine Speisekarte zu bearbeiten."
      footer={
        <>
          Noch kein Konto?{" "}
          <Link href="/admin/register" className="font-semibold text-admin-primary hover:underline">
            Restaurant anlegen
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
