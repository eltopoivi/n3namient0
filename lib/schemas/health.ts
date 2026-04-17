import { z } from "zod";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato AAAA-MM-DD");

const optionalNumber = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((v) => {
    if (v === null || v === undefined || v === "") return null;
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? n : null;
  })
  .nullable();

const optionalInt = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((v) => {
    if (v === null || v === undefined || v === "") return null;
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? Math.round(n) : null;
  })
  .nullable();

const notes = z.string().trim().max(500).nullable().optional().transform((v) => v ?? null);

export const sleepWriteSchema = z.object({
  date: dateSchema,
  duration_min: z
    .union([z.string(), z.number()])
    .transform((v) => (typeof v === "number" ? v : Number(v)))
    .refine((n) => Number.isFinite(n) && n > 0, "Duración > 0"),
  deep_pct: optionalNumber,
  rem_pct: optionalNumber,
  light_pct: optionalNumber,
  quality_score: optionalInt,
  notes,
});
export type SleepWriteInput = z.infer<typeof sleepWriteSchema>;

export const rhrWriteSchema = z.object({
  date: dateSchema,
  bpm: z
    .union([z.string(), z.number()])
    .transform((v) => (typeof v === "number" ? v : Number(v)))
    .refine((n) => Number.isFinite(n) && n >= 25 && n <= 220, "BPM entre 25 y 220"),
  notes,
});
export type RhrWriteInput = z.infer<typeof rhrWriteSchema>;

export const hrvWriteSchema = z.object({
  date: dateSchema,
  value_ms: z
    .union([z.string(), z.number()])
    .transform((v) => (typeof v === "number" ? v : Number(v)))
    .refine((n) => Number.isFinite(n) && n > 0, "Valor > 0"),
  range_min: optionalNumber,
  range_max: optionalNumber,
  notes,
});
export type HrvWriteInput = z.infer<typeof hrvWriteSchema>;

export const weightWriteSchema = z.object({
  date: dateSchema,
  kg: z
    .union([z.string(), z.number()])
    .transform((v) => (typeof v === "number" ? v : Number(v)))
    .refine((n) => Number.isFinite(n) && n > 0 && n < 400, "Peso entre 0 y 400 kg"),
  body_fat_pct: optionalNumber,
  notes,
});
export type WeightWriteInput = z.infer<typeof weightWriteSchema>;
