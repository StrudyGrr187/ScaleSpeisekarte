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
  restaurantId: string;
  email: string;
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
      typeof payload.restaurantId === "string" &&
      typeof payload.email === "string"
    ) {
      return {
        userId: payload.userId,
        restaurantId: payload.restaurantId,
        email: payload.email,
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

  return user;
});

export { COOKIE_NAME };
