"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";

import { addHydrationAction, clearHydrationAction } from "./actions";

const DAILY_TARGET_ML = 2500;

export function Hydration({ date, totalMl }: { date: string; totalMl: number }) {
  const [pending, startTransition] = useTransition();

  function add(ml: number) {
    startTransition(async () => {
      await addHydrationAction({ date, ml });
    });
  }

  function clear() {
    if (!confirm("¿Reiniciar hidratación de hoy?")) return;
    startTransition(async () => {
      await clearHydrationAction(date);
    });
  }

  const pct = Math.min(100, Math.round((totalMl / DAILY_TARGET_ML) * 100));
  const liters = (totalMl / 1000).toFixed(1);
  const target = (DAILY_TARGET_ML / 1000).toFixed(1);

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-card p-4">
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <div className="text-sm font-medium">Hidratación</div>
          <div className="text-xs text-muted-foreground">
            {liters} / {target} L · {pct}%
          </div>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={clear} disabled={pending}>
          Reset
        </Button>
      </div>
      <div
        className="h-2.5 overflow-hidden rounded-full"
        style={{ background: "hsl(var(--accent))" }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{ width: `${pct}%`, background: "hsl(var(--metric-weight))" }}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => add(250)} disabled={pending}>
          +250 ml
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => add(500)} disabled={pending}>
          +500 ml
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => add(750)} disabled={pending}>
          +750 ml
        </Button>
      </div>
    </div>
  );
}
