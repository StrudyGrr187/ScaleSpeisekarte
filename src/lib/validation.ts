import { z } from "zod";
import { parsePrice } from "@/lib/money";

/** Accepts anything an owner might type and yields integer cents. */
const priceField = z
  .string()
  .transform((v) => parsePrice(v))
  .refine((v): v is number => v !== null, { message: "Bitte einen gültigen Preis eingeben." })
  .refine((v) => v <= 100_000_00, { message: "Preis ist unrealistisch hoch." });

const optionalPriceField = z
  .string()
  .transform((v) => {
    const trimmed = v.trim();
    if (trimmed === "") return { empty: true, value: null as number | null };
    return { empty: false, value: parsePrice(trimmed) };
  })
  // An unparseable old price is a typo, not "no old price" — say so rather than
  // dropping it silently.
  .refine((v) => v.empty || v.value !== null, {
    message: "Bitte einen gültigen Preis eingeben.",
  })
  .transform((v) => v.value);

const optionalText = (max: number) =>
  z
    .string()
    .max(max, `Maximal ${max} Zeichen.`)
    .transform((v) => {
      const trimmed = v.trim();
      return trimmed === "" ? null : trimmed;
    })
    .nullable();

/**
 * Owners type "www.cafe-milano.de" far more often than a full URL. Without a
 * scheme the browser treats it as a relative path and the guest lands on a 404,
 * so normalise it — and reject anything that is not http(s), since this value is
 * rendered straight into an href on the public menu.
 */
const websiteField = z
  .string()
  .max(200, "Maximal 200 Zeichen.")
  .transform((v) => {
    const trimmed = v.trim();
    if (trimmed === "") return null;
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  })
  .refine(
    (v) => {
      if (v === null) return true;
      try {
        const url = new URL(v);
        return (url.protocol === "http:" || url.protocol === "https:") && url.hostname.includes(".");
      } catch {
        return false;
      }
    },
    { message: "Bitte eine gültige Web-Adresse eingeben, z. B. cafe-milano.de" }
  )
  .nullable();

export const loginSchema = z.object({
  email: z.email({ message: "Bitte eine gültige E-Mail-Adresse eingeben." }),
  password: z.string().min(1, "Bitte Passwort eingeben."),
});

const passwordField = z
  .string()
  .min(8, "Das Passwort muss mindestens 8 Zeichen lang sein.")
  .max(200, "Das Passwort ist zu lang.");

/**
 * Creating a customer. There is no public sign-up: the platform operator
 * creates the tenant and hands the credentials over.
 */
export const tenantCreateSchema = z.object({
  restaurantName: z
    .string()
    .trim()
    .min(2, "Bitte den Namen des Restaurants eingeben.")
    .max(80, "Maximal 80 Zeichen."),
  name: z.string().trim().max(80).optional(),
  email: z.email({ message: "Bitte eine gültige E-Mail-Adresse eingeben." }),
  password: passwordField,
});

export const tenantPasswordSchema = z.object({
  userId: z.string().min(1),
  password: passwordField,
});

/** Suspending a customer. Both fields are optional; the date is YYYY-MM-DD. */
export const suspendSchema = z.object({
  restaurantId: z.string().min(1),
  until: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v), {
      message: "Bitte ein gültiges Datum wählen.",
    }),
  reason: optionalText(200),
});

export const restaurantSchema = z.object({
  name: z.string().trim().min(2, "Bitte einen Namen eingeben.").max(80),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Die Adresse braucht mindestens 3 Zeichen.")
    .max(60)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Nur Kleinbuchstaben, Zahlen und Bindestriche — keine Leerzeichen."
    ),
  description: optionalText(500),
  address: optionalText(200),
  phone: optionalText(50),
  website: websiteField,
  currency: z.enum(["EUR", "CHF", "GBP", "USD"]),
});

export const openingHoursSchema = z.object({
  hours: z
    .array(
      z.object({
        dayOfWeek: z.number().int().min(0).max(6),
        closed: z.boolean(),
        opensAt: z
          .string()
          .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Zeit im Format HH:MM.")
          .nullable(),
        closesAt: z
          .string()
          .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Zeit im Format HH:MM.")
          .nullable(),
      })
    )
    .length(7),
});

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Bitte einen Namen eingeben.").max(80),
  description: optionalText(300),
  icon: optionalText(40),
  active: z.boolean(),
});

export const menuItemSchema = z.object({
  categoryId: z.string().min(1, "Bitte eine Kategorie wählen."),
  name: z.string().trim().min(1, "Bitte einen Namen eingeben.").max(120),
  description: optionalText(600),
  price: priceField,
  oldPrice: optionalPriceField,
  visible: z.boolean(),
  available: z.boolean(),
  featured: z.boolean(),
  allergenCodes: z.array(z.string().max(2)).max(20),
  dietaryTagKeys: z.array(z.string().max(40)).max(20),
}).refine((data) => data.oldPrice === null || data.oldPrice > data.price, {
  message: "Der Streichpreis muss über dem aktuellen Preis liegen.",
  path: ["oldPrice"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RestaurantInput = z.infer<typeof restaurantSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type MenuItemInput = z.infer<typeof menuItemSchema>;
