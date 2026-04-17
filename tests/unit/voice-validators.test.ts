import { describe, expect, it } from "vitest";

import { NutritionResultZ, TrainingResultZ } from "@/lib/ai/validators";

describe("NutritionResultZ", () => {
  const base = {
    raw_transcript: "He comido 200g de pasta con 150g de atún y un plátano",
    meal_type: "lunch" as const,
    items: [
      { name: "pasta", amount_g: 200, kcal: 310, protein_g: 11, carbs_g: 63, fat_g: 1.5 },
      { name: "atún en lata", amount_g: 150, kcal: 180, protein_g: 39, carbs_g: 0, fat_g: 2 },
      { name: "plátano", amount_g: 120, kcal: 105, protein_g: 1.3, carbs_g: 27, fat_g: 0.4 },
    ],
    total_kcal: 595,
    total_protein_g: 51.3,
    total_carbs_g: 90,
    total_fat_g: 3.9,
  };

  it("accepts a valid payload", () => {
    expect(NutritionResultZ.safeParse(base).success).toBe(true);
  });

  it("rejects an empty transcript", () => {
    expect(NutritionResultZ.safeParse({ ...base, raw_transcript: "" }).success).toBe(false);
  });

  it("rejects an unknown meal_type", () => {
    expect(NutritionResultZ.safeParse({ ...base, meal_type: "supper" }).success).toBe(false);
  });

  it("rejects items with zero amount", () => {
    const bad = { ...base, items: [{ ...base.items[0], amount_g: 0 }] };
    expect(NutritionResultZ.safeParse(bad).success).toBe(false);
  });

  it("rejects negative totals", () => {
    expect(NutritionResultZ.safeParse({ ...base, total_kcal: -5 }).success).toBe(false);
  });
});

describe("TrainingResultZ", () => {
  const base = {
    raw_transcript: "12 km de trail con 600 de desnivel en una hora y media, RPE 7, FC 148",
    discipline: "trail" as const,
    duration_min: 90,
    distance_km: 12,
    elevation_gain_m: 600,
    avg_hr: 148,
    perceived_effort: 7,
  };

  it("accepts a valid payload", () => {
    expect(TrainingResultZ.safeParse(base).success).toBe(true);
  });

  it("rejects avg_hr out of physiological range", () => {
    expect(TrainingResultZ.safeParse({ ...base, avg_hr: 400 }).success).toBe(false);
    expect(TrainingResultZ.safeParse({ ...base, avg_hr: 10 }).success).toBe(false);
  });

  it("rejects RPE outside 1..10", () => {
    expect(TrainingResultZ.safeParse({ ...base, perceived_effort: 0 }).success).toBe(false);
    expect(TrainingResultZ.safeParse({ ...base, perceived_effort: 11 }).success).toBe(false);
  });

  it("accepts an interval array", () => {
    const withIntervals = {
      ...base,
      intervals: [
        { type: "warmup", duration_min: 10 },
        { type: "tempo", duration_min: 20, pace_min_per_km: 4.3, hr: 170 },
      ],
    };
    expect(TrainingResultZ.safeParse(withIntervals).success).toBe(true);
  });

  it("rejects an unknown discipline", () => {
    expect(TrainingResultZ.safeParse({ ...base, discipline: "ski" }).success).toBe(false);
  });
});
