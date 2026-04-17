import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

import { PrList, type PrRow } from "./pr-list";
import { ProfileForm } from "./profile-form";
import { SignOutButton } from "./sign-out";

export const metadata = { title: "Perfil · N300" };

type ProfileRow = {
  display_name: string | null;
  birthdate: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  fc_max: number | null;
  fc_rest: number | null;
  vo2max: number | null;
  hrv_range_min: number | null;
  hrv_range_max: number | null;
  motivation_text: string | null;
};

function toStr(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return "";
  return String(v);
}

export default async function PerfilPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user
    ? ((
        await supabase
          .from("profiles")
          .select(
            "display_name,birthdate,height_cm,weight_kg,fc_max,fc_rest,vo2max,hrv_range_min,hrv_range_max,motivation_text",
          )
          .eq("user_id", user.id)
          .maybeSingle()
      ).data as ProfileRow | null)
    : null;

  const prs = user
    ? ((
        await supabase
          .from("prs")
          .select("id,sport,metric,value,unit,achieved_at,notes")
          .eq("user_id", user.id)
          .order("achieved_at", { ascending: false })
      ).data as PrRow[] | null) ?? []
    : [];

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Perfil</h1>
          <p className="text-sm text-muted-foreground">
            {user?.email ?? "—"}
          </p>
        </div>
        <SignOutButton />
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Datos</CardTitle>
          <CardDescription>FCmax, zonas, peso, motivación.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            initial={{
              display_name: toStr(profile?.display_name),
              birthdate: toStr(profile?.birthdate),
              height_cm: toStr(profile?.height_cm),
              weight_kg: toStr(profile?.weight_kg),
              fc_max: toStr(profile?.fc_max),
              fc_rest: toStr(profile?.fc_rest),
              vo2max: toStr(profile?.vo2max),
              hrv_range_min: toStr(profile?.hrv_range_min),
              hrv_range_max: toStr(profile?.hrv_range_max),
              motivation_text: toStr(profile?.motivation_text),
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>PRs</CardTitle>
          <CardDescription>Registros personales por deporte/métrica.</CardDescription>
        </CardHeader>
        <CardContent>
          <PrList items={prs} />
        </CardContent>
      </Card>
    </div>
  );
}
