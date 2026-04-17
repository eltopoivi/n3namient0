"use client";

import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

export function StepperInput({
  value,
  setValue,
  min = 0,
  max = 9999,
  step = 1,
  suffix,
  className,
}: {
  value: string;
  setValue: (next: string) => void;
  min?: number | undefined;
  max?: number | undefined;
  step?: number | undefined;
  suffix?: string | undefined;
  className?: string | undefined;
}) {
  const parsed = Number(value);
  const current = Number.isFinite(parsed) ? parsed : 0;
  const clamp = (n: number) => Math.max(min, Math.min(max, n));

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-9 w-9 shrink-0"
        onClick={() => setValue(String(clamp(current - step)))}
        aria-label="Restar"
      >
        <Minus className="h-3.5 w-3.5" />
      </Button>
      <Input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        min={min}
        max={max}
        step={step}
        className="min-w-0 flex-1 text-center"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-9 w-9 shrink-0"
        onClick={() => setValue(String(clamp(current + step)))}
        aria-label="Sumar"
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
      {suffix ? <span className="w-8 shrink-0 text-xs text-muted-foreground">{suffix}</span> : null}
    </div>
  );
}
