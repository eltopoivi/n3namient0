import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

import { Hydration } from "./hydration";
import { MealForm } from "./meal-form";
import { MealList, type MealRow } from "./meal-list";

export const metadata = { title: "Dieta · N300" };

function todayLocal(): string {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export default async function DietaPage({ searchParams }: { searchParams: { d?: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const date = searchParams.d && /^\d{4}-\d{2}-\d{2}$/.test(searchParams.d) ? searchParams.d : todayLocal();

  const [mealsRes, hydrationRes] = await Promise.all([
    supabase
      .from("meals")
      .select("id,slot,description,kcal,protein_g,carbs_g,fat_g,fiber_g")
      .eq("user_id", user.id)
      .eq("date", date)
      .order("created_at", { ascending: true }),
    supabase
      .from("hydration_logs")
      .select("ml")
      .eq("user_id", user.id)
      .eq("date", date),
  ]);

  const meals = (mealsRes.data ?? []) as MealRow[];
  const totalMl = (hydrationRes.data ?? []).reduce((acc: number, r) => acc + (r.ml as number), 0);

  const totals = meals.reduce(
    (acc, m) => ({
      kcal: acc.kcal + (m.kcal ?? 0),
      protein: acc.protein + (m.protein_g ?? 0),
      carbs: acc.carbs + (m.carbs_g ?? 0),
      fat: acc.fat + (m.fat_g ?? 0),
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Dieta</h1>
        <p className="text-sm text-muted-foreground">{date}</p>
      </header>

      <Hydration date={date} totalMl={totalMl} />

      <Card>
        <CardHeader>
          <CardTitle>Totales del día</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <Stat label="kcal" value={Math.round(totals.kcal).toString()} />
            <Stat label="Prot" value={`${Math.round(totals.protein)} g`} />
            <Stat label="Carbs" value={`${Math.round(totals.carbs)} g`} />
            <Stat label="Grasa" value={`${Math.round(totals.fat)} g`} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nueva comida</CardTitle>
        </CardHeader>
        <CardContent>
          <MealForm defaultDate={date} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comidas</CardTitle>
        </CardHeader>
        <CardContent>
          <MealList items={meals} />
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded bg-muted p-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}
