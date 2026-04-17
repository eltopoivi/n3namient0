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
  const current = Number.isFinite(Number(value)) ? Math.trunc(Number(value)) : 0;
  const clamp = (n: number) => Math.max(min, Math.min(max, n));

  function setFromNumber(next: number) {
    setValue(String(clamp(next)));
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-10 w-10 shrink-0"
        onClick={() => setFromNumber(current - step)}
        aria-label="Restar"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => setFromNumber(current)}
        min={min}
        max={max}
        step={step}
        className="text-center"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-10 w-10 shrink-0"
        onClick={() => setFromNumber(current + step)}
        aria-label="Sumar"
      >
        <Plus className="h-4 w-4" />
      </Button>
      {suffix ? <span className="w-6 text-sm text-muted-foreground">{suffix}</span> : null}
    </div>
  );
}
