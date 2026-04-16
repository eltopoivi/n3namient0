import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Inicio</h1>
        <p className="text-sm text-muted-foreground">Bienvenido a N300.</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Próximamente</CardTitle>
          <CardDescription>
            Aquí verás el resumen de los últimos 7 días: volumen, recuperación, peso y eventos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Sigue los slices P01 → P10 para ir activando secciones.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
