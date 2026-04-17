import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { emptyWorkoutValues } from "../empty-values";
import { WorkoutForm } from "../workout-form";

export const metadata = { title: "Nuevo entreno · N300" };

export default function NuevoEntrenoPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Nuevo entreno</h1>
        <Link
          href="/entrenamientos"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Cancelar
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Detalles</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkoutForm mode="create" initial={emptyWorkoutValues()} />
        </CardContent>
      </Card>
    </div>
  );
}
