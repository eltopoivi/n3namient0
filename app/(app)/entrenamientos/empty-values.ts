import type { WorkoutFormValues } from "./workout-form";

export function emptyWorkoutValues(): WorkoutFormValues {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return {
    started_at: local.toISOString().slice(0, 16),
    sport: "ciclismo_carretera",
    sport_subtype: "",
    title: "",
    notes: "",
    duration_str: "",
    distance_km: "",
    avg_hr: "",
    avg_power_w: "",
    elev_gain_m: "",
    elev_loss_m: "",
    calories: "",
  };
}
