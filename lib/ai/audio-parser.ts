import "server-only";

import { GoogleGenAI } from "@google/genai";

import { NUTRITION_SCHEMA, TRAINING_SCHEMA } from "./schemas";

const MODEL = "gemini-2.5-flash";

let cached: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (cached) return cached;
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GOOGLE_AI_API_KEY");
  }
  cached = new GoogleGenAI({ apiKey });
  return cached;
}

const NUTRITION_INSTRUCTION = `
Eres un nutricionista. Analiza este audio donde el usuario describe lo que ha comido.
1. Transcribe literalmente en raw_transcript.
2. Identifica cada alimento con su cantidad (en gramos, estima si no se dice).
3. Calcula macros por alimento y totales usando valores de referencia estándar (USDA / BEDCA).
4. Estima micronutrientes por alimento cuando sean significativos: fibra (g), azúcar (g),
   grasa saturada (g), sodio (mg), potasio (mg), calcio (mg), magnesio (mg), hierro (mg),
   zinc (mg), vitamina C (mg), vitamina D (µg), vitamina B12 (µg), omega-3 (g). Si un
   alimento no aporta cantidades relevantes de un micronutriente concreto, deja ese campo null.
5. Clasifica meal_type según contexto (hora, tipo de alimentos). Si dudas, usa "other".
6. Si el audio es inaudible o no trata de comida, lanza error.
Responde SOLO con el JSON del schema.
`.trim();

const TRAINING_INSTRUCTION = `
Eres un entrenador de resistencia. Analiza este audio donde el usuario describe su sesión.
1. Transcribe literalmente en raw_transcript.
2. Extrae disciplina, duración, distancia, desnivel, FC media/máx, RPE.
3. Si menciona intervalos o series, extráelos en el array intervals.
4. Si menciona geles, bebidas o comida durante la sesión, ponlos en nutrition_during.
5. Unidades: km para distancia, metros para desnivel, min para duración, bpm para FC.
6. No inventes datos. Si algo no se menciona, deja el campo null.
Responde SOLO con el JSON del schema.
`.trim();

async function callGemini(
  audioBase64: string,
  mimeType: string,
  instruction: string,
  schema: object,
): Promise<unknown> {
  const ai = getClient();

  const res = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType, data: audioBase64 } },
          { text: instruction },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
      temperature: 0.1,
    },
  });

  const text = res.text;
  if (!text) throw new Error("Gemini returned empty response");

  try {
    return JSON.parse(text) as unknown;
  } catch (cause) {
    throw new Error(`Gemini returned non-JSON: ${cause instanceof Error ? cause.message : String(cause)}`);
  }
}

export function parseNutritionAudio(audioBase64: string, mimeType: string): Promise<unknown> {
  return callGemini(audioBase64, mimeType, NUTRITION_INSTRUCTION, NUTRITION_SCHEMA);
}

export function parseTrainingAudio(audioBase64: string, mimeType: string): Promise<unknown> {
  return callGemini(audioBase64, mimeType, TRAINING_INSTRUCTION, TRAINING_SCHEMA);
}
