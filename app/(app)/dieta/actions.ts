"use server";

import { revalidatePath } from "next/cache";

import { err, ok, type ActionResult } from "@/lib/actions/result";
import { hydrationAddSchema, mealWriteSchema } from "@/lib/schemas/diet";
import { createClient } from "@/lib/supabase/server";

export async function createMealAction(input: unknown): Promise<ActionResult<null>> {
  const parsed = mealWriteSchema.safeParse(input);
  if (!parsed.success) return err("Datos inválidos", parsed.error.flatten().fieldErrors);

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return err("No autenticado");

  const { error } = await supabase.from("meals").insert({ user_id: user.id, ...parsed.data });
  if (error) return err(error.message);
  revalidatePath("/dieta");
  revalidatePath("/");
  return ok(null);
}

export async function deleteMealAction(id: string): Promise<ActionResult<null>> {
  if (!id) return err("Id requerido");
  const supabase = createClient();
  const { error } = await supabase.from("meals").delete().eq("id", id);
  if (error) return err(error.message);
  revalidatePath("/dieta");
  return ok(null);
}

export async function addHydrationAction(input: unknown): Promise<ActionResult<null>> {
  const parsed = hydrationAddSchema.safeParse(input);
  if (!parsed.success) return err("Datos inválidos", parsed.error.flatten().fieldErrors);

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return err("No autenticado");

  const { error } = await supabase
    .from("hydration_logs")
    .insert({ user_id: user.id, ...parsed.data });
  if (error) return err(error.message);
  revalidatePath("/dieta");
  revalidatePath("/");
  return ok(null);
}

export async function clearHydrationAction(date: string): Promise<ActionResult<null>> {
  if (!date) return err("Fecha requerida");
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return err("No autenticado");
  const { error } = await supabase
    .from("hydration_logs")
    .delete()
    .eq("user_id", user.id)
    .eq("date", date);
  if (error) return err(error.message);
  revalidatePath("/dieta");
  return ok(null);
}
