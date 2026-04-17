export type Zone = { zone: 1 | 2 | 3 | 4 | 5; min: number; max: number };

const PERCENTAGES: ReadonlyArray<[number, number]> = [
  [0.5, 0.6],
  [0.6, 0.7],
  [0.7, 0.8],
  [0.8, 0.9],
  [0.9, 1.0],
];

export function computeHrZonesFromMax(fcMax: number): Zone[] {
  if (!Number.isFinite(fcMax) || fcMax <= 0) return [];
  return PERCENTAGES.map(([low, high], index) => ({
    zone: (index + 1) as Zone["zone"],
    min: Math.round(fcMax * low),
    max: Math.round(fcMax * high),
  }));
}

export function computeKarvonenZones(fcMax: number, fcRest: number): Zone[] {
  if (!Number.isFinite(fcMax) || !Number.isFinite(fcRest) || fcMax <= fcRest) return [];
  const reserve = fcMax - fcRest;
  return PERCENTAGES.map(([low, high], index) => ({
    zone: (index + 1) as Zone["zone"],
    min: Math.round(fcRest + reserve * low),
    max: Math.round(fcRest + reserve * high),
  }));
}
