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
  2: "Suave · aeróbico",
  3: "Moderado · tempo",
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
      <ul className="grid grid-cols-1 gap-1.5 text-xs sm:grid-cols-2 md:grid-cols-5">
        {zones.map((z) => (
          <li
            key={z.zone}
            className="flex items-center gap-2 rounded border border-border bg-card px-2 py-1.5"
          >
            <span
              aria-hidden
              className="h-3 w-3 shrink-0 rounded-sm"
              style={{ background: COLORS[z.zone] }}
            />
            <span className="flex flex-col leading-tight">
              <span className="font-medium">
                Z{z.zone} · {z.min}–{z.max} bpm
              </span>
              <span className="text-muted-foreground">{DESCRIPTIONS[z.zone]}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
