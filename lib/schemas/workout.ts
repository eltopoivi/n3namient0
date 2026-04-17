import { z } from "zod";

const optionalNumber = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((v) => {
    if (v === null || v === undefined || v === "") return null;
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? n : null;
  })
  .nullable();

const optionalInt = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((v) => {
    if (v === null || v === undefined || v === "") return null;
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? Math.round(n) : null;
  })
  .nullable();

const SPORT_VALUES = [
  "ciclismo_carretera",
  "ciclismo_mtb",
  "ciclismo_pista",
  "rodillo",
  "carrera_ruta",
  "carrera_trail",
  "carrera_pista",
  "gym",
  "ejercicio",
  "ski",
  "otro",
] as const;

export const workoutWriteSchema = z.object({
  started_at: z.string().min(1, "Fecha/hora requerida"),
  sport: z.enum(SPORT_VALUES),
  sport_subtype: z.string().trim().max(80).nullable().optional().transform((v) => v ?? null),
  title: z.string().trim().max(120).nullable().optional().transform((v) => v ?? null),
  notes: z.string().trim().max(2000).nullable().optional().transform((v) => v ?? null),
  duration_s: z
    .union([z.string(), z.number()])
    .transform((v) => (typeof v === "number" ? v : Number(v)))
    .refine((n) => Number.isFinite(n) && n > 0, "Duración > 0"),
  distance_km: optionalNumber,
  avg_hr: optionalInt,
  avg_power_w: optionalInt,
  elev_gain_m: optionalNumber,
  elev_loss_m: optionalNumber,
  calories: optionalInt,
});

export type WorkoutWriteInput = z.infer<typeof workoutWriteSchema>;
