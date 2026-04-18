import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { sportLabel } from "@/lib/domain/sports";
import { formatDuration } from "@/lib/domain/workouts";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Entrenamientos · N300" };

type Row = {
  id: string;
  started_at: string;
  sport: string;
  title: string | null;
  duration_s: number;
  distance_m: number | null;
};

export default async function EntrenamientosPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const rows = user
    ? ((
        await supabase
          .from("workouts")
          .select("id,started_at,sport,title,duration_s,distance_m")
          .eq("user_id", user.id)
          .order("started_at", { ascending: false })
          .limit(100)
      ).data as Row[] | null) ?? []
    : [];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Entrenamientos</h1>
          <p className="text-sm text-muted-foreground">{rows.length} sesiones recientes.</p>
        </div>
        <Button asChild size="sm">
          <Link href="/entrenamientos/nuevo">
            <Plus className="mr-1 h-4 w-4" /> Nuevo
          </Link>
        </Button>
      </header>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Todavía no hay entrenos. Añade el primero con el botón de arriba.
          </CardContent>
        </Card>
      ) : (
        <ul className="grid grid-cols-1 gap-2 lg:grid-cols-2">
          {rows.map((w) => {
            const date = new Date(w.started_at);
            const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
            const time = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
            const km = w.distance_m != null ? (w.distance_m / 1000).toFixed(1) : null;
            return (
              <li key={w.id}>
                <Link
                  href={`/entrenamientos/${w.id}`}
                  className="flex items-center justify-between rounded-md border border-border bg-card p-3 transition-colors hover:bg-accent"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{w.title || sportLabel(w.sport)}</span>
                    <span className="text-xs text-muted-foreground">
                      {sportLabel(w.sport)} · {iso} {time}
                    </span>
                  </div>
                  <div className="text-right text-xs">
                    <div>{formatDuration(w.duration_s)}</div>
                    {km ? <div className="text-muted-foreground">{km} km</div> : null}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
