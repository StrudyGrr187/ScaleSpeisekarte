import type { Metadata } from "next";
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
      footer="Zugänge werden vom Betreiber vergeben. Kein Konto? Melde dich bei uns."
    >
      <LoginForm />
    </AuthShell>
  );
}
