import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/db";

const COOKIE_NAME = "scale_session";
const SESSION_DAYS = 7;

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "AUTH_SECRET is missing or too short. Generate one with: openssl rand -base64 32"
    );
  }
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  userId: string;
  /** Null for a platform admin, which belongs to no tenant. */
  restaurantId: string | null;
  email: string;
  /**
   * Set while a platform admin works inside a customer's account. Honoured only
   * after the role has been re-read from the database — a cookie alone must
   * never be able to widen anyone's reach.
   */
  actingRestaurantId?: string | null;
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getSecret());
}

export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await signSession(payload);
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

async function readSessionToken(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    if (
      typeof payload.userId === "string" &&
      (typeof payload.restaurantId === "string" || payload.restaurantId === null) &&
      typeof payload.email === "string"
    ) {
      return {
        userId: payload.userId,
        restaurantId: payload.restaurantId,
        email: payload.email,
        actingRestaurantId:
          typeof payload.actingRestaurantId === "string" ? payload.actingRestaurantId : null,
      };
    }
    return null;
  } catch {
    // Expired, tampered with, or signed by a rotated secret — all mean "logged out".
    return null;
  }
}

/**
 * Resolves the signed-in user against the database on every request, so a
 * deleted user or a moved restaurant cannot keep acting on a stale cookie.
 * `cache` dedupes it across the many Server Components in a single render.
 */
export const getCurrentUser = cache(async () => {
  const session = await readSessionToken();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      restaurantId: true,
    },
  });

  // The cookie carries a restaurantId; if it no longer matches the user's actual
  // tenant, treat the session as invalid rather than trusting the token.
  if (!user || user.restaurantId !== session.restaurantId) return null;

  // Impersonation is a property of the role, not of the cookie: a forged
  // actingRestaurantId on an owner's token resolves to nothing.
  const actingRestaurantId =
    user.role === "PLATFORM_ADMIN" ? (session.actingRestaurantId ?? null) : null;

  return { ...user, actingRestaurantId };
});

export { COOKIE_NAME };
