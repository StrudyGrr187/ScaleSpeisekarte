import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * The client is created on first use, not on import.
 *
 * Next.js loads the whole module graph while collecting page data at build time.
 * Constructing the client eagerly would therefore demand DATABASE_URL on the
 * build machine, even though no query runs there — which is exactly how a
 * Vercel/Docker build fails with credentials that only exist at runtime.
 */

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env, or set it in your host's environment."
    );
  }
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

function getClient(): PrismaClient {
  // Cached on globalThis so Next.js hot reloads in dev reuse one pool instead of
  // opening a new one per reload until Postgres refuses connections.
  globalForPrisma.prisma ??= createClient();
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getClient();
    const value = Reflect.get(client, property) as unknown;
    // Methods must keep their original receiver ($transaction, $connect, ...).
    return typeof value === "function" ? value.bind(client) : value;
  },
});
