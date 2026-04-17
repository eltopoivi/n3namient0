"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type LinePoint = { date: string; value: number | null };

export function SimpleLineChart({
  data,
  unit,
  height = 180,
  formatValue,
}: {
  data: LinePoint[];
  unit?: string | undefined;
  height?: number | undefined;
  formatValue?: ((n: number) => string) | undefined;
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
      <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
        <YAxis
          tick={{ fontSize: 10 }}
          stroke="hsl(var(--muted-foreground))"
          domain={["auto", "auto"]}
          width={52}
          tickFormatter={tickFormatter}
        />
        <Tooltip
          contentStyle={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            fontSize: 12,
          }}
          formatter={tooltipFormatter}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="hsl(var(--foreground))"
          strokeWidth={2}
          dot={false}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
