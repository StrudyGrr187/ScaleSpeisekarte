/**
 * The customer list's filter vocabulary, shared by the server page that queries
 * and the client controls that write the URL. Pure data — no database import —
 * so the client bundle can use it.
 */

export const STATUS_OPTIONS = [
  { value: "alle", label: "Alle" },
  { value: "veroeffentlicht", label: "Veröffentlicht" },
  { value: "entwurf", label: "Entwurf" },
  { value: "gesperrt", label: "Gesperrt" },
] as const;

export const SORT_OPTIONS = [
  { value: "neu", label: "Neueste zuerst" },
  { value: "alt", label: "Älteste zuerst" },
  { value: "name", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
] as const;

export type CustomerStatus = (typeof STATUS_OPTIONS)[number]["value"];
export type CustomerSort = (typeof SORT_OPTIONS)[number]["value"];

/** Search params are user input: anything unrecognised falls back to the default. */
export function parseCustomerQuery(params: Record<string, string | string[] | undefined>) {
  const first = (value: string | string[] | undefined) =>
    (Array.isArray(value) ? value[0] : value) ?? "";

  const status = first(params.status);
  const sort = first(params.sort);

  return {
    // Capped: the term goes into three ILIKE clauses, and nobody searches with 100 characters.
    query: first(params.q).trim().slice(0, 100),
    status: (STATUS_OPTIONS.some((o) => o.value === status) ? status : "alle") as CustomerStatus,
    sort: (SORT_OPTIONS.some((o) => o.value === sort) ? sort : "neu") as CustomerSort,
  };
}
