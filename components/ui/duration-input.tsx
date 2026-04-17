"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          inputMode="numeric"
          min={0}
          max={24}
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          placeholder="0"
          className="flex-1 text-center"
        />
        <span className="text-sm text-muted-foreground">h</span>
        <Input
          type="number"
          inputMode="numeric"
          min={0}
          max={59}
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          placeholder="0"
          className="flex-1 text-center"
        />
        <span className="text-sm text-muted-foreground">min</span>
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

export function formatMinutesHuman(total: number): string {
  if (!Number.isFinite(total) || total < 0) return "–";
  const h = Math.floor(total / 60);
  const m = Math.round(total % 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}
