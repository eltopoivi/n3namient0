import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { parseNutritionAudio, parseTrainingAudio } from "@/lib/ai/audio-parser";
import {
  aggregateMicros,
  buildTrainingNotes,
  disciplineToSport,
  mealTypeToSlot,
} from "@/lib/ai/mirrors";
import {
  NutritionResultZ,
  TrainingResultZ,
  type NutritionResult,
  type TrainingResult,
} from "@/lib/ai/validators";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const INTENTS = ["nutrition", "training"] as const;
type Intent = (typeof INTENTS)[number];

type AuthedUser = { id: string };

type ReadResult =
  | {
      kind: "ok";
      intent: Intent;
      base64: string;
      mimeType: string;
      localDate: string | null;
      localDatetime: string | null;
    }
  | { kind: "err"; status: number; error: string };

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

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

function readString(value: FormDataEntryValue | null): string | null {
  if (typeof value === "string" && value.length > 0) return value;
  return null;
}

async function readAudio(request: NextRequest): Promise<ReadResult> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.startsWith("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");
    const intent = form.get("intent");
    const localDate = readString(form.get("localDate"));
    const localDatetime = readString(form.get("localDatetime"));
    if (!isIntent(intent)) return { kind: "err", status: 400, error: "invalid intent" };
    if (!(file instanceof File) || !file.type.startsWith("audio/")) {
      return { kind: "err", status: 400, error: "invalid audio" };
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    return {
      kind: "ok",
      intent,
      base64: buffer.toString("base64"),
      mimeType: file.type,
      localDate: localDate && DATE_RE.test(localDate) ? localDate : null,
      localDatetime,
    };
  }

  if (contentType.startsWith("application/json")) {
    const body = (await request.json()) as {
      intent?: unknown;
      audioBase64?: unknown;
      mimeType?: unknown;
      localDate?: unknown;
      localDatetime?: unknown;
    };
    if (!isIntent(body.intent)) return { kind: "err", status: 400, error: "invalid intent" };
    if (typeof body.audioBase64 !== "string" || body.audioBase64.length === 0) {
      return { kind: "err", status: 400, error: "invalid audio" };
    }
    if (typeof body.mimeType !== "string" || !body.mimeType.startsWith("audio/")) {
      return { kind: "err", status: 400, error: "invalid audio" };
    }
    const localDate = typeof body.localDate === "string" && DATE_RE.test(body.localDate) ? body.localDate : null;
    const localDatetime = typeof body.localDatetime === "string" ? body.localDatetime : null;
    return {
      kind: "ok",
      intent: body.intent,
      base64: body.audioBase64,
      mimeType: body.mimeType,
      localDate,
      localDatetime,
    };
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

function todayUtcDate(): string {
  return new Date().toISOString().slice(0, 10);
}

async function mirrorNutrition(
  userId: string,
  parsed: NutritionResult,
  date: string,
): Promise<Record<string, number> | null> {
  const admin = createAdminClient();
  const micros = aggregateMicros(parsed.items);
  const slot = mealTypeToSlot(parsed.meal_type);
  const { error } = await admin.from("meals").insert({
    user_id: userId,
    date,
    slot,
    description: parsed.raw_transcript,
    kcal: parsed.total_kcal,
    protein_g: parsed.total_protein_g,
    carbs_g: parsed.total_carbs_g,
    fat_g: parsed.total_fat_g,
    fiber_g: parsed.total_fiber_g ?? null,
    micros: Object.keys(micros).length > 0 ? micros : null,
  });
  if (error) {
    console.error("[voice-intake] mirror meals failed", error);
    return null;
  }
  return micros;
}

async function mirrorTraining(
  userId: string,
  parsed: TrainingResult,
  startedAtIso: string,
): Promise<void> {
  if (parsed.duration_min == null || parsed.duration_min <= 0) {
    console.info("[voice-intake] skipping workouts mirror: duration unknown");
    return;
  }
  const durS = Math.round(parsed.duration_min * 60);
  const distM = parsed.distance_km != null ? parsed.distance_km * 1000 : null;
  const paceSec = distM != null && distM > 0 ? durS / (distM / 1000) : null;
  const vam =
    parsed.elevation_gain_m != null && durS > 0
      ? parsed.elevation_gain_m / (durS / 3600)
      : null;

  const admin = createAdminClient();
  const { error } = await admin.from("workouts").insert({
    user_id: userId,
    started_at: startedAtIso,
    sport: disciplineToSport(parsed.discipline),
    sport_subtype: parsed.discipline,
    title: null,
    notes: buildTrainingNotes(parsed),
    duration_s: durS,
    distance_m: distM,
    avg_hr: parsed.avg_hr ?? null,
    avg_power_w: null,
    elev_gain_m: parsed.elevation_gain_m ?? null,
    elev_loss_m: null,
    pace_s_per_km: paceSec,
    vam_m_per_h: vam,
    calories: null,
    source: "voice_ai",
    raw_payload: parsed,
  });
  if (error) {
    console.error("[voice-intake] mirror workouts failed", error);
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  const user = await resolveUser(request);
  if (!user) return json({ error: "unauthorized" }, 401);

  let audio: ReadResult;
  try {
    audio = await readAudio(request);
  } catch (cause) {
    console.error("[voice-intake] body parse failed", cause);
    return json({ error: "invalid body" }, 400);
  }
  if (audio.kind === "err") return json({ error: audio.error }, audio.status);

  const { intent, base64, mimeType, localDate, localDatetime } = audio;

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

  let micros: Record<string, number> | null = null;
  try {
    if (intent === "nutrition") {
      const date = localDate ?? todayUtcDate();
      micros = await mirrorNutrition(user.id, parsed as NutritionResult, date);
    } else {
      const started = localDatetime ? new Date(localDatetime) : new Date();
      const iso = Number.isFinite(started.getTime())
        ? started.toISOString()
        : new Date().toISOString();
      await mirrorTraining(user.id, parsed as TrainingResult, iso);
    }
  } catch (mirrorErr) {
    console.error("[voice-intake] mirror threw", mirrorErr);
  }

  return json({ ok: true, record: data, micros }, 200);
}
