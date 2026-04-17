"use server";

import { revalidatePath } from "next/cache";

import { err, ok, type ActionResult } from "@/lib/actions/result";
import { computeHrZonesFromMax } from "@/lib/domain/hr-zones";
import { prWriteSchema } from "@/lib/schemas/pr";
import { profileUpdateSchema } from "@/lib/schemas/profile";
import { createClient } from "@/lib/supabase/server";

function toMessage(cause: unknown): string {
  return cause instanceof Error ? cause.message : "Error inesperado";
}

export async function upsertProfileAction(input: unknown): Promise<ActionResult<null>> {
  const parsed = profileUpdateSchema.safeParse(input);
  if (!parsed.success) return err("Datos inválidos", parsed.error.flatten().fieldErrors);

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return err("No autenticado");

    const fcZones = parsed.data.fc_max ? computeHrZonesFromMax(parsed.data.fc_max) : null;

    const { error } = await supabase.from("profiles").upsert(
      {
        user_id: user.id,
        display_name: parsed.data.display_name,
        birthdate: parsed.data.birthdate,
        height_cm: parsed.data.height_cm,
        weight_kg: parsed.data.weight_kg,
        fc_max: parsed.data.fc_max,
        fc_rest: parsed.data.fc_rest,
        vo2max: parsed.data.vo2max,
        hrv_range_min: parsed.data.hrv_range_min,
        hrv_range_max: parsed.data.hrv_range_max,
        motivation_text: parsed.data.motivation_text,
        fc_zones: fcZones,
      },
      { onConflict: "user_id" },
    );

    if (error) return err(error.message);
    revalidatePath("/perfil");
    return ok(null);
  } catch (cause) {
    console.error("upsertProfileAction failed", cause);
    return err(toMessage(cause));
  }
}

export async function createPrAction(input: unknown): Promise<ActionResult<null>> {
  const parsed = prWriteSchema.safeParse(input);
  if (!parsed.success) return err("Datos inválidos", parsed.error.flatten().fieldErrors);

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return err("No autenticado");

    const { error } = await supabase.from("prs").insert({ user_id: user.id, ...parsed.data });
    if (error) return err(error.message);
    revalidatePath("/perfil");
    return ok(null);
  } catch (cause) {
    console.error("createPrAction failed", cause);
    return err(toMessage(cause));
  }
}

export async function deletePrAction(id: string): Promise<ActionResult<null>> {
  if (!id) return err("Id requerido");
  try {
    const supabase = createClient();
    const { error } = await supabase.from("prs").delete().eq("id", id);
    if (error) return err(error.message);
    revalidatePath("/perfil");
    return ok(null);
  } catch (cause) {
    console.error("deletePrAction failed", cause);
    return err(toMessage(cause));
  }
}

export async function signOutAction(): Promise<ActionResult<null>> {
  try {
    const supabase = createClient();
    await supabase.auth.signOut();
    return ok(null);
  } catch (cause) {
    console.error("signOutAction failed", cause);
    return err(toMessage(cause));
  }
}
