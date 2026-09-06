/**
 * Creates (or re-points) the platform operator account.
 *
 *   npm run admin:create -- admin@example.com "ein-langes-passwort"
 *
 * Deliberately a script and not a page: the first admin cannot be created
 * through a UI that already requires an admin, and an open bootstrap route
 * would be a permanent way in for anyone who finds it.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

async function main() {
  const [email, password] = process.argv.slice(2);

  if (!email || !password) {
    console.error('Aufruf: npm run admin:create -- <e-mail> "<passwort>"');
    process.exit(1);
  }
  if (!email.includes("@")) {
    console.error("Das sieht nicht nach einer E-Mail-Adresse aus.");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Das Passwort muss mindestens 8 Zeichen lang sein.");
    process.exit(1);
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL ist nicht gesetzt.");
    process.exit(1);
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  try {
    const normalized = email.toLowerCase();
    const passwordHash = await bcrypt.hash(password, 12);

    const existing = await prisma.user.findUnique({
      where: { email: normalized },
      select: { id: true, role: true, restaurantId: true },
    });

    if (existing && existing.restaurantId !== null) {
      console.error(
        `${normalized} gehört bereits zu einem Restaurant. Ein Plattform-Admin darf keinem Tenant angehören — bitte eine andere Adresse wählen.`
      );
      process.exit(1);
    }

    const user = await prisma.user.upsert({
      where: { email: normalized },
      update: { passwordHash, role: "PLATFORM_ADMIN" },
      create: {
        email: normalized,
        passwordHash,
        role: "PLATFORM_ADMIN",
        name: "Plattform-Admin",
      },
      select: { id: true, email: true },
    });

    console.log(existing ? "\nPlattform-Admin aktualisiert:" : "\nPlattform-Admin angelegt:");
    console.log(`  E-Mail: ${user.email}`);
    console.log("  Login:  /admin/login  →  landet auf /platform\n");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
