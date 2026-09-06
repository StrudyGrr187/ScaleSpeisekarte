import type { Metadata } from "next";
import Image from "next/image";
import { ExternalLink, Nfc, QrCode as QrCodeIcon, ShieldCheck } from "lucide-react";
import { requireDefaultMenu, requireTenant } from "@/lib/tenant";
import { getMenuUrl } from "@/lib/public-url";
import { qrDataUrl, qrSvg } from "@/lib/qr";
import { buttonClasses } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/admin/copy-button";
import { PageHeader } from "@/components/admin/page-header";
import { QrDownload } from "./qr-download";

export const metadata: Metadata = { title: "QR & NFC" };

export default async function QrPage() {
  const { restaurant } = await requireTenant();
  const menu = await requireDefaultMenu(restaurant.id);

  const menuUrl = await getMenuUrl(restaurant.slug);
  const [png, svg] = await Promise.all([qrDataUrl(menuUrl, 1024), qrSvg(menuUrl)]);

  return (
    <>
      <PageHeader
        title="QR & NFC"
        description="Ein Ziel für beides: QR-Code und NFC-Plakette zeigen auf dieselbe Adresse."
        actions={
          menu.published ? (
            <Badge variant="success">Veröffentlicht</Badge>
          ) : (
            <Badge variant="warning">Entwurf</Badge>
          )
        }
      />

      <div className="grid max-w-[900px] gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="h-fit">
          <CardBody>
            <div className="rounded-admin border border-admin-border bg-white p-4">
              <Image
                src={png}
                alt={`QR-Code zur Speisekarte von ${restaurant.name}`}
                width={272}
                height={272}
                unoptimized
                className="w-full"
              />
            </div>
            <div className="mt-4">
              <QrDownload
                pngDataUrl={png}
                svg={svg}
                filename={`qr-${restaurant.slug}`}
              />
            </div>
          </CardBody>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Menü-Adresse</CardTitle>
            </CardHeader>
            <CardBody>
              <p className="rounded-admin border border-admin-border bg-admin-bg px-3.5 py-3 font-mono text-admin-sm break-all text-admin-ink-2">
                {menuUrl}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <CopyButton value={menuUrl} />
                <a
                  href={`/menu/${restaurant.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClasses("ghost", "md")}
                >
                  <ExternalLink size={16} strokeWidth={1.75} aria-hidden />
                  Gastansicht öffnen
                </a>
              </div>

              {!menu.published ? (
                <p className="mt-4 rounded-admin border border-admin-warning/25 bg-admin-warning-soft px-3.5 py-3 text-admin-base text-admin-warning">
                  Deine Karte ist noch nicht veröffentlicht. Der QR-Code funktioniert bereits —
                  Gäste sehen aber nur einen Hinweis, bis du die Karte online stellst.
                </p>
              ) : null}
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-4">
              <InfoRow
                icon={ShieldCheck}
                title="Der Code bleibt gültig"
                text="Der QR-Code enthält nur diese Adresse — nicht deine Gerichte. Du kannst die Karte beliebig ändern, ohne etwas neu zu drucken."
              />
              <InfoRow
                icon={Nfc}
                title="NFC-Plaketten"
                text="Beschreibe eine NFC-Plakette mit exakt derselben Adresse als URL-Record. Gast tippt an, Karte öffnet sich — keine App nötig."
              />
              <InfoRow
                icon={QrCodeIcon}
                title="Drucken"
                text="Für Aufsteller und Aufkleber die SVG-Datei verwenden: sie bleibt in jeder Größe scharf. Mindestens 2 cm Kantenlänge und etwas weißer Rand ringsum."
              />
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}

function InfoRow({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof ShieldCheck;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3">
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-admin-primary-soft text-admin-primary"
        aria-hidden
      >
        <Icon size={17} strokeWidth={1.75} />
      </span>
      <div>
        <p className="text-admin-base font-semibold text-admin-ink">{title}</p>
        <p className="mt-0.5 text-admin-base text-admin-muted">{text}</p>
      </div>
    </div>
  );
}
