import { z } from "zod";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato AAAA-MM-DD");

export const eventWriteSchema = z.object({
  title: z.string().trim().min(1, "Título requerido").max(120),
  kind: z.enum(["carrera", "evento", "test", "otro"]).nullable().optional().transform((v) => v ?? null),
  sport: z.string().trim().max(40).nullable().optional().transform((v) => (v ? v : null)),
  event_date: dateSchema,
  location: z.string().trim().max(120).nullable().optional().transform((v) => v ?? null),
  target_notes: z.string().trim().max(500).nullable().optional().transform((v) => v ?? null),
  result_notes: z.string().trim().max(500).nullable().optional().transform((v) => v ?? null),
});

export type EventWriteInput = z.infer<typeof eventWriteSchema>;
