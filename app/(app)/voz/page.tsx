import { VoiceRecorder } from "./recorder";

export const metadata = { title: "Voz · N300" };

export default function VozPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Voz</h1>
        <p className="text-sm text-muted-foreground">
          Cuéntale a N300 qué has comido o cómo fue tu entreno. La IA transcribe y extrae los datos.
        </p>
      </header>
      <VoiceRecorder />
    </div>
  );
}
