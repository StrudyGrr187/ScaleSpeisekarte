"use client";

import * as React from "react";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateOpeningHoursAction } from "@/app/actions/restaurant";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { WEEKDAYS } from "@/lib/constants";

type Hour = { dayOfWeek: number; closed: boolean; opensAt: string | null; closesAt: string | null };

export function OpeningHoursForm({ hours }: { hours: Hour[] }) {
  const router = useRouter();
  const toast = useToast();
  const [state, formAction, pending] = useActionState(updateOpeningHoursAction, null);

  const initial = React.useMemo(
    () =>
      Array.from({ length: 7 }, (_, day) => {
        const match = hours.find((h) => h.dayOfWeek === day);
        return {
          dayOfWeek: day,
          closed: match?.closed ?? false,
          opensAt: match?.opensAt ?? "11:00",
          closesAt: match?.closesAt ?? "22:00",
        };
      }),
    [hours]
  );

  const [rows, setRows] = React.useState(initial);
  useEffect(() => setRows(initial), [initial]);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast(state.message ?? "Gespeichert.");
      router.refresh();
    } else {
      toast(state.error, "error");
    }
  }, [state, toast, router]);

  return (
    <form action={formAction}>
      <Card>
        <CardHeader>
          <CardTitle>Öffnungszeiten</CardTitle>
        </CardHeader>
        <CardBody className="space-y-2">
          {rows.map((row) => (
            <div
              key={row.dayOfWeek}
              className="flex flex-wrap items-center gap-3 border-b border-admin-border py-2.5 last:border-b-0"
            >
              <span className="w-24 shrink-0 text-admin-base font-medium text-admin-ink">
                {WEEKDAYS[row.dayOfWeek]}
              </span>

              <input type="hidden" name={`closed-${row.dayOfWeek}`} value={String(row.closed)} />

              <Switch
                checked={!row.closed}
                label={`${WEEKDAYS[row.dayOfWeek]} geöffnet`}
                onCheckedChange={(open) =>
                  setRows((current) =>
                    current.map((r) =>
                      r.dayOfWeek === row.dayOfWeek ? { ...r, closed: !open } : r
                    )
                  )
                }
              />

              {row.closed ? (
                <span className="text-admin-base text-admin-muted">Geschlossen</span>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    name={`opensAt-${row.dayOfWeek}`}
                    value={row.opensAt}
                    aria-label={`${WEEKDAYS[row.dayOfWeek]} öffnet um`}
                    onChange={(e) =>
                      setRows((current) =>
                        current.map((r) =>
                          r.dayOfWeek === row.dayOfWeek ? { ...r, opensAt: e.target.value } : r
                        )
                      )
                    }
                    className="h-10 rounded-admin border border-admin-border-strong bg-white px-2.5 text-[16px] tabular-nums outline-none focus:border-admin-primary focus:shadow-admin-focus"
                  />
                  <span className="text-admin-muted">–</span>
                  <input
                    type="time"
                    name={`closesAt-${row.dayOfWeek}`}
                    value={row.closesAt}
                    aria-label={`${WEEKDAYS[row.dayOfWeek]} schließt um`}
                    onChange={(e) =>
                      setRows((current) =>
                        current.map((r) =>
                          r.dayOfWeek === row.dayOfWeek ? { ...r, closesAt: e.target.value } : r
                        )
                      )
                    }
                    className="h-10 rounded-admin border border-admin-border-strong bg-white px-2.5 text-[16px] tabular-nums outline-none focus:border-admin-primary focus:shadow-admin-focus"
                  />
                </div>
              )}
            </div>
          ))}

          <div className="flex justify-end pt-3">
            <Button type="submit" disabled={pending}>
              {pending ? "Wird gespeichert…" : "Zeiten speichern"}
            </Button>
          </div>
        </CardBody>
      </Card>
    </form>
  );
}
