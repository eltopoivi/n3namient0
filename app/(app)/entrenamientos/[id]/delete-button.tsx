"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";

import { deleteWorkoutAction } from "../actions";

export function DeleteWorkoutButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!confirm("¿Borrar este entreno?")) return;
    startTransition(async () => {
      await deleteWorkoutAction(id);
    });
  }

  return (
    <Button type="button" variant="destructive" size="sm" onClick={onClick} disabled={pending}>
      {pending ? "Borrando…" : "Borrar"}
    </Button>
  );
}
