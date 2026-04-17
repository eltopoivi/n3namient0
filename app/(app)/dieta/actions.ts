"use server";

import { revalidatePath } from "next/cache";

import { err, ok, type ActionResult } from "@/lib/actions/result";
import { hydrationAddSchema, mealWriteSchema } from "@/lib/schemas/diet";
import { createClient } from "@/lib/supabase/server";

function toMessage(cause: unknown): string {
  return cause instanceof Error ? cause.message : "Error inesperado";
}

export async function createMealAction(input: unknown): Promise<ActionResult<null>> {
  const parsed = mealWriteSchema.safeParse(input);
  if (!parsed.success) return err("Datos inválidos", parsed.error.flatten().fieldErrors);

  try {
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
  } catch (cause) {
    console.error("createMealAction failed", cause);
    return err(toMessage(cause));
  }
}

export async function deleteMealAction(id: string): Promise<ActionResult<null>> {
  if (!id) return err("Id requerido");
  try {
    const supabase = createClient();
    const { error } = await supabase.from("meals").delete().eq("id", id);
    if (error) return err(error.message);
    revalidatePath("/dieta");
    return ok(null);
  } catch (cause) {
    console.error("deleteMealAction failed", cause);
    return err(toMessage(cause));
  }
}

export async function addHydrationAction(input: unknown): Promise<ActionResult<null>> {
  const parsed = hydrationAddSchema.safeParse(input);
  if (!parsed.success) return err("Datos inválidos", parsed.error.flatten().fieldErrors);

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return err("No autenticado");

    const { error } = await supabase.from("hydration_logs").insert({ user_id: user.id, ...parsed.data });
    if (error) return err(error.message);
    revalidatePath("/dieta");
    revalidatePath("/");
    return ok(null);
  } catch (cause) {
    console.error("addHydrationAction failed", cause);
    return err(toMessage(cause));
  }
}

export async function clearHydrationAction(date: string): Promise<ActionResult<null>> {
  if (!date) return err("Fecha requerida");
  try {
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
  } catch (cause) {
    console.error("clearHydrationAction failed", cause);
    return err(toMessage(cause));
  }
}
