import type { Zone } from "@/lib/domain/hr-zones";

const COLORS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "hsl(var(--zone-1))",
  2: "hsl(var(--zone-2))",
  3: "hsl(var(--zone-3))",
  4: "hsl(var(--zone-4))",
  5: "hsl(var(--zone-5))",
};

const DESCRIPTIONS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "Muy suave",
  2: "Aeróbico",
  3: "Tempo",
  4: "Umbral",
  5: "VO2max",
};

export function HrZonesBar({ zones }: { zones: Zone[] }) {
  if (zones.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Añade tu FC máxima para ver tus zonas.
      </p>
    );
  }

  const minVal = zones[0]?.min ?? 0;
  const maxVal = zones[zones.length - 1]?.max ?? 0;
  const span = Math.max(1, maxVal - minVal);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-9 overflow-hidden rounded-md border border-border">
        {zones.map((z) => {
          const width = ((z.max - z.min) / span) * 100;
          return (
            <div
              key={z.zone}
              className="flex items-center justify-center text-[11px] font-medium text-white"
              style={{ width: `${width}%`, background: COLORS[z.zone] }}
              title={`Z${z.zone} · ${z.min}–${z.max} bpm`}
            >
              Z{z.zone}
            </div>
          );
        })}
      </div>
      <ul className="grid grid-cols-2 gap-1.5 text-[11px] sm:grid-cols-3 md:grid-cols-5">
        {zones.map((z) => (
          <li
            key={z.zone}
            className="flex items-start gap-1.5 rounded border border-border bg-card px-2 py-2"
          >
            <span
              aria-hidden
              className="mt-[3px] h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ background: COLORS[z.zone] }}
            />
            <span className="flex min-w-0 flex-col gap-[3px] leading-[1.35]">
              <span className="font-medium">
                Z{z.zone} · {z.min}–{z.max}
              </span>
              <span className="text-[10px] text-muted-foreground">{DESCRIPTIONS[z.zone]}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
