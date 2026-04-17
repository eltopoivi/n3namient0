import { MICRO_KEYS, type MicroKey, type NutritionItem, type NutritionResult, type TrainingResult } from "./validators";

export type MealSlot =
  | "desayuno"
  | "media_manana"
  | "comida"
  | "merienda"
  | "cena"
  | "snack";

export function mealTypeToSlot(meal_type: NutritionResult["meal_type"]): MealSlot {
  switch (meal_type) {
    case "breakfast":
      return "desayuno";
    case "lunch":
      return "comida";
    case "dinner":
      return "cena";
    case "snack":
      return "snack";
    case "pre_workout":
    case "post_workout":
    case "other":
    default:
      return "snack";
  }
}

export function aggregateMicros(items: NutritionItem[]): Record<string, number> {
  const out: Partial<Record<MicroKey, number>> = {};
  for (const key of MICRO_KEYS) {
    let sum = 0;
    let any = false;
    for (const item of items) {
      const v = item[key];
      if (typeof v === "number" && Number.isFinite(v) && v >= 0) {
        sum += v;
        any = true;
      }
    }
    if (any) out[key] = Math.round(sum * 100) / 100;
  }
  return out;
}

export function disciplineToSport(discipline: TrainingResult["discipline"]): string {
  switch (discipline) {
    case "trail":
      return "carrera_trail";
    case "road":
      return "carrera_ruta";
    case "track":
      return "carrera_pista";
    case "gym":
      return "gym";
    case "mobility":
      return "ejercicio";
    case "cross":
    case "other":
    default:
      return "otro";
  }
}

export function buildTrainingNotes(training: TrainingResult): string | null {
  const parts: string[] = [];
  if (training.notes) parts.push(training.notes);
  if (training.perceived_effort != null) parts.push(`RPE ${training.perceived_effort}/10`);
  if (training.max_hr != null) parts.push(`FC máx ${training.max_hr} bpm`);
  if (training.nutrition_during) parts.push(`Nutrición: ${training.nutrition_during}`);
  if (training.intervals && training.intervals.length > 0) {
    parts.push(
      `Intervalos: ${training.intervals
        .map((i) =>
          [
            i.type,
            i.duration_min != null ? `${i.duration_min}min` : null,
            i.distance_km != null ? `${i.distance_km}km` : null,
            i.pace_min_per_km != null ? `${i.pace_min_per_km}/km` : null,
            i.hr != null ? `${i.hr}bpm` : null,
          ]
            .filter(Boolean)
            .join(" "),
        )
        .join(" · ")}`,
    );
  }
  return parts.length > 0 ? parts.join("\n") : null;
}
