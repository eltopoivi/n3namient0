"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

import { createPrAction, deletePrAction } from "./actions";

export type PrRow = {
  id: string;
  sport: string | null;
  metric: string;
  value: number;
  unit: string;
  achieved_at: string;
  notes: string | null;
};

const SPORT_OPTIONS = [
  { value: "", label: "—" },
  { value: "ciclismo_carretera", label: "Ciclismo carretera" },
  { value: "ciclismo_mtb", label: "Ciclismo MTB" },
  { value: "carrera_ruta", label: "Carrera ruta" },
  { value: "carrera_trail", label: "Carrera trail" },
  { value: "gym", label: "Gym" },
  { value: "ski", label: "Ski" },
  { value: "otro", label: "Otro" },
];

export function PrList({ items }: { items: PrRow[] }) {
  const [metric, setMetric] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("");
  const [sport, setSport] = useState("");
  const [achievedAt, setAchievedAt] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createPrAction({
        metric,
        value,
        unit,
        sport: sport || null,
        achieved_at: achievedAt,
        notes: notes || null,
      });
      if (!res.ok) setError(res.error);
      else {
        setMetric("");
        setValue("");
        setUnit("");
        setNotes("");
      }
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      await deletePrAction(id);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={submit} className="grid grid-cols-2 gap-2 rounded-md border p-3">
        <div className="col-span-2 flex flex-col gap-1">
          <Label>Métrica</Label>
          <Input
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            placeholder="5k_run, ftp, back_squat_1rm…"
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Valor</Label>
          <Input
            type="number"
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Unidad</Label>
          <Input
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="s, w, kg, km…"
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Deporte</Label>
          <Select value={sport} onChange={(e) => setSport(e.target.value)}>
            {SPORT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <Label>Fecha</Label>
          <Input type="date" value={achievedAt} onChange={(e) => setAchievedAt(e.target.value)} required />
        </div>
        <div className="col-span-2 flex flex-col gap-1">
          <Label>Notas</Label>
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        {error ? <p className="col-span-2 text-sm text-destructive">{error}</p> : null}
        <div className="col-span-2">
          <Button type="submit" disabled={pending} size="sm">
            {pending ? "Guardando…" : "Añadir PR"}
          </Button>
        </div>
      </form>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavía no hay PRs.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((pr) => (
            <li
              key={pr.id}
              className="flex items-center justify-between rounded-md border p-3 text-sm"
            >
              <div className="flex flex-col">
                <span className="font-medium">
                  {pr.metric}: {pr.value} {pr.unit}
                </span>
                <span className="text-xs text-muted-foreground">
                  {pr.sport ? `${pr.sport} · ` : ""}
                  {pr.achieved_at}
                </span>
                {pr.notes ? <span className="text-xs">{pr.notes}</span> : null}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(pr.id)}
                disabled={pending}
              >
                Borrar
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
