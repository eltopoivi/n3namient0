"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";

import { deleteEventAction } from "./actions";

export type EventRow = {
  id: string;
  title: string;
  kind: string | null;
  sport: string | null;
  event_date: string;
  location: string | null;
  target_notes: string | null;
};

export function EventList({ items }: { items: EventRow[] }) {
  const [pending, startTransition] = useTransition();

  function remove(id: string) {
    if (!confirm("¿Borrar este evento?")) return;
    startTransition(async () => {
      await deleteEventAction(id);
    });
  }

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Aún no hay eventos.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((e) => (
        <li key={e.id} className="flex items-start justify-between rounded-md border p-3 text-sm">
          <div className="flex flex-col gap-0.5">
            <span className="font-medium">{e.title}</span>
            <span className="text-xs text-muted-foreground">
              {e.event_date}
              {e.kind ? ` · ${e.kind}` : ""}
              {e.sport ? ` · ${e.sport}` : ""}
              {e.location ? ` · ${e.location}` : ""}
            </span>
            {e.target_notes ? <span className="text-xs">{e.target_notes}</span> : null}
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => remove(e.id)} disabled={pending}>
            Borrar
          </Button>
        </li>
      ))}
    </ul>
  );
}
