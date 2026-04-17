"use client";

import { useState } from "react";

import { cn } from "@/lib/utils/cn";

import { HealthTab, type HealthRow } from "./health-tab";

const TABS = [
  { key: "sleep", label: "Sueño" },
  { key: "rhr", label: "RHR" },
  { key: "hrv", label: "HRV" },
  { key: "weight", label: "Peso" },
] as const;

export function HealthTabs({
  sleeps,
  rhr,
  hrv,
  weights,
  hrvRange,
}: {
  sleeps: HealthRow[];
  rhr: HealthRow[];
  hrv: HealthRow[];
  weights: HealthRow[];
  hrvRange: { min: number; max: number } | null;
}) {
  const [active, setActive] = useState<(typeof TABS)[number]["key"]>("sleep");

  const data: Record<(typeof TABS)[number]["key"], HealthRow[]> = {
    sleep: sleeps,
    rhr,
    hrv,
    weight: weights,
  };

  return (
    <div className="flex flex-col gap-4">
      <nav className="inline-flex gap-1 self-start rounded-md border border-border bg-card p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActive(t.key)}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm transition-colors",
              active === t.key ? "bg-foreground text-background" : "hover:bg-accent",
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <HealthTab kind={active} rows={data[active]} hrvRange={hrvRange} />
    </div>
  );
}
