import type { Prisma } from "@prisma/client";

/**
 * Temporary suspension of a customer, decided by the platform operator.
 *
 * The end date is evaluated whenever the state is read rather than by a job that
 * clears it: nothing has to run for a suspension to lapse, and a missed cron can
 * never keep a paying customer locked out. The stale fields left behind after
 * expiry are harmless — every check below treats them as "not suspended".
 */

/** Operator's zone. Dates typed into the form mean midnight here, not in UTC. */
export const PLATFORM_TIME_ZONE = "Europe/Vienna";

export type SuspensionFields = {
  suspendedAt: Date | null;
  suspendedUntil: Date | null;
};

export function isSuspended(fields: SuspensionFields, now: Date = new Date()): boolean {
  if (!fields.suspendedAt) return false;
  return fields.suspendedUntil === null || fields.suspendedUntil > now;
}

/** The same rule as isSuspended, as a Prisma filter for list queries. */
export function suspendedWhere(now: Date = new Date()): Prisma.RestaurantWhereInput {
  return {
    suspendedAt: { not: null },
    OR: [{ suspendedUntil: null }, { suspendedUntil: { gt: now } }],
  };
}

export function notSuspendedWhere(now: Date = new Date()): Prisma.RestaurantWhereInput {
  return {
    OR: [{ suspendedAt: null }, { suspendedUntil: { lte: now } }],
  };
}

/**
 * Midnight at the start of `ymd` (YYYY-MM-DD) in the platform's zone.
 *
 * `new Date("2026-09-20")` is midnight UTC — two hours early in a Vienna summer,
 * so "unlock on the 20th" would fire on the evening of the 19th. Work out the
 * zone's offset at that instant and correct for it. Midnight is never inside a
 * DST transition in Europe (those happen at 02:00/03:00), so one pass is exact.
 */
export function startOfDayInZone(ymd: string, timeZone: string = PLATFORM_TIME_ZONE): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!match) return null;
  const [year, month, day] = match.slice(1).map(Number);

  const utcMidnight = Date.UTC(year, month - 1, day);
  const probe = new Date(utcMidnight);
  // Reject rollovers such as 2026-02-31 becoming March 3rd.
  if (probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) return null;

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(probe);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value);

  const wallClockAsUtc = Date.UTC(
    part("year"),
    part("month") - 1,
    part("day"),
    part("hour"),
    part("minute"),
    part("second")
  );
  const offset = wallClockAsUtc - utcMidnight;
  return new Date(utcMidnight - offset);
}

/** Today's date in the platform's zone, as YYYY-MM-DD — for the date input's `min`. */
export function todayInZone(now: Date = new Date(), timeZone: string = PLATFORM_TIME_ZONE): string {
  // Assembled from parts: the formatted string's shape is locale data that ICU
  // has changed before, and a surprise format here would crash the page.
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

/** The calendar day after `ymd`. Date arithmetic, not +24h, which skips a day at DST. */
export function nextDay(ymd: string): string {
  const [year, month, day] = ymd.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10);
}

export function formatDateInZone(date: Date, timeZone: string = PLATFORM_TIME_ZONE): string {
  return new Intl.DateTimeFormat("de-AT", {
    timeZone,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
