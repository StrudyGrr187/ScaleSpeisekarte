"use client";

import * as React from "react";
import { ImageField } from "@/components/builder/image-field";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";

/** Logo and cover on their own — the part of the profile the restaurant edits itself. */
export function RestaurantImages({
  logo: initialLogo,
  coverImage: initialCover,
}: {
  logo: string | null;
  coverImage: string | null;
}) {
  const [logo, setLogo] = React.useState(initialLogo);
  const [cover, setCover] = React.useState(initialCover);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bilder</CardTitle>
      </CardHeader>
      <CardBody>
        <div className="grid gap-5 sm:grid-cols-2">
          <ImageField kind="logo" value={logo} onChange={setLogo} label="Logo" hint="quadratisch" />
          <ImageField
            kind="cover"
            value={cover}
            onChange={setCover}
            label="Titelbild"
            hint="16:9"
            aspect="wide"
          />
        </div>
      </CardBody>
    </Card>
  );
}
