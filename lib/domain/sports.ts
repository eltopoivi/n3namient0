export const SPORTS = [
  { value: "ciclismo_carretera", label: "Ciclismo carretera", distance: true, power: true },
  { value: "ciclismo_mtb", label: "Ciclismo MTB", distance: true, power: true },
  { value: "ciclismo_pista", label: "Ciclismo pista", distance: true, power: true },
  { value: "carrera_ruta", label: "Carrera ruta", distance: true, power: false },
  { value: "carrera_trail", label: "Carrera trail", distance: true, power: false },
  { value: "carrera_pista", label: "Carrera pista", distance: true, power: false },
  { value: "gym", label: "Gym", distance: false, power: false },
  { value: "ejercicio", label: "Ejercicio", distance: false, power: false },
  { value: "ski", label: "Ski", distance: true, power: false },
  { value: "otro", label: "Otro", distance: true, power: false },
] as const;

export type Sport = (typeof SPORTS)[number]["value"];

export function sportLabel(value: string): string {
  return SPORTS.find((s) => s.value === value)?.label ?? value;
}

export function sportSupportsDistance(value: string): boolean {
  return SPORTS.find((s) => s.value === value)?.distance ?? false;
}

export function sportSupportsPower(value: string): boolean {
  return SPORTS.find((s) => s.value === value)?.power ?? false;
}

export const MEAL_SLOTS = [
  { value: "desayuno", label: "Desayuno" },
  { value: "media_manana", label: "Media mañana" },
  { value: "comida", label: "Comida" },
  { value: "merienda", label: "Merienda" },
  { value: "cena", label: "Cena" },
  { value: "snack", label: "Snack" },
] as const;

export type MealSlot = (typeof MEAL_SLOTS)[number]["value"];

export function mealSlotLabel(value: string): string {
  return MEAL_SLOTS.find((s) => s.value === value)?.label ?? value;
}

export const EVENT_KINDS = [
  { value: "carrera", label: "Carrera" },
  { value: "evento", label: "Evento" },
  { value: "test", label: "Test" },
  { value: "otro", label: "Otro" },
] as const;
