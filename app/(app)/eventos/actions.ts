"use server";

import { revalidatePath } from "next/cache";

import { err, ok, type ActionResult } from "@/lib/actions/result";
import { eventWriteSchema } from "@/lib/schemas/event";
import { createClient } from "@/lib/supabase/server";

export async function createEventAction(input: unknown): Promise<ActionResult<null>> {
  const parsed = eventWriteSchema.safeParse(input);
  if (!parsed.success) return err("Datos inválidos", parsed.error.flatten().fieldErrors);

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return err("No autenticado");

  const { error } = await supabase.from("events").insert({ user_id: user.id, ...parsed.data });
  if (error) return err(error.message);
  revalidatePath("/eventos");
  revalidatePath("/");
  return ok(null);
}

export async function deleteEventAction(id: string): Promise<ActionResult<null>> {
  if (!id) return err("Id requerido");
  const supabase = createClient();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) return err(error.message);
  revalidatePath("/eventos");
  revalidatePath("/");
  return ok(null);
}
