import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MenuView } from "@/components/menu/menu-view";
import { SuspendedNotice } from "@/components/menu/suspended-notice";
import { getPublicMenuBySlug } from "@/lib/menu-query";

type Props = { params: Promise<{ slug: string }> };

// The public menu is what a QR code points at: always current, never a stale
// cached copy, but still a single server round trip with no client fetching.
// That also makes a suspension, or lifting one, take effect on the next scan.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublicMenuBySlug(slug);

  if (result.status === "not-found") return { title: "Speisekarte nicht gefunden" };
  if (result.status === "suspended") {
    return {
      title: `${result.restaurantName} · Speisekarte`,
      robots: { index: false, follow: false },
    };
  }

  const { menu } = result;
  return {
    title: `${menu.restaurant.name} · Speisekarte`,
    description:
      menu.restaurant.description ?? `Die digitale Speisekarte von ${menu.restaurant.name}.`,
    openGraph: {
      title: `${menu.restaurant.name} · Speisekarte`,
      description: menu.restaurant.description ?? undefined,
      images: menu.restaurant.coverImage ? [menu.restaurant.coverImage] : undefined,
    },
    robots: menu.published ? undefined : { index: false, follow: false },
  };
}

export default async function PublicMenuPage({ params }: Props) {
  const { slug } = await params;
  const result = await getPublicMenuBySlug(slug);

  if (result.status === "not-found") notFound();
  if (result.status === "suspended") {
    return <SuspendedNotice restaurantName={result.restaurantName} />;
  }

  return <MenuView menu={result.menu} />;
}
