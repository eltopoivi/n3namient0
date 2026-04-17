import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

import { EventForm } from "./event-form";
import { EventList, type EventRow } from "./event-list";

export const metadata = { title: "Eventos · N300" };

export default async function EventosPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("events")
    .select("id,title,kind,sport,event_date,location,target_notes")
    .eq("user_id", user.id)
    .order("event_date", { ascending: true });
  const items = (data ?? []) as EventRow[];

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = items.filter((e) => e.event_date >= today);
  const past = items.filter((e) => e.event_date < today);

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Eventos</h1>
        <p className="text-sm text-muted-foreground">Carreras y citas importantes.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Nuevo evento</CardTitle>
        </CardHeader>
        <CardContent>
          <EventForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Próximos</CardTitle>
        </CardHeader>
        <CardContent>
          <EventList items={upcoming} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pasados</CardTitle>
        </CardHeader>
        <CardContent>
          <EventList items={past.reverse()} />
        </CardContent>
      </Card>
    </div>
  );
}
