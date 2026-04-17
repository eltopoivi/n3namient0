import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { HrZonesBar } from "@/components/charts/hr-zones-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { computeHrZonesFromMax } from "@/lib/domain/hr-zones";
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
        .select("display_name,motivation_text,fc_max,hrv_range_min,hrv_range_max")
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
  const zones = profile?.fc_max ? computeHrZonesFromMax(Number(profile.fc_max)) : [];
  const hrvRangeText =
    profile?.hrv_range_min != null && profile?.hrv_range_max != null
      ? `${profile.hrv_range_min}–${profile.hrv_range_max} ms`
      : null;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          Hola{profile?.display_name ? `, ${profile.display_name}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground">Resumen de los últimos 7 días.</p>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
            <div>
              <CardTitle>Entrenos (7d)</CardTitle>
              <CardDescription>
                {workouts.length} sesiones · {formatDuration(totalDuration)} totales
              </CardDescription>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/entrenamientos">
                Ver todos <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {workouts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nada aún esta semana.</p>
            ) : (
              <ul className="flex flex-col gap-1.5 text-sm">
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
            <CardDescription>RHR, HRV, peso.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-2">
            <MetricCard
              label="RHR"
              value={rhrToday ? `${rhrToday.bpm}` : "–"}
              unit={rhrToday ? "bpm" : ""}
              sub={rhrBaseline != null ? `base 30d ${Math.round(rhrBaseline)}` : undefined}
              accent="hsl(var(--metric-rhr))"
            />
            <MetricCard
              label="HRV"
              value={hrvToday ? `${hrvToday.value_ms}` : "–"}
              unit={hrvToday ? "ms" : ""}
              sub={hrvRangeText ?? undefined}
              accent="hsl(var(--metric-hrv))"
            />
            <MetricCard
              label="Peso"
              value={weightNow ? `${weightNow.kg}` : "–"}
              unit={weightNow ? "kg" : ""}
              sub={
                weightDelta != null
                  ? `${weightDelta > 0 ? "+" : ""}${weightDelta.toFixed(1)} kg`
                  : undefined
              }
              accent="hsl(var(--metric-weight))"
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Zonas de FC</CardTitle>
            <CardDescription>
              {zones.length > 0 ? "Calculadas a partir de tu FC máxima." : "Configura tu FC máxima en Perfil."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HrZonesBar zones={zones} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
            <div>
              <CardTitle>Próximos eventos</CardTitle>
              <CardDescription>{events.length} citas</CardDescription>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/eventos">
                Gestionar <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
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
          </CardContent>
        </Card>

        {profile?.motivation_text ? (
          <Card className="md:col-span-2 xl:col-span-3">
            <CardHeader>
              <CardTitle>Motivación</CardTitle>
            </CardHeader>
            <CardContent className="whitespace-pre-wrap text-sm">{profile.motivation_text}</CardContent>
          </Card>
        ) : null}
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  unit,
  sub,
  accent,
}: {
  label: string;
  value: string;
  unit: string;
  sub?: string | undefined;
  accent: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-md border border-border bg-background p-3"
      style={{
        background: `linear-gradient(180deg, color-mix(in srgb, ${accent} 8%, hsl(var(--card))) 0%, hsl(var(--card)) 100%)`,
      }}
    >
      <span
        aria-hidden
        className="absolute left-0 top-0 h-full w-0.5"
        style={{ background: accent }}
      />
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold leading-tight">
        {value}
        {unit ? <span className="ml-1 text-xs text-muted-foreground">{unit}</span> : null}
      </div>
      {sub ? <div className="text-[10px] text-muted-foreground">{sub}</div> : null}
    </div>
  );
}
