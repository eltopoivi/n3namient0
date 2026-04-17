"use client";

import { useState, useTransition } from "react";

import { HrZonesBar } from "@/components/charts/hr-zones-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { computeHrZonesFromMax } from "@/lib/domain/hr-zones";

import { upsertProfileAction } from "./actions";

type Values = {
  display_name: string;
  birthdate: string;
  height_cm: string;
  weight_kg: string;
  fc_max: string;
  fc_rest: string;
  vo2max: string;
  hrv_range_min: string;
  hrv_range_max: string;
  motivation_text: string;
};

export function ProfileForm({ initial }: { initial: Values }) {
  const [v, setV] = useState<Values>(initial);
  const [status, setStatus] = useState<null | { kind: "ok" } | { kind: "err"; message: string }>(null);
  const [pending, startTransition] = useTransition();

  const fcMaxNum = Number(v.fc_max);
  const zones = Number.isFinite(fcMaxNum) && fcMaxNum > 0 ? computeHrZonesFromMax(fcMaxNum) : [];

  function onChange<K extends keyof Values>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setV((prev) => ({ ...prev, [key]: e.target.value }));
    };
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    startTransition(async () => {
      const res = await upsertProfileAction(v);
      if (res.ok) setStatus({ kind: "ok" });
      else setStatus({ kind: "err", message: res.error });
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Nombre" className="sm:col-span-2 lg:col-span-3">
          <Input value={v.display_name} onChange={onChange("display_name")} />
        </Field>
        <Field label="Nacimiento">
          <Input type="date" value={v.birthdate} onChange={onChange("birthdate")} />
        </Field>
        <Field label="Altura (cm)">
          <Input type="number" inputMode="decimal" value={v.height_cm} onChange={onChange("height_cm")} />
        </Field>
        <Field label="Peso (kg)">
          <Input type="number" inputMode="decimal" value={v.weight_kg} onChange={onChange("weight_kg")} />
        </Field>
        <Field label="VO2max">
          <Input type="number" inputMode="decimal" value={v.vo2max} onChange={onChange("vo2max")} />
        </Field>
        <Field label="FC máx (bpm)">
          <Input type="number" inputMode="numeric" value={v.fc_max} onChange={onChange("fc_max")} />
        </Field>
        <Field label="FC reposo (bpm)">
          <Input type="number" inputMode="numeric" value={v.fc_rest} onChange={onChange("fc_rest")} />
        </Field>
        <Field label="HRV rango mín (ms)">
          <Input
            type="number"
            inputMode="decimal"
            value={v.hrv_range_min}
            onChange={onChange("hrv_range_min")}
          />
        </Field>
        <Field label="HRV rango máx (ms)">
          <Input
            type="number"
            inputMode="decimal"
            value={v.hrv_range_max}
            onChange={onChange("hrv_range_max")}
          />
        </Field>
      </section>

      <div className="flex flex-col gap-2">
        <Label>Zonas de FC</Label>
        <HrZonesBar zones={zones} />
      </div>

      <Field label="Motivación">
        <Textarea
          rows={3}
          value={v.motivation_text}
          onChange={onChange("motivation_text")}
          placeholder="¿Qué te motiva?"
        />
      </Field>

      {status?.kind === "ok" ? (
        <p className="text-sm text-muted-foreground">Guardado.</p>
      ) : null}
      {status?.kind === "err" ? (
        <p role="alert" className="text-sm text-destructive">
          {status.message}
        </p>
      ) : null}

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Guardar"}
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
