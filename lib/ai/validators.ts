import { z } from "zod";

export const MICRO_KEYS = [
  "fiber_g",
  "sugar_g",
  "saturated_fat_g",
  "sodium_mg",
  "potassium_mg",
  "calcium_mg",
  "magnesium_mg",
  "iron_mg",
  "zinc_mg",
  "vitamin_c_mg",
  "vitamin_d_ug",
  "vitamin_b12_ug",
  "omega3_g",
] as const;

export type MicroKey = (typeof MICRO_KEYS)[number];

const microField = z.number().nullable().optional();

export const NutritionItemZ = z.object({
  name: z.string().min(1),
  amount_g: z.number().positive(),
  kcal: z.number().nonnegative(),
  protein_g: z.number().nonnegative(),
  carbs_g: z.number().nonnegative(),
  fat_g: z.number().nonnegative(),
  fiber_g: microField,
  sugar_g: microField,
  saturated_fat_g: microField,
  sodium_mg: microField,
  potassium_mg: microField,
  calcium_mg: microField,
  magnesium_mg: microField,
  iron_mg: microField,
  zinc_mg: microField,
  vitamin_c_mg: microField,
  vitamin_d_ug: microField,
  vitamin_b12_ug: microField,
  omega3_g: microField,
});

export const NutritionResultZ = z.object({
  raw_transcript: z.string().min(1),
  meal_type: z.enum([
    "breakfast",
    "lunch",
    "dinner",
    "snack",
    "pre_workout",
    "post_workout",
    "other",
  ]),
  items: z.array(NutritionItemZ).min(1),
  total_kcal: z.number().nonnegative(),
  total_protein_g: z.number().nonnegative(),
  total_carbs_g: z.number().nonnegative(),
  total_fat_g: z.number().nonnegative(),
  total_fiber_g: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export type NutritionResult = z.infer<typeof NutritionResultZ>;
export type NutritionItem = z.infer<typeof NutritionItemZ>;

export const TrainingIntervalZ = z.object({
  type: z.string().min(1),
  duration_min: z.number().nullable().optional(),
  distance_km: z.number().nullable().optional(),
  pace_min_per_km: z.number().nullable().optional(),
  hr: z.number().int().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const TrainingResultZ = z.object({
  raw_transcript: z.string().min(1),
  discipline: z.enum(["trail", "road", "track", "gym", "mobility", "cross", "other"]),
  duration_min: z.number().int().positive().nullable().optional(),
  distance_km: z.number().positive().nullable().optional(),
  elevation_gain_m: z.number().int().nonnegative().nullable().optional(),
  avg_hr: z.number().int().min(30).max(230).nullable().optional(),
  max_hr: z.number().int().min(30).max(230).nullable().optional(),
  perceived_effort: z.number().int().min(1).max(10).nullable().optional(),
  intervals: z.array(TrainingIntervalZ).nullable().optional(),
  nutrition_during: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export type TrainingResult = z.infer<typeof TrainingResultZ>;
