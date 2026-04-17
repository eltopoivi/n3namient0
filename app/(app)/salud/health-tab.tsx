"use client";

import { useState, useTransition } from "react";

import { SimpleLineChart, type LinePoint } from "@/components/charts/line-chart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { max, mean, min } from "@/lib/domain/stats";

import {
  deleteHealthRowAction,
  upsertHrvAction,
  upsertRhrAction,
  upsertSleepAction,
  upsertWeightAction,
} from "./actions";

type Kind = "sleep" | "rhr" | "hrv" | "weight";

export type HealthRow = {
  id: string;
  date: string;
  value: number;
  secondary?: number | null;
};

const META: Record<Kind, { unit: string; label: string; table: "sleeps" | "rhr_readings" | "hrv_readings" | "weights" }> = {
  sleep: { unit: "min", label: "Duración", table: "sleeps" },
  rhr: { unit: "bpm", label: "RHR", table: "rhr_readings" },
  hrv: { unit: "ms", label: "HRV", table: "hrv_readings" },
  weight: { unit: "kg", label: "Peso", table: "weights" },
};

export function HealthTab({
  kind,
  rows,
}: {
  kind: Kind;
  rows: HealthRow[];
}) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [v1, setV1] = useState("");
  const [v2, setV2] = useState("");
  const [v3, setV3] = useState("");
  const [v4, setV4] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const chartData: LinePoint[] = rows
    .slice()
    .reverse()
    .map((r) => ({ date: r.date.slice(5), value: r.value }));

  const values = rows.map((r) => r.value);
  const avg = mean(values);
  const mi = min(values);
  const ma = max(values);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      let res;
      if (kind === "sleep") {
        res = await upsertSleepAction({
          date,
          duration_min: v1,
          deep_pct: v2 || null,
          rem_pct: v3 || null,
          light_pct: v4 || null,
        });
      } else if (kind === "rhr") {
        res = await upsertRhrAction({ date, bpm: v1 });
      } else if (kind === "hrv") {
        res = await upsertHrvAction({ date, value_ms: v1, range_min: v2 || null, range_max: v3 || null });
      } else {
        res = await upsertWeightAction({ date, kg: v1, body_fat_pct: v2 || null });
      }
      if (!res.ok) setError(res.error);
      else {
        setV1("");
        setV2("");
        setV3("");
        setV4("");
      }
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      await deleteHealthRowAction(META[kind].table, id);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border p-3">
        <SimpleLineChart data={chartData} unit={META[kind].unit} />
        <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
          <StatMini label="Media" value={avg != null ? round(avg) : "–"} unit={META[kind].unit} />
          <StatMini label="Mín" value={mi != null ? round(mi) : "–"} unit={META[kind].unit} />
          <StatMini label="Máx" value={ma != null ? round(ma) : "–"} unit={META[kind].unit} />
        </div>
      </div>

      <form onSubmit={submit} className="grid grid-cols-2 gap-2 rounded-md border p-3">
        <div className="col-span-2 flex flex-col gap-1">
          <Label>Fecha</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        {kind === "sleep" ? (
          <>
            <LabelledInput label="Duración (min)" value={v1} setValue={setV1} required />
            <LabelledInput label="Profundo %" value={v2} setValue={setV2} />
            <LabelledInput label="REM %" value={v3} setValue={setV3} />
            <LabelledInput label="Ligero %" value={v4} setValue={setV4} />
          </>
        ) : null}
        {kind === "rhr" ? <LabelledInput label="BPM" value={v1} setValue={setV1} required /> : null}
        {kind === "hrv" ? (
          <>
            <LabelledInput label="HRV (ms)" value={v1} setValue={setV1} required />
            <LabelledInput label="Rango mín (ms)" value={v2} setValue={setV2} />
            <LabelledInput label="Rango máx (ms)" value={v3} setValue={setV3} />
          </>
        ) : null}
        {kind === "weight" ? (
          <>
            <LabelledInput label="kg" value={v1} setValue={setV1} required />
            <LabelledInput label="% grasa" value={v2} setValue={setV2} />
          </>
        ) : null}
        {error ? <p className="col-span-2 text-sm text-destructive">{error}</p> : null}
        <div className="col-span-2">
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </form>

      <div>
        <h3 className="mb-2 text-sm font-medium">Últimos registros</h3>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin registros.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {rows.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-md border p-2 text-sm"
              >
                <span>
                  <span className="font-medium">{r.date}</span> — {r.value} {META[kind].unit}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(r.id)}
                  disabled={pending}
                >
                  Borrar
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function round(n: number): string {
  return Math.round(n * 10) / 10 + "";
}

function StatMini({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded bg-muted p-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">
        {value}
        {value !== "–" ? ` ${unit}` : ""}
      </div>
    </div>
  );
}

function LabelledInput({
  label,
  value,
  setValue,
  required,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      <Input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required={required}
      />
    </div>
  );
}
