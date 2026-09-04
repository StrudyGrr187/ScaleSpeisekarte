"use client";

import * as React from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { removeImageAction, uploadImageAction } from "@/app/actions/restaurant";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { ImageKind } from "@/lib/storage";
import { cn } from "@/lib/utils";

/**
 * Upload control with an immediate local preview. The file is resized and
 * re-encoded on the server, so a 6 MB phone photo never reaches a guest.
 */
export function ImageField({
  kind,
  targetId,
  value,
  onChange,
  label,
  hint,
  aspect = "square",
}: {
  kind: ImageKind;
  targetId?: string;
  value: string | null;
  onChange: (next: string | null) => void;
  label: string;
  hint?: string;
  aspect?: "square" | "wide";
}) {
  const toast = useToast();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [pending, setPending] = React.useState(false);
  const inputId = React.useId();

  const upload = async (file: File) => {
    setPending(true);
    try {
      const formData = new FormData();
      formData.set("kind", kind);
      formData.set("targetId", targetId ?? "");
      formData.set("file", file);

      const result = await uploadImageAction(formData);
      if (result.ok) {
        onChange(result.data.url);
        toast("Bild hochgeladen.");
      } else {
        toast(result.error, "error");
      }
    } finally {
      setPending(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = async () => {
    setPending(true);
    try {
      const result = await removeImageAction(kind, targetId ?? "");
      if (result.ok) {
        onChange(null);
        toast("Bild entfernt.");
      } else {
        toast(result.error, "error");
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block text-admin-sm font-medium text-admin-ink-2">
        {label}
        {hint ? <span className="ml-1.5 font-normal text-admin-muted">{hint}</span> : null}
      </label>

      <div className="flex items-start gap-3">
        <div
          className={cn(
            "relative shrink-0 overflow-hidden rounded-admin border border-admin-border bg-admin-bg",
            aspect === "square" ? "size-20" : "h-20 w-36"
          )}
        >
          {value ? (
            <Image src={value} alt="" fill sizes="144px" className="object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center text-admin-muted" aria-hidden>
              <ImagePlus size={20} strokeWidth={1.5} />
            </span>
          )}
          {pending ? (
            <span className="absolute inset-0 flex items-center justify-center bg-white/70" aria-hidden>
              <Loader2 size={18} className="animate-spin text-admin-primary" />
            </span>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
            }}
          />
          <Button
            variant="secondary"
            size="sm"
            disabled={pending}
            onClick={() => inputRef.current?.click()}
          >
            {value ? "Ersetzen" : "Bild wählen"}
          </Button>
          {value ? (
            <Button variant="dangerGhost" size="sm" disabled={pending} onClick={remove}>
              <Trash2 size={15} strokeWidth={1.75} aria-hidden />
              Entfernen
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
