export type SportCaps = {
  distance: boolean;
  elevation: boolean;
  heartRate: boolean;
  power: boolean;
  pace: boolean;
  calories: boolean;
};

export type SportDef = {
  value: string;
  label: string;
  caps: SportCaps;
};

const ALL: SportCaps = {
  distance: true,
  elevation: true,
  heartRate: true,
  power: true,
  pace: true,
  calories: true,
};

export const SPORTS: ReadonlyArray<SportDef> = [
  {
    value: "ciclismo_carretera",
    label: "Ciclismo carretera",
    caps: { distance: true, elevation: true, heartRate: true, power: true, pace: false, calories: true },
  },
  {
    value: "ciclismo_mtb",
    label: "Ciclismo MTB",
    caps: { distance: true, elevation: true, heartRate: true, power: true, pace: false, calories: true },
  },
  {
    value: "ciclismo_pista",
    label: "Ciclismo pista",
    caps: { distance: true, elevation: false, heartRate: true, power: true, pace: false, calories: true },
  },
  {
    value: "rodillo",
    label: "Rodillo (bici indoor)",
    caps: { distance: true, elevation: false, heartRate: true, power: true, pace: false, calories: true },
  },
  {
    value: "carrera_ruta",
    label: "Carrera ruta",
    caps: { distance: true, elevation: true, heartRate: true, power: false, pace: true, calories: true },
  },
  {
    value: "carrera_trail",
    label: "Carrera trail",
    caps: { distance: true, elevation: true, heartRate: true, power: false, pace: true, calories: true },
  },
  {
    value: "carrera_pista",
    label: "Carrera pista",
    caps: { distance: true, elevation: false, heartRate: true, power: false, pace: true, calories: true },
  },
  {
    value: "gym",
    label: "Gym",
    caps: { distance: false, elevation: false, heartRate: true, power: false, pace: false, calories: true },
  },
  {
    value: "ejercicio",
    label: "Ejercicio",
    caps: { distance: false, elevation: false, heartRate: true, power: false, pace: false, calories: true },
  },
  {
    value: "ski",
    label: "Ski",
    caps: { distance: true, elevation: true, heartRate: true, power: false, pace: false, calories: true },
  },
  { value: "otro", label: "Otro", caps: ALL },
];

export type Sport = (typeof SPORTS)[number]["value"];

export function sportLabel(value: string): string {
  return SPORTS.find((s) => s.value === value)?.label ?? value;
}

export function sportCaps(value: string): SportCaps {
  return SPORTS.find((s) => s.value === value)?.caps ?? ALL;
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
