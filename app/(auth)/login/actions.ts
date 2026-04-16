"use server";

import { createClient } from "@/lib/supabase/server";
import { magicLinkSchema } from "@/lib/schemas/auth";
import { err, ok, type ActionResult } from "@/lib/actions/result";

function appUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL;
  if (fromEnv && fromEnv.length > 0) return fromEnv;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel && vercel.length > 0) return `https://${vercel}`;
  return "http://localhost:3000";
}

export async function requestMagicLinkAction(input: unknown): Promise<ActionResult<{ email: string }>> {
  const parsed = magicLinkSchema.safeParse(input);
  if (!parsed.success) {
    return err("Datos inválidos", parsed.error.flatten().fieldErrors);
  }

  const supabase = createClient();
  const redirectPath = parsed.data.next ?? "/";
  const emailRedirectTo = `${appUrl()}/auth/callback?next=${encodeURIComponent(redirectPath)}`;

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo, shouldCreateUser: true },
  });

  if (error) {
    return err(error.message);
  }

  return ok({ email: parsed.data.email });
}
