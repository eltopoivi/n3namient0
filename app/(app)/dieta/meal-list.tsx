"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { mealSlotLabel } from "@/lib/domain/sports";

import { deleteMealAction } from "./actions";

export type MealRow = {
  id: string;
  slot: string;
  description: string | null;
  kcal: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  fiber_g: number | null;
};

export function MealList({ items }: { items: MealRow[] }) {
  const [pending, startTransition] = useTransition();

  function remove(id: string) {
    startTransition(async () => {
      await deleteMealAction(id);
    });
  }

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin comidas registradas hoy.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((m) => (
        <li key={m.id} className="flex items-start justify-between rounded-md border p-3 text-sm">
          <div className="flex flex-col gap-1">
            <span className="font-medium">
              {mealSlotLabel(m.slot)}
              {m.kcal != null ? ` · ${m.kcal} kcal` : ""}
            </span>
            {m.description ? <span className="text-xs">{m.description}</span> : null}
            <span className="text-xs text-muted-foreground">
              {m.protein_g != null ? `P ${m.protein_g} ` : ""}
              {m.carbs_g != null ? `C ${m.carbs_g} ` : ""}
              {m.fat_g != null ? `G ${m.fat_g} ` : ""}
              {m.fiber_g != null ? `F ${m.fiber_g}` : ""}
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => remove(m.id)}
            disabled={pending}
          >
            Borrar
          </Button>
        </li>
      ))}
    </ul>
  );
}
