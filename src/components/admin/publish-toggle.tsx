"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Globe, GlobeLock } from "lucide-react";
import { setPublishedAction } from "@/app/actions/menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function PublishToggle({
  published,
  size = "md",
}: {
  published: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = React.useTransition();

  const onClick = () => {
    startTransition(async () => {
      const result = await setPublishedAction(!published);
      if (result.ok) {
        toast(result.message ?? "Gespeichert.");
        router.refresh();
      } else {
        toast(result.error, "error");
      }
    });
  };

  return (
    <Button
      variant={published ? "secondary" : "primary"}
      size={size}
      onClick={onClick}
      disabled={pending}
    >
      {published ? (
        <GlobeLock size={16} strokeWidth={1.75} aria-hidden />
      ) : (
        <Globe size={16} strokeWidth={1.75} aria-hidden />
      )}
      {pending
        ? "Einen Moment…"
        : published
          ? "Offline nehmen"
          : "Karte veröffentlichen"}
    </Button>
  );
}
