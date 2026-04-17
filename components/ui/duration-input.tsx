"use client";

import { Label } from "@/components/ui/label";
import { StepperInput } from "@/components/ui/stepper-input";

export function DurationInput({
  hours,
  minutes,
  setHours,
  setMinutes,
  label = "Duración",
}: {
  hours: string;
  minutes: string;
  setHours: (v: string) => void;
  setMinutes: (v: string) => void;
  label?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <div className="grid grid-cols-2 gap-2">
        <StepperInput value={hours} setValue={setHours} min={0} max={24} suffix="h" />
        <StepperInput value={minutes} setValue={setMinutes} min={0} max={59} step={5} suffix="min" />
      </div>
    </div>
  );
}

export function toTotalMinutes(hours: string, minutes: string): number {
  const h = Number.isFinite(Number(hours)) ? Math.max(0, Math.trunc(Number(hours))) : 0;
  const m = Number.isFinite(Number(minutes)) ? Math.max(0, Math.trunc(Number(minutes))) : 0;
  return h * 60 + m;
}

export function fromTotalMinutes(total: number | null | undefined): { hours: string; minutes: string } {
  if (total == null || !Number.isFinite(total) || total < 0) return { hours: "", minutes: "" };
  const h = Math.floor(total / 60);
  const m = total % 60;
  return { hours: String(h), minutes: String(m) };
}
