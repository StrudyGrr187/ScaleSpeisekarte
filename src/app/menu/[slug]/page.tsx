import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { MenuView } from "@/components/menu/menu-view";
import { SuspendedNotice } from "@/components/menu/suspended-notice";
import { getPublicMenuBySlug, type LanguageRequest } from "@/lib/menu-query";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string | string[] }>;
};

// The public menu is what a QR code points at: always current, never a stale
// cached copy, but still a single server round trip with no client fetching.
// That also makes a suspension, or lifting one, take effect on the next scan.
export const dynamic = "force-dynamic";

/** A guest's explicit pick wins; otherwise their phone's language decides. */
async function languageRequest(searchParams: Props["searchParams"]): Promise<LanguageRequest> {
  const { lang } = await searchParams;
  return {
    lang: typeof lang === "string" ? lang : undefined,
    acceptLanguage: (await headers()).get("accept-language"),
  };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublicMenuBySlug(slug, await languageRequest(searchParams));

  if (result.status === "not-found") return { title: "Speisekarte nicht gefunden" };
  if (result.status === "suspended") {
    return {
      title: `${result.restaurantName} · Speisekarte`,
      robots: { index: false, follow: false },
    };
  }

  const { menu } = result;
  const title = `${menu.restaurant.name} · ${menu.strings.menu}`;
  return {
    title,
    description:
      menu.restaurant.description ?? `Die digitale Speisekarte von ${menu.restaurant.name}.`,
    openGraph: {
      title,
      description: menu.restaurant.description ?? undefined,
      images: menu.restaurant.coverImage ? [menu.restaurant.coverImage] : undefined,
    },
    robots: menu.published ? undefined : { index: false, follow: false },
  };
}

export default async function PublicMenuPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const result = await getPublicMenuBySlug(slug, await languageRequest(searchParams));

  if (result.status === "not-found") notFound();
  if (result.status === "suspended") {
    return <SuspendedNotice restaurantName={result.restaurantName} />;
  }

  return <MenuView menu={result.menu} />;
}
