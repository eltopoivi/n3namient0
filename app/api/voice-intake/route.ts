import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { parseNutritionAudio, parseTrainingAudio } from "@/lib/ai/audio-parser";
import { NutritionResultZ, TrainingResultZ } from "@/lib/ai/validators";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const INTENTS = ["nutrition", "training"] as const;
type Intent = (typeof INTENTS)[number];

type AuthedUser = { id: string };

async function resolveUser(request: NextRequest): Promise<AuthedUser | null> {
  const authHeader = request.headers.get("authorization");
  if (authHeader && /^bearer /i.test(authHeader)) {
    const token = authHeader.slice(7).trim();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon || !token) return null;
    const client = createSupabaseClient(url, anon);
    const { data, error } = await client.auth.getUser(token);
    if (error || !data.user) return null;
    return { id: data.user.id };
  }

  const server = createServerClient();
  const { data } = await server.auth.getUser();
  return data.user ? { id: data.user.id } : null;
}

function json<T>(body: T, status = 200): Response {
  return NextResponse.json(body, { status });
}

function isIntent(value: unknown): value is Intent {
  return typeof value === "string" && (INTENTS as readonly string[]).includes(value);
}

async function readAudio(
  request: NextRequest,
): Promise<
  | { kind: "ok"; intent: Intent; base64: string; mimeType: string }
  | { kind: "err"; status: number; error: string }
> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.startsWith("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");
    const intent = form.get("intent");
    if (!isIntent(intent)) return { kind: "err", status: 400, error: "invalid intent" };
    if (!(file instanceof File) || !file.type.startsWith("audio/")) {
      return { kind: "err", status: 400, error: "invalid audio" };
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    return { kind: "ok", intent, base64: buffer.toString("base64"), mimeType: file.type };
  }

  if (contentType.startsWith("application/json")) {
    const body = (await request.json()) as { intent?: unknown; audioBase64?: unknown; mimeType?: unknown };
    if (!isIntent(body.intent)) return { kind: "err", status: 400, error: "invalid intent" };
    if (typeof body.audioBase64 !== "string" || body.audioBase64.length === 0) {
      return { kind: "err", status: 400, error: "invalid audio" };
    }
    if (typeof body.mimeType !== "string" || !body.mimeType.startsWith("audio/")) {
      return { kind: "err", status: 400, error: "invalid audio" };
    }
    return { kind: "ok", intent: body.intent, base64: body.audioBase64, mimeType: body.mimeType };
  }

  return { kind: "err", status: 400, error: "unsupported content-type" };
}

async function extract(intent: Intent, base64: string, mimeType: string) {
  const raw =
    intent === "nutrition"
      ? await parseNutritionAudio(base64, mimeType)
      : await parseTrainingAudio(base64, mimeType);
  return intent === "nutrition" ? NutritionResultZ.parse(raw) : TrainingResultZ.parse(raw);
}

export async function POST(request: NextRequest): Promise<Response> {
  const user = await resolveUser(request);
  if (!user) return json({ error: "unauthorized" }, 401);

  let audio;
  try {
    audio = await readAudio(request);
  } catch (cause) {
    console.error("[voice-intake] body parse failed", cause);
    return json({ error: "invalid body" }, 400);
  }
  if (audio.kind === "err") return json({ error: audio.error }, audio.status);

  const { intent, base64, mimeType } = audio;

  let parsed;
  try {
    parsed = await extract(intent, base64, mimeType);
  } catch (firstErr) {
    console.error("[voice-intake] first attempt failed", firstErr);
    try {
      parsed = await extract(intent, base64, mimeType);
    } catch (secondErr) {
      console.error("[voice-intake] retry failed", secondErr);
      return json({ error: "could not parse audio" }, 502);
    }
  }

  console.info(
    `[voice-intake] ${intent} user=${user.id} transcript=${JSON.stringify(parsed.raw_transcript)}`,
  );

  const admin = createAdminClient();
  const table = intent === "nutrition" ? "nutrition_log" : "training_log";
  const { data, error } = await admin
    .from(table)
    .insert({ ...parsed, user_id: user.id })
    .select()
    .single();

  if (error) {
    console.error("[voice-intake] insert failed", error);
    return json({ error: "db error" }, 500);
  }

  return json({ ok: true, record: data }, 200);
}
