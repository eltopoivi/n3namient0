"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type LinePoint = { date: string; value: number | null };

export function SimpleLineChart({
  data,
  unit,
  height = 220,
  formatValue,
  color = "hsl(var(--foreground))",
  band,
}: {
  data: LinePoint[];
  unit?: string | undefined;
  height?: number | undefined;
  formatValue?: ((n: number) => string) | undefined;
  color?: string | undefined;
  band?: { min: number; max: number; label?: string } | undefined;
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-44 items-center justify-center text-sm text-muted-foreground">
        Sin datos todavía.
      </div>
    );
  }

  const tickFormatter = formatValue
    ? (v: unknown) => (typeof v === "number" ? formatValue(v) : String(v))
    : (v: unknown) => String(v);

  const tooltipFormatter = (v: number | string) => {
    const num = typeof v === "number" ? v : Number(v);
    if (formatValue && Number.isFinite(num)) return [formatValue(num), ""] as [string, string];
    return [`${v}${unit ? ` ${unit}` : ""}`, ""] as [string, string];
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10 }}
          stroke="hsl(var(--muted-foreground))"
          tickLine={false}
          axisLine={{ stroke: "hsl(var(--border))" }}
        />
        <YAxis
          tick={{ fontSize: 10 }}
          stroke="hsl(var(--muted-foreground))"
          domain={["auto", "auto"]}
          width={56}
          tickFormatter={tickFormatter}
          tickLine={false}
          axisLine={{ stroke: "hsl(var(--border))" }}
        />
        {band ? (
          <ReferenceArea
            y1={band.min}
            y2={band.max}
            fill={color}
            fillOpacity={0.12}
            stroke={color}
            strokeOpacity={0.3}
            strokeDasharray="3 3"
            {...(band.label
              ? { label: { value: band.label, position: "insideTopRight", fontSize: 10, fill: color } }
              : {})}
          />
        ) : null}
        <Tooltip
          cursor={{ stroke: "hsl(var(--border))", strokeDasharray: "3 3" }}
          contentStyle={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            fontSize: 12,
            borderRadius: 6,
          }}
          formatter={tooltipFormatter}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={{ r: 3, fill: color, stroke: color }}
          activeDot={{ r: 4 }}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
