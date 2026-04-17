import { z } from "zod";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato AAAA-MM-DD");

export const prWriteSchema = z.object({
  sport: z.string().trim().max(40).nullable().optional().transform((v) => (v ? v : null)),
  metric: z.string().trim().min(1, "Métrica requerida").max(80),
  value: z
    .union([z.string(), z.number()])
    .transform((v) => (typeof v === "number" ? v : Number(v)))
    .refine((n) => Number.isFinite(n), "Valor numérico"),
  unit: z.string().trim().min(1, "Unidad requerida").max(10),
  achieved_at: dateSchema,
  notes: z.string().trim().max(300).nullable().optional().transform((v) => v ?? null),
});

export type PrWriteInput = z.infer<typeof prWriteSchema>;
