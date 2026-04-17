import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

import type { HealthRow } from "./health-tab";
import { HealthTabs } from "./tabs";

export const metadata = { title: "Salud · N300" };

export default async function SaludPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const limit = 90;

  const [sleepsRes, rhrRes, hrvRes, weightsRes] = await Promise.all([
    supabase
      .from("sleeps")
      .select("id,date,duration_min")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(limit),
    supabase
      .from("rhr_readings")
      .select("id,date,bpm")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(limit),
    supabase
      .from("hrv_readings")
      .select("id,date,value_ms")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(limit),
    supabase
      .from("weights")
      .select("id,date,kg")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(limit),
  ]);

  const sleeps: HealthRow[] = (sleepsRes.data ?? []).map((r) => ({
    id: r.id as string,
    date: r.date as string,
    value: Number(r.duration_min),
  }));
  const rhr: HealthRow[] = (rhrRes.data ?? []).map((r) => ({
    id: r.id as string,
    date: r.date as string,
    value: Number(r.bpm),
  }));
  const hrv: HealthRow[] = (hrvRes.data ?? []).map((r) => ({
    id: r.id as string,
    date: r.date as string,
    value: Number(r.value_ms),
  }));
  const weights: HealthRow[] = (weightsRes.data ?? []).map((r) => ({
    id: r.id as string,
    date: r.date as string,
    value: Number(r.kg),
  }));

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Salud</h1>
        <p className="text-sm text-muted-foreground">Sueño, RHR, HRV y peso.</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Métricas</CardTitle>
        </CardHeader>
        <CardContent>
          <HealthTabs sleeps={sleeps} rhr={rhr} hrv={hrv} weights={weights} />
        </CardContent>
      </Card>
    </div>
  );
}
