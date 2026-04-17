import Link from "next/link";
import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sportLabel } from "@/lib/domain/sports";
import { formatDuration, formatPace } from "@/lib/domain/workouts";
import { createClient } from "@/lib/supabase/server";

import { WorkoutForm, type WorkoutFormValues } from "../workout-form";
import { DeleteWorkoutButton } from "./delete-button";

type Row = {
  id: string;
  started_at: string;
  sport: string;
  sport_subtype: string | null;
  title: string | null;
  notes: string | null;
  duration_s: number;
  distance_m: number | null;
  avg_hr: number | null;
  avg_power_w: number | null;
  elev_gain_m: number | null;
  elev_loss_m: number | null;
  pace_s_per_km: number | null;
  vam_m_per_h: number | null;
  calories: number | null;
};

function toStr(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return "";
  return String(v);
}

function toLocalDatetime(iso: string): string {
  const d = new Date(iso);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function durationToString(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${m}:${pad(s)}`;
}

export default async function WorkoutDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { edit?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data } = await supabase
    .from("workouts")
    .select(
      "id,started_at,sport,sport_subtype,title,notes,duration_s,distance_m,avg_hr,avg_power_w,elev_gain_m,elev_loss_m,pace_s_per_km,vam_m_per_h,calories",
    )
    .eq("user_id", user.id)
    .eq("id", params.id)
    .maybeSingle();

  const w = data as Row | null;
  if (!w) notFound();

  const editing = searchParams.edit === "1";
  const km = w.distance_m != null ? (w.distance_m / 1000).toFixed(2) : null;

  if (editing) {
    const initial: WorkoutFormValues = {
      started_at: toLocalDatetime(w.started_at),
      sport: w.sport,
      sport_subtype: toStr(w.sport_subtype),
      title: toStr(w.title),
      notes: toStr(w.notes),
      duration_str: durationToString(w.duration_s),
      distance_km: w.distance_m != null ? String(w.distance_m / 1000) : "",
      avg_hr: toStr(w.avg_hr),
      avg_power_w: toStr(w.avg_power_w),
      elev_gain_m: toStr(w.elev_gain_m),
      elev_loss_m: toStr(w.elev_loss_m),
      calories: toStr(w.calories),
    };
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Editar entreno</h1>
          <Link
            href={`/entrenamientos/${w.id}`}
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Cancelar
          </Link>
        </div>
        <Card>
          <CardContent className="pt-6">
            <WorkoutForm mode="edit" id={w.id} initial={initial} />
          </CardContent>
        </Card>
      </div>
    );
  }

  const startedAt = new Date(w.started_at);

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{w.title || sportLabel(w.sport)}</h1>
          <p className="text-sm text-muted-foreground">
            {sportLabel(w.sport)}
            {w.sport_subtype ? ` · ${w.sport_subtype}` : ""} · {startedAt.toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/entrenamientos/${w.id}?edit=1`}
            className="inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium hover:bg-accent"
          >
            Editar
          </Link>
          <DeleteWorkoutButton id={w.id} />
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Resumen</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <Stat label="Duración" value={formatDuration(w.duration_s)} />
          {km ? <Stat label="Distancia" value={`${km} km`} /> : null}
          {w.avg_hr != null ? <Stat label="FC media" value={`${w.avg_hr} bpm`} /> : null}
          {w.avg_power_w != null ? <Stat label="Potencia" value={`${w.avg_power_w} W`} /> : null}
          {w.pace_s_per_km != null ? <Stat label="Ritmo" value={formatPace(w.pace_s_per_km)} /> : null}
          {w.vam_m_per_h != null ? (
            <Stat label="VAM" value={`${Math.round(w.vam_m_per_h)} m/h`} />
          ) : null}
          {w.elev_gain_m != null ? <Stat label="Desnivel +" value={`${w.elev_gain_m} m`} /> : null}
          {w.elev_loss_m != null ? <Stat label="Desnivel −" value={`${w.elev_loss_m} m`} /> : null}
          {w.calories != null ? <Stat label="Calorías" value={`${w.calories} kcal`} /> : null}
        </CardContent>
      </Card>

      {w.notes ? (
        <Card>
          <CardHeader>
            <CardTitle>Notas</CardTitle>
          </CardHeader>
          <CardContent className="whitespace-pre-wrap text-sm">{w.notes}</CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
