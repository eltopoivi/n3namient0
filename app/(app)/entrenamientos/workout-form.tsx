"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { parseDurationString } from "@/lib/domain/workouts";
import { SPORTS, sportCaps } from "@/lib/domain/sports";

import { createWorkoutAction, updateWorkoutAction } from "./actions";

export type WorkoutFormValues = {
  started_at: string;
  sport: string;
  sport_subtype: string;
  title: string;
  notes: string;
  duration_str: string;
  distance_km: string;
  avg_hr: string;
  avg_power_w: string;
  elev_gain_m: string;
  elev_loss_m: string;
  calories: string;
};

export function WorkoutForm({
  mode,
  id,
  initial,
}: {
  mode: "create" | "edit";
  id?: string;
  initial: WorkoutFormValues;
}) {
  const router = useRouter();
  const [v, setV] = useState<WorkoutFormValues>(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const caps = sportCaps(v.sport);

  function onChange<K extends keyof WorkoutFormValues>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setV((prev) => ({ ...prev, [key]: e.target.value }));
    };
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const duration_s = parseDurationString(v.duration_str);
    if (!duration_s) {
      setError("Duración inválida. Usa mm:ss o hh:mm:ss.");
      return;
    }
    const startedAtIso = new Date(v.started_at).toISOString();
    const payload = {
      started_at: startedAtIso,
      sport: v.sport,
      sport_subtype: v.sport_subtype,
      title: v.title,
      notes: v.notes,
      duration_s,
      distance_km: caps.distance ? v.distance_km : null,
      avg_hr: caps.heartRate ? v.avg_hr : null,
      avg_power_w: caps.power ? v.avg_power_w : null,
      elev_gain_m: caps.elevation ? v.elev_gain_m : null,
      elev_loss_m: caps.elevation ? v.elev_loss_m : null,
      calories: caps.calories ? v.calories : null,
    };

    startTransition(async () => {
      if (mode === "create") {
        const res = await createWorkoutAction(payload);
        if (res.ok) {
          router.push(`/entrenamientos/${res.data.id}`);
          router.refresh();
        } else setError(res.error);
      } else if (id) {
        const res = await updateWorkoutAction(id, payload);
        if (res.ok) {
          router.push(`/entrenamientos/${id}`);
          router.refresh();
        } else setError(res.error);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Fecha y hora" className="sm:col-span-2">
          <Input type="datetime-local" value={v.started_at} onChange={onChange("started_at")} required />
        </Field>
        <Field label="Deporte">
          <Select value={v.sport} onChange={onChange("sport")}>
            {SPORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Subtipo">
          <Input
            value={v.sport_subtype}
            onChange={onChange("sport_subtype")}
            placeholder="tempo, series, Z2…"
          />
        </Field>
        <Field label="Título" className="sm:col-span-2">
          <Input value={v.title} onChange={onChange("title")} placeholder="Rodaje largo" />
        </Field>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Duración (hh:mm:ss o mm:ss)" className="sm:col-span-2">
          <Input
            value={v.duration_str}
            onChange={onChange("duration_str")}
            placeholder="1:30:00"
            required
          />
        </Field>
        {caps.distance ? (
          <Field label="Distancia (km)">
            <Input
              type="number"
              inputMode="decimal"
              value={v.distance_km}
              onChange={onChange("distance_km")}
            />
          </Field>
        ) : null}
        {caps.heartRate ? (
          <Field label="FC media (bpm)">
            <Input type="number" inputMode="numeric" value={v.avg_hr} onChange={onChange("avg_hr")} />
          </Field>
        ) : null}
        {caps.power ? (
          <Field label="Potencia media (W)">
            <Input
              type="number"
              inputMode="numeric"
              value={v.avg_power_w}
              onChange={onChange("avg_power_w")}
            />
          </Field>
        ) : null}
        {caps.elevation ? (
          <>
            <Field label="Desnivel + (m)">
              <Input
                type="number"
                inputMode="numeric"
                value={v.elev_gain_m}
                onChange={onChange("elev_gain_m")}
              />
            </Field>
            <Field label="Desnivel − (m)">
              <Input
                type="number"
                inputMode="numeric"
                value={v.elev_loss_m}
                onChange={onChange("elev_loss_m")}
              />
            </Field>
          </>
        ) : null}
        {caps.calories ? (
          <Field label="Calorías">
            <Input type="number" inputMode="numeric" value={v.calories} onChange={onChange("calories")} />
          </Field>
        ) : null}
      </section>

      <Field label="Notas">
        <Textarea rows={3} value={v.notes} onChange={onChange("notes")} />
      </Field>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : mode === "create" ? "Crear entreno" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1 ${className ?? ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
