import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * `prisma generate` runs on every build and needs no database connection — only
 * migrate/introspect do. Prisma's `env()` helper throws the moment the variable
 * is missing, which breaks builds on hosts (Vercel, Docker) where DATABASE_URL
 * exists at runtime but not at build time.
 *
 * So resolve it leniently: pass the datasource through when it is set, and omit
 * it otherwise. A migrate command run without it still fails, but with Prisma's
 * own clear message instead of an opaque config-load error.
 */
const databaseUrl = process.env.DATABASE_URL?.trim();

export default defineConfig({
  schema: "prisma/schema.prisma",
  ...(databaseUrl ? { datasource: { url: databaseUrl } } : {}),
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
