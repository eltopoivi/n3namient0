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
}: {
  sleeps: HealthRow[];
  rhr: HealthRow[];
  hrv: HealthRow[];
  weights: HealthRow[];
}) {
  const [active, setActive] = useState<(typeof TABS)[number]["key"]>("sleep");

  const data: Record<(typeof TABS)[number]["key"], HealthRow[]> = {
    sleep: sleeps,
    rhr,
    hrv,
    weight: weights,
  };

  return (
    <div className="flex flex-col gap-3">
      <nav className="flex gap-1 rounded-md border p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActive(t.key)}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-sm",
              active === t.key ? "bg-foreground text-background" : "hover:bg-accent",
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <HealthTab kind={active} rows={data[active]} />
    </div>
  );
}
