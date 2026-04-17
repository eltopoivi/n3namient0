"use server";

import { createClient } from "@/lib/supabase/server";
import { signInSchema } from "@/lib/schemas/auth";
import { err, ok, type ActionResult } from "@/lib/actions/result";

function hasSupabaseEnv(): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

function translate(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Email o contraseña incorrectos.";
  if (m.includes("email not confirmed")) {
    return "Confirma tu email antes de iniciar sesión. Revisa tu bandeja de entrada.";
  }
  return message;
}

export async function signInAction(input: unknown): Promise<ActionResult<null>> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return err("Datos inválidos", parsed.error.flatten().fieldErrors);
  }

  if (!hasSupabaseEnv()) {
    return err("Configuración incompleta del servidor. Contacta al administrador.");
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      return err(translate(error.message));
    }

    return ok(null);
  } catch (cause) {
    console.error("signInAction failed", cause);
    const message = cause instanceof Error ? cause.message : "Error inesperado";
    return err(message);
  }
}
