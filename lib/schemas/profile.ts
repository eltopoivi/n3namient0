import { z } from "zod";

const optionalNumber = z
  .union([z.string(), z.number(), z.null()])
  .transform((v) => {
    if (v === null || v === "" || v === undefined) return null;
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? n : null;
  })
  .nullable();

const optionalInt = z
  .union([z.string(), z.number(), z.null()])
  .transform((v) => {
    if (v === null || v === "" || v === undefined) return null;
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? Math.round(n) : null;
  })
  .nullable();

export const profileUpdateSchema = z.object({
  display_name: z.string().trim().max(80).nullable().optional().transform((v) => v ?? null),
  birthdate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato AAAA-MM-DD")
    .nullable()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v && v !== "" ? v : null)),
  height_cm: optionalNumber,
  weight_kg: optionalNumber,
  fc_max: optionalInt,
  fc_rest: optionalInt,
  vo2max: optionalNumber,
  hrv_range_min: optionalNumber,
  hrv_range_max: optionalNumber,
  motivation_text: z.string().trim().max(1000).nullable().optional().transform((v) => v ?? null),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
