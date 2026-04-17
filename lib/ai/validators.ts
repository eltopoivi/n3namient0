import { z } from "zod";

export const NutritionItemZ = z.object({
  name: z.string().min(1),
  amount_g: z.number().positive(),
  kcal: z.number().nonnegative(),
  protein_g: z.number().nonnegative(),
  carbs_g: z.number().nonnegative(),
  fat_g: z.number().nonnegative(),
  fiber_g: z.number().nullable().optional(),
  sugar_g: z.number().nullable().optional(),
  sodium_mg: z.number().nullable().optional(),
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
