"use client";

import { Mic, Play, RotateCcw, Send, Square, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

type Intent = "nutrition" | "training";

type NutritionRecord = {
  id: string;
  meal_type: string;
  total_kcal: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  raw_transcript: string;
  items: Array<{ name: string; amount_g: number; kcal: number }>;
};

type TrainingRecord = {
  id: string;
  discipline: string;
  duration_min: number | null;
  distance_km: number | null;
  elevation_gain_m: number | null;
  avg_hr: number | null;
  max_hr: number | null;
  perceived_effort: number | null;
  raw_transcript: string;
};

type UploadResult =
  | { kind: "nutrition"; record: NutritionRecord }
  | { kind: "training"; record: TrainingRecord };

type Status =
  | { kind: "idle" }
  | { kind: "recording" }
  | { kind: "review" }
  | { kind: "uploading" }
  | { kind: "done"; result: UploadResult }
  | { kind: "error"; message: string };

function pickMimeType(): string | null {
  if (typeof MediaRecorder === "undefined") return null;
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/ogg",
    "audio/mp4",
    "audio/mpeg",
  ];
  for (const c of candidates) {
    if (MediaRecorder.isTypeSupported(c)) return c;
  }
  return null;
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(1, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function extensionFor(type: string): string {
  if (type.includes("mp4")) return "m4a";
  if (type.includes("mpeg")) return "mp3";
  if (type.includes("ogg")) return "ogg";
  return "webm";
}

export function VoiceRecorder() {
  const [intent, setIntent] = useState<Intent>("nutrition");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [elapsed, setElapsed] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      stopTimer();
      releaseMic();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopTimer() {
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function releaseMic() {
    const stream = streamRef.current;
    if (stream) {
      for (const track of stream.getTracks()) track.stop();
    }
    streamRef.current = null;
    recorderRef.current = null;
  }

  async function startRecording() {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setStatus({ kind: "error", message: "Tu navegador no soporta grabación de audio." });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const type = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        chunksRef.current = [];
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setStatus({ kind: "review" });
        stopTimer();
        releaseMic();
      };
      recorder.start();
      startedAtRef.current = Date.now();
      setElapsed(0);
      timerRef.current = window.setInterval(() => {
        setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
      }, 250);
      setStatus({ kind: "recording" });
    } catch (cause) {
      releaseMic();
      const message =
        cause instanceof Error
          ? cause.message || "No se pudo acceder al micrófono"
          : "No se pudo acceder al micrófono";
      setStatus({ kind: "error", message });
    }
  }

  function stopRecording() {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
  }

  function discard() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setElapsed(0);
    setStatus({ kind: "idle" });
  }

  async function upload() {
    if (!audioBlob) return;
    setStatus({ kind: "uploading" });
    try {
      const form = new FormData();
      const ext = extensionFor(audioBlob.type);
      form.set("file", audioBlob, `voz.${ext}`);
      form.set("intent", intent);
      const response = await fetch("/api/voice-intake", { method: "POST", body: form });
      const body = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        record?: NutritionRecord | TrainingRecord;
        error?: string;
      };
      if (!response.ok || !body.ok || !body.record) {
        setStatus({ kind: "error", message: body.error ?? `Error ${response.status}` });
        return;
      }
      const kind: Intent = intent;
      setStatus({
        kind: "done",
        result:
          kind === "nutrition"
            ? { kind: "nutrition", record: body.record as NutritionRecord }
            : { kind: "training", record: body.record as TrainingRecord },
      });
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioBlob(null);
      setAudioUrl(null);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Error subiendo el audio";
      setStatus({ kind: "error", message });
    }
  }

  function recordAnother() {
    setStatus({ kind: "idle" });
    setElapsed(0);
  }

  const isRecording = status.kind === "recording";
  const isReview = status.kind === "review";
  const isUploading = status.kind === "uploading";
  const isDone = status.kind === "done";

  const helpText = useMemo(() => {
    if (intent === "nutrition") {
      return "Ej: \"He comido 200 gramos de pasta con 150 de atún y un plátano.\"";
    }
    return "Ej: \"12 km de trail con 600 de desnivel en 1h30, FC media 148, RPE 7.\"";
  }, [intent]);

  return (
    <div className="flex flex-col gap-6">
      <IntentToggle value={intent} setValue={setIntent} disabled={isRecording || isUploading} />

      <Card>
        <CardHeader>
          <CardTitle>Graba tu audio</CardTitle>
          <CardDescription>{helpText}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 py-8">
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isUploading}
            className={cn(
              "flex h-28 w-28 items-center justify-center rounded-full border-2 transition-colors",
              isRecording
                ? "border-destructive bg-destructive/10 text-destructive"
                : "border-border bg-card text-foreground hover:bg-accent",
              isUploading && "opacity-50",
            )}
            aria-label={isRecording ? "Detener grabación" : "Empezar a grabar"}
          >
            {isRecording ? (
              <Square className="h-10 w-10" fill="currentColor" />
            ) : (
              <Mic className="h-10 w-10" />
            )}
            {isRecording ? (
              <span
                aria-hidden
                className="absolute h-28 w-28 animate-ping rounded-full border-2 border-destructive/40"
              />
            ) : null}
          </button>

          <div className="text-center">
            <div className="font-mono text-2xl tabular-nums">{formatElapsed(elapsed)}</div>
            <div className="text-xs text-muted-foreground">
              {isRecording
                ? "Grabando… pulsa para parar"
                : isReview
                  ? "Escucha y envía cuando estés listo"
                  : isUploading
                    ? "Procesando con IA…"
                    : "Pulsa el micrófono para empezar"}
            </div>
          </div>

          {isReview && audioUrl ? (
            <div className="flex w-full flex-col gap-3">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <audio controls src={audioUrl} className="w-full" />
              <div className="flex flex-wrap justify-center gap-2">
                <Button type="button" onClick={upload} disabled={isUploading}>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar
                </Button>
                <Button type="button" variant="outline" onClick={discard} disabled={isUploading}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Descartar
                </Button>
              </div>
            </div>
          ) : null}

          {isUploading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Play className="h-4 w-4 animate-pulse" />
              Transcribiendo y extrayendo datos…
            </div>
          ) : null}
        </CardContent>
      </Card>

      {status.kind === "error" ? (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <p>{status.message}</p>
            <div>
              <Button type="button" variant="outline" size="sm" onClick={() => setStatus({ kind: "idle" })}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {isDone ? (
        <ResultCard result={status.result} onAgain={recordAnother} />
      ) : null}
    </div>
  );
}

function IntentToggle({
  value,
  setValue,
  disabled,
}: {
  value: Intent;
  setValue: (v: Intent) => void;
  disabled: boolean;
}) {
  return (
    <div className="inline-flex gap-1 self-start rounded-md border border-border bg-card p-1">
      {(["nutrition", "training"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setValue(option)}
          disabled={disabled}
          className={cn(
            "rounded-md px-4 py-1.5 text-sm transition-colors disabled:opacity-50",
            value === option ? "bg-foreground text-background" : "hover:bg-accent",
          )}
        >
          {option === "nutrition" ? "Comida" : "Entreno"}
        </button>
      ))}
    </div>
  );
}

function ResultCard({ result, onAgain }: { result: UploadResult; onAgain: () => void }) {
  if (result.kind === "nutrition") {
    const r = result.record;
    return (
      <Card className="border-[hsl(var(--metric-hrv))]/30">
        <CardHeader>
          <CardTitle>Comida registrada</CardTitle>
          <CardDescription>{r.meal_type}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <div className="grid grid-cols-4 gap-2 text-center">
            <Stat label="kcal" value={Math.round(r.total_kcal).toString()} />
            <Stat label="P" value={`${Math.round(r.total_protein_g)} g`} />
            <Stat label="C" value={`${Math.round(r.total_carbs_g)} g`} />
            <Stat label="G" value={`${Math.round(r.total_fat_g)} g`} />
          </div>
          {r.items.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {r.items.map((it, idx) => (
                <li key={idx} className="flex justify-between border-b border-border/50 py-1 last:border-0">
                  <span>
                    {it.name} · {Math.round(it.amount_g)} g
                  </span>
                  <span className="text-muted-foreground">{Math.round(it.kcal)} kcal</span>
                </li>
              ))}
            </ul>
          ) : null}
          <TranscriptBlock text={r.raw_transcript} />
          <div>
            <Button type="button" variant="outline" size="sm" onClick={onAgain}>
              <Mic className="mr-2 h-4 w-4" />
              Grabar otro
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const r = result.record;
  return (
    <Card className="border-[hsl(var(--metric-rhr))]/30">
      <CardHeader>
        <CardTitle>Entreno registrado</CardTitle>
        <CardDescription>{r.discipline}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {r.duration_min != null ? <Stat label="Duración" value={`${r.duration_min} min`} /> : null}
          {r.distance_km != null ? <Stat label="Distancia" value={`${r.distance_km} km`} /> : null}
          {r.elevation_gain_m != null ? <Stat label="D+" value={`${r.elevation_gain_m} m`} /> : null}
          {r.avg_hr != null ? <Stat label="FC media" value={`${r.avg_hr} bpm`} /> : null}
          {r.max_hr != null ? <Stat label="FC máx" value={`${r.max_hr} bpm`} /> : null}
          {r.perceived_effort != null ? <Stat label="RPE" value={`${r.perceived_effort}/10`} /> : null}
        </div>
        <TranscriptBlock text={r.raw_transcript} />
        <div>
          <Button type="button" variant="outline" size="sm" onClick={onAgain}>
            <Mic className="mr-2 h-4 w-4" />
            Grabar otro
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-border bg-background px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

function TranscriptBlock({ text }: { text: string }) {
  return (
    <div className="rounded border border-border bg-background p-3 text-xs">
      <div className="mb-1 uppercase tracking-wide text-muted-foreground">Transcripción</div>
      <div className="whitespace-pre-wrap">{text}</div>
    </div>
  );
}
