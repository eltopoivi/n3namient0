import { describe, expect, it } from "vitest";

import {
  aggregateMicros,
  buildTrainingNotes,
  disciplineToSport,
  mealTypeToSlot,
} from "@/lib/ai/mirrors";
import type { NutritionItem, TrainingResult } from "@/lib/ai/validators";

describe("mealTypeToSlot", () => {
  it("maps well-known slots", () => {
    expect(mealTypeToSlot("breakfast")).toBe("desayuno");
    expect(mealTypeToSlot("lunch")).toBe("comida");
    expect(mealTypeToSlot("dinner")).toBe("cena");
    expect(mealTypeToSlot("snack")).toBe("snack");
  });

  it("falls back to snack for ambiguous meal_types", () => {
    expect(mealTypeToSlot("pre_workout")).toBe("snack");
    expect(mealTypeToSlot("post_workout")).toBe("snack");
    expect(mealTypeToSlot("other")).toBe("snack");
  });
});

describe("disciplineToSport", () => {
  it("maps the common disciplines", () => {
    expect(disciplineToSport("trail")).toBe("carrera_trail");
    expect(disciplineToSport("road")).toBe("carrera_ruta");
    expect(disciplineToSport("track")).toBe("carrera_pista");
    expect(disciplineToSport("gym")).toBe("gym");
    expect(disciplineToSport("mobility")).toBe("ejercicio");
    expect(disciplineToSport("cross")).toBe("otro");
    expect(disciplineToSport("other")).toBe("otro");
  });
});

describe("aggregateMicros", () => {
  it("sums present micronutrients across items", () => {
    const items: NutritionItem[] = [
      {
        name: "pasta",
        amount_g: 200,
        kcal: 300,
        protein_g: 11,
        carbs_g: 60,
        fat_g: 1,
        fiber_g: 5,
        iron_mg: 2,
      },
      {
        name: "atun",
        amount_g: 150,
        kcal: 200,
        protein_g: 40,
        carbs_g: 0,
        fat_g: 2,
        fiber_g: null,
        iron_mg: 1.5,
        potassium_mg: 250,
        omega3_g: 1.2,
      },
    ];
    const out = aggregateMicros(items);
    expect(out.fiber_g).toBe(5);
    expect(out.iron_mg).toBe(3.5);
    expect(out.potassium_mg).toBe(250);
    expect(out.omega3_g).toBe(1.2);
  });

  it("omits micros absent from every item", () => {
    const items: NutritionItem[] = [
      { name: "arroz", amount_g: 100, kcal: 130, protein_g: 2.5, carbs_g: 28, fat_g: 0.3 },
    ];
    const out = aggregateMicros(items);
    expect(out.calcium_mg).toBeUndefined();
    expect(out.vitamin_c_mg).toBeUndefined();
  });
});

describe("buildTrainingNotes", () => {
  const base: TrainingResult = {
    raw_transcript: "trail 12km",
    discipline: "trail",
  };

  it("returns null when nothing is worth noting", () => {
    expect(buildTrainingNotes(base)).toBeNull();
  });

  it("concatenates user notes, RPE, max HR, nutrition and intervals", () => {
    const training: TrainingResult = {
      ...base,
      notes: "Sensaciones buenas",
      perceived_effort: 7,
      max_hr: 178,
      nutrition_during: "1 gel y 500ml de isotónica",
      intervals: [
        { type: "warmup", duration_min: 10 },
        { type: "tempo", duration_min: 20, pace_min_per_km: 4.3, hr: 170 },
      ],
    };
    const notes = buildTrainingNotes(training);
    expect(notes).toContain("Sensaciones buenas");
    expect(notes).toContain("RPE 7/10");
    expect(notes).toContain("FC máx 178");
    expect(notes).toContain("gel");
    expect(notes).toContain("tempo");
    expect(notes).toContain("170bpm");
  });
});
