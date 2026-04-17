import { Type } from "@google/genai";

export const NUTRITION_SCHEMA = {
  type: Type.OBJECT,
  required: [
    "meal_type",
    "items",
    "total_kcal",
    "total_protein_g",
    "total_carbs_g",
    "total_fat_g",
    "raw_transcript",
  ],
  properties: {
    raw_transcript: { type: Type.STRING },
    meal_type: {
      type: Type.STRING,
      enum: [
        "breakfast",
        "lunch",
        "dinner",
        "snack",
        "pre_workout",
        "post_workout",
        "other",
      ],
    },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ["name", "amount_g", "kcal", "protein_g", "carbs_g", "fat_g"],
        properties: {
          name: { type: Type.STRING },
          amount_g: { type: Type.NUMBER },
          kcal: { type: Type.NUMBER },
          protein_g: { type: Type.NUMBER },
          carbs_g: { type: Type.NUMBER },
          fat_g: { type: Type.NUMBER },
          fiber_g: { type: Type.NUMBER, nullable: true },
          sugar_g: { type: Type.NUMBER, nullable: true },
          sodium_mg: { type: Type.NUMBER, nullable: true },
        },
      },
    },
    total_kcal: { type: Type.NUMBER },
    total_protein_g: { type: Type.NUMBER },
    total_carbs_g: { type: Type.NUMBER },
    total_fat_g: { type: Type.NUMBER },
    total_fiber_g: { type: Type.NUMBER, nullable: true },
    notes: { type: Type.STRING, nullable: true },
  },
} as const;

export const TRAINING_SCHEMA = {
  type: Type.OBJECT,
  required: ["discipline", "raw_transcript"],
  properties: {
    raw_transcript: { type: Type.STRING },
    discipline: {
      type: Type.STRING,
      enum: ["trail", "road", "track", "gym", "mobility", "cross", "other"],
    },
    duration_min: { type: Type.INTEGER, nullable: true },
    distance_km: { type: Type.NUMBER, nullable: true },
    elevation_gain_m: { type: Type.INTEGER, nullable: true },
    avg_hr: { type: Type.INTEGER, nullable: true },
    max_hr: { type: Type.INTEGER, nullable: true },
    perceived_effort: { type: Type.INTEGER, nullable: true },
    intervals: {
      type: Type.ARRAY,
      nullable: true,
      items: {
        type: Type.OBJECT,
        required: ["type"],
        properties: {
          type: { type: Type.STRING },
          duration_min: { type: Type.NUMBER, nullable: true },
          distance_km: { type: Type.NUMBER, nullable: true },
          pace_min_per_km: { type: Type.NUMBER, nullable: true },
          hr: { type: Type.INTEGER, nullable: true },
          notes: { type: Type.STRING, nullable: true },
        },
      },
    },
    nutrition_during: { type: Type.STRING, nullable: true },
    notes: { type: Type.STRING, nullable: true },
  },
} as const;
