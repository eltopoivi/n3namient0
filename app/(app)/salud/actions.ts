"use server";

import { revalidatePath } from "next/cache";

import { err, ok, type ActionResult } from "@/lib/actions/result";
import {
  hrvWriteSchema,
  rhrWriteSchema,
  sleepWriteSchema,
  weightWriteSchema,
} from "@/lib/schemas/health";
import { createClient } from "@/lib/supabase/server";

type Table = "sleeps" | "rhr_readings" | "hrv_readings" | "weights";

async function upsert(
  table: Table,
  payload: Record<string, unknown>,
  onConflict: string,
): Promise<ActionResult<null>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return err("No autenticado");

  const { error } = await supabase
    .from(table)
    .upsert({ user_id: user.id, ...payload }, { onConflict });
  if (error) return err(error.message);
  revalidatePath("/salud");
  revalidatePath("/");
  return ok(null);
}

export async function upsertSleepAction(input: unknown): Promise<ActionResult<null>> {
  const parsed = sleepWriteSchema.safeParse(input);
  if (!parsed.success) return err("Datos inválidos", parsed.error.flatten().fieldErrors);
  return upsert("sleeps", parsed.data, "user_id,date");
}

export async function upsertRhrAction(input: unknown): Promise<ActionResult<null>> {
  const parsed = rhrWriteSchema.safeParse(input);
  if (!parsed.success) return err("Datos inválidos", parsed.error.flatten().fieldErrors);
  return upsert("rhr_readings", parsed.data, "user_id,date");
}

export async function upsertHrvAction(input: unknown): Promise<ActionResult<null>> {
  const parsed = hrvWriteSchema.safeParse(input);
  if (!parsed.success) return err("Datos inválidos", parsed.error.flatten().fieldErrors);
  return upsert("hrv_readings", parsed.data, "user_id,date");
}

export async function upsertWeightAction(input: unknown): Promise<ActionResult<null>> {
  const parsed = weightWriteSchema.safeParse(input);
  if (!parsed.success) return err("Datos inválidos", parsed.error.flatten().fieldErrors);
  return upsert("weights", parsed.data, "user_id,date");
}

export async function deleteHealthRowAction(
  table: Table,
  id: string,
): Promise<ActionResult<null>> {
  if (!id) return err("Id requerido");
  const supabase = createClient();
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) return err(error.message);
  revalidatePath("/salud");
  revalidatePath("/");
  return ok(null);
}
