"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { err, ok, type ActionResult } from "@/lib/actions/result";
import { workoutWriteSchema } from "@/lib/schemas/workout";
import { paceSecPerKm, vamMetersPerHour } from "@/lib/domain/workouts";
import { createClient } from "@/lib/supabase/server";

function buildPayload(input: ReturnType<typeof workoutWriteSchema.parse>) {
  const distanceM = input.distance_km == null ? null : input.distance_km * 1000;
  const elevGain = input.elev_gain_m;
  const durS = input.duration_s;
  const pace = distanceM != null ? paceSecPerKm(durS, distanceM) : null;
  const vam = elevGain != null ? vamMetersPerHour(elevGain, durS) : null;

  return {
    started_at: input.started_at,
    sport: input.sport,
    sport_subtype: input.sport_subtype,
    title: input.title,
    notes: input.notes,
    duration_s: Math.round(durS),
    distance_m: distanceM,
    avg_hr: input.avg_hr,
    avg_power_w: input.avg_power_w,
    elev_gain_m: input.elev_gain_m,
    elev_loss_m: input.elev_loss_m,
    calories: input.calories,
    pace_s_per_km: pace,
    vam_m_per_h: vam,
  };
}

function toMessage(cause: unknown): string {
  return cause instanceof Error ? cause.message : "Error inesperado";
}

export async function createWorkoutAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = workoutWriteSchema.safeParse(input);
  if (!parsed.success) return err("Datos inválidos", parsed.error.flatten().fieldErrors);

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return err("No autenticado");

    const { data, error } = await supabase
      .from("workouts")
      .insert({ user_id: user.id, source: "manual", ...buildPayload(parsed.data) })
      .select("id")
      .single();

    if (error || !data) return err(error?.message ?? "No se pudo crear");
    revalidatePath("/entrenamientos");
    revalidatePath("/");
    return ok({ id: data.id });
  } catch (cause) {
    console.error("createWorkoutAction failed", cause);
    return err(toMessage(cause));
  }
}

export async function updateWorkoutAction(id: string, input: unknown): Promise<ActionResult<null>> {
  if (!id) return err("Id requerido");
  const parsed = workoutWriteSchema.safeParse(input);
  if (!parsed.success) return err("Datos inválidos", parsed.error.flatten().fieldErrors);

  try {
    const supabase = createClient();
    const { error } = await supabase.from("workouts").update(buildPayload(parsed.data)).eq("id", id);
    if (error) return err(error.message);
    revalidatePath("/entrenamientos");
    revalidatePath(`/entrenamientos/${id}`);
    revalidatePath("/");
    return ok(null);
  } catch (cause) {
    console.error("updateWorkoutAction failed", cause);
    return err(toMessage(cause));
  }
}

export async function deleteWorkoutAction(id: string): Promise<ActionResult<null>> {
  if (!id) return err("Id requerido");
  try {
    const supabase = createClient();
    const { error } = await supabase.from("workouts").delete().eq("id", id);
    if (error) return err(error.message);
    revalidatePath("/entrenamientos");
    revalidatePath("/");
  } catch (cause) {
    console.error("deleteWorkoutAction failed", cause);
    return err(toMessage(cause));
  }
  redirect("/entrenamientos");
}
