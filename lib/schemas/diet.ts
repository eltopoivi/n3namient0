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

const SLOTS = ["desayuno", "media_manana", "comida", "merienda", "cena", "snack"] as const;

export const mealWriteSchema = z.object({
  date: dateSchema,
  slot: z.enum(SLOTS),
  description: z.string().trim().max(500).nullable().optional().transform((v) => v ?? null),
  kcal: optionalNumber,
  protein_g: optionalNumber,
  carbs_g: optionalNumber,
  fat_g: optionalNumber,
  fiber_g: optionalNumber,
});
export type MealWriteInput = z.infer<typeof mealWriteSchema>;

export const hydrationAddSchema = z.object({
  date: dateSchema,
  ml: z
    .union([z.string(), z.number()])
    .transform((v) => (typeof v === "number" ? v : Number(v)))
    .refine((n) => Number.isFinite(n) && n > 0 && n <= 5000, "ml entre 1 y 5000"),
});
export type HydrationAddInput = z.infer<typeof hydrationAddSchema>;
