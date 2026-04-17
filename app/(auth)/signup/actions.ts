"use server";

import { createClient } from "@/lib/supabase/server";
import { signUpSchema } from "@/lib/schemas/auth";
import { err, ok, type ActionResult } from "@/lib/actions/result";

function appUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL;
  if (fromEnv && fromEnv.length > 0) return fromEnv;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel && vercel.length > 0) return `https://${vercel}`;
  return "http://localhost:3000";
}

function hasSupabaseEnv(): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

function translate(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("user already registered")) {
    return "Ya existe una cuenta con ese email. Inicia sesión.";
  }
  if (m.includes("password")) return "Contraseña no válida.";
  return message;
}

export type SignUpResult = { email: string; requiresConfirmation: boolean };

export async function signUpAction(input: unknown): Promise<ActionResult<SignUpResult>> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return err("Datos inválidos", parsed.error.flatten().fieldErrors);
  }

  if (!hasSupabaseEnv()) {
    return err("Configuración incompleta del servidor.");
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${appUrl()}/auth/callback`,
      },
    });

    if (error) {
      return err(translate(error.message));
    }

    const requiresConfirmation = !data.session;
    return ok({ email: parsed.data.email, requiresConfirmation });
  } catch (cause) {
    console.error("signUpAction failed", cause);
    const message = cause instanceof Error ? cause.message : "Error inesperado";
    return err(message);
  }
}
