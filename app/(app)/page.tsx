import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { sportLabel } from "@/lib/domain/sports";
import { mean } from "@/lib/domain/stats";
import { formatDuration } from "@/lib/domain/workouts";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Inicio · N300" };

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function dateOnly(isoOrDate: string): string {
  return isoOrDate.slice(0, 10);
}

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const since7 = daysAgoIso(7);
  const since30 = daysAgoIso(30);
  const today = new Date().toISOString().slice(0, 10);

  const [workoutsRes, rhrRecentRes, rhr30Res, hrvRecentRes, weightRes, eventsRes, profileRes] =
    await Promise.all([
      supabase
        .from("workouts")
        .select("sport,duration_s,distance_m,started_at")
        .eq("user_id", user.id)
        .gte("started_at", since7)
        .order("started_at", { ascending: false }),
      supabase
        .from("rhr_readings")
        .select("bpm,date")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(1),
      supabase
        .from("rhr_readings")
        .select("bpm")
        .eq("user_id", user.id)
        .gte("date", dateOnly(since30)),
      supabase
        .from("hrv_readings")
        .select("value_ms,date,range_min,range_max")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(1),
      supabase
        .from("weights")
        .select("kg,date")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(2),
      supabase
        .from("events")
        .select("id,title,event_date,sport")
        .eq("user_id", user.id)
        .gte("event_date", today)
        .order("event_date", { ascending: true })
        .limit(3),
      supabase
        .from("profiles")
        .select("display_name,motivation_text")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

  const workouts = workoutsRes.data ?? [];
  const workoutsBySport = new Map<string, { duration: number; distance: number; count: number }>();
  for (const w of workouts) {
    const key = w.sport as string;
    const cur = workoutsBySport.get(key) ?? { duration: 0, distance: 0, count: 0 };
    cur.duration += Number(w.duration_s) || 0;
    cur.distance += Number(w.distance_m ?? 0) || 0;
    cur.count += 1;
    workoutsBySport.set(key, cur);
  }
  const totalDuration = workouts.reduce((acc, w) => acc + (Number(w.duration_s) || 0), 0);

  const rhrToday = rhrRecentRes.data?.[0];
  const rhrBaseline = mean((rhr30Res.data ?? []).map((r) => Number(r.bpm)));
  const hrvToday = hrvRecentRes.data?.[0];
  const weightNow = weightRes.data?.[0];
  const weightPrev = weightRes.data?.[1];
  const weightDelta =
    weightNow && weightPrev ? Number(weightNow.kg) - Number(weightPrev.kg) : null;

  const events = eventsRes.data ?? [];
  const profile = profileRes.data;

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Hola{profile?.display_name ? `, ${profile.display_name}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground">Resumen de los últimos 7 días.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Entrenos (7d)</CardTitle>
          <CardDescription>
            {workouts.length} sesiones · {formatDuration(totalDuration)} totales
          </CardDescription>
        </CardHeader>
        <CardContent>
          {workouts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nada aún esta semana.</p>
          ) : (
            <ul className="flex flex-col gap-1 text-sm">
              {[...workoutsBySport.entries()].map(([sport, agg]) => (
                <li key={sport} className="flex items-center justify-between">
                  <span>{sportLabel(sport)}</span>
                  <span className="text-xs text-muted-foreground">
                    {agg.count} · {formatDuration(agg.duration)}
                    {agg.distance > 0 ? ` · ${(agg.distance / 1000).toFixed(1)} km` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recuperación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <MetricMini
              label="RHR hoy"
              value={rhrToday ? `${rhrToday.bpm} bpm` : "–"}
              sub={
                rhrBaseline != null
                  ? `base 30d: ${Math.round(rhrBaseline)}`
                  : undefined
              }
            />
            <MetricMini
              label="HRV hoy"
              value={hrvToday ? `${hrvToday.value_ms} ms` : "–"}
              sub={
                hrvToday?.range_min != null && hrvToday?.range_max != null
                  ? `rango ${hrvToday.range_min}–${hrvToday.range_max}`
                  : undefined
              }
            />
            <MetricMini
              label="Peso"
              value={weightNow ? `${weightNow.kg} kg` : "–"}
              sub={
                weightDelta != null
                  ? `${weightDelta > 0 ? "+" : ""}${weightDelta.toFixed(1)} kg`
                  : undefined
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Próximos eventos</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin eventos próximos.</p>
          ) : (
            <ul className="flex flex-col gap-1 text-sm">
              {events.map((e) => (
                <li key={e.id} className="flex items-center justify-between">
                  <span className="font-medium">{e.title}</span>
                  <span className="text-xs text-muted-foreground">{e.event_date}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3">
            <Button asChild size="sm" variant="outline">
              <Link href="/eventos">Gestionar eventos</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {profile?.motivation_text ? (
        <Card>
          <CardHeader>
            <CardTitle>Motivación</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">{profile.motivation_text}</CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function MetricMini({ label, value, sub }: { label: string; value: string; sub?: string | undefined }) {
  return (
    <div className="rounded bg-muted p-3">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value}</div>
      {sub ? <div className="text-[10px] text-muted-foreground">{sub}</div> : null}
    </div>
  );
}
