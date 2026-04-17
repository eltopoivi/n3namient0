"use client";

import { useState, useTransition } from "react";

import { SimpleLineChart, type LinePoint } from "@/components/charts/line-chart";
import { Button } from "@/components/ui/button";
import { DurationInput, toTotalMinutes } from "@/components/ui/duration-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepperInput } from "@/components/ui/stepper-input";
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

const META: Record<
  Kind,
  { unit: string; label: string; table: "sleeps" | "rhr_readings" | "hrv_readings" | "weights" }
> = {
  sleep: { unit: "min", label: "Duración", table: "sleeps" },
  rhr: { unit: "bpm", label: "RHR", table: "rhr_readings" },
  hrv: { unit: "ms", label: "HRV", table: "hrv_readings" },
  weight: { unit: "kg", label: "Peso", table: "weights" },
};

function todayIso(): string {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export function HealthTab({ kind, rows }: { kind: Kind; rows: HealthRow[] }) {
  const [date, setDate] = useState(todayIso());

  const [sleepH, setSleepH] = useState("8");
  const [sleepM, setSleepM] = useState("0");
  const [deep, setDeep] = useState("");
  const [rem, setRem] = useState("");
  const [light, setLight] = useState("");

  const [primary, setPrimary] = useState("");
  const [secondary, setSecondary] = useState("");
  const [tertiary, setTertiary] = useState("");

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
        const duration_min = toTotalMinutes(sleepH, sleepM);
        if (duration_min <= 0) {
          setError("Duración requerida.");
          return;
        }
        res = await upsertSleepAction({
          date,
          duration_min,
          deep_pct: deep || null,
          rem_pct: rem || null,
          light_pct: light || null,
        });
      } else if (kind === "rhr") {
        res = await upsertRhrAction({ date, bpm: primary });
      } else if (kind === "hrv") {
        res = await upsertHrvAction({
          date,
          value_ms: primary,
          range_min: secondary || null,
          range_max: tertiary || null,
        });
      } else {
        res = await upsertWeightAction({ date, kg: primary, body_fat_pct: secondary || null });
      }
      if (!res.ok) setError(res.error);
      else {
        setPrimary("");
        setSecondary("");
        setTertiary("");
        setDeep("");
        setRem("");
        setLight("");
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

      <form onSubmit={submit} className="flex flex-col gap-3 rounded-md border p-3">
        <div className="flex flex-col gap-1">
          <Label>Fecha</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>

        {kind === "sleep" ? (
          <>
            <DurationInput
              hours={sleepH}
              minutes={sleepM}
              setHours={setSleepH}
              setMinutes={setSleepM}
            />
            <div className="grid grid-cols-3 gap-2">
              <StepperNumber label="Profundo %" value={deep} setValue={setDeep} min={0} max={100} step={5} />
              <StepperNumber label="REM %" value={rem} setValue={setRem} min={0} max={100} step={5} />
              <StepperNumber label="Ligero %" value={light} setValue={setLight} min={0} max={100} step={5} />
            </div>
          </>
        ) : null}

        {kind === "rhr" ? (
          <StepperNumber label="BPM" value={primary} setValue={setPrimary} min={25} max={220} />
        ) : null}

        {kind === "hrv" ? (
          <>
            <StepperNumber label="HRV (ms)" value={primary} setValue={setPrimary} min={0} max={300} />
            <div className="grid grid-cols-2 gap-2">
              <PlainNumber label="Rango mín" value={secondary} setValue={setSecondary} />
              <PlainNumber label="Rango máx" value={tertiary} setValue={setTertiary} />
            </div>
          </>
        ) : null}

        {kind === "weight" ? (
          <div className="grid grid-cols-2 gap-2">
            <PlainNumber label="kg" value={primary} setValue={setPrimary} required />
            <PlainNumber label="% grasa" value={secondary} setValue={setSecondary} />
          </div>
        ) : null}

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <div>
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
                  <span className="font-medium">{r.date}</span> —{" "}
                  {kind === "sleep" ? formatMinutes(r.value) : `${r.value} ${META[kind].unit}`}
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

function formatMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = Math.round(total % 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
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

function PlainNumber({
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

function StepperNumber({
  label,
  value,
  setValue,
  min: minValue,
  max: maxValue,
  step,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      <StepperInput value={value} setValue={setValue} min={minValue} max={maxValue} step={step} />
    </div>
  );
}
