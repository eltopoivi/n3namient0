"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";

import { addHydrationAction, clearHydrationAction } from "./actions";

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

  return (
    <div className="flex flex-col gap-3 rounded-md border p-3">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-sm text-muted-foreground">Hidratación hoy</div>
          <div className="text-2xl font-semibold">{totalMl} ml</div>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={clear} disabled={pending}>
          Reset
        </Button>
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => add(250)} disabled={pending}>
          +250
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => add(500)} disabled={pending}>
          +500
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => add(750)} disabled={pending}>
          +750
        </Button>
      </div>
    </div>
  );
}
