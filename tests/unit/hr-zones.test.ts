import { describe, expect, it } from "vitest";

import { computeHrZonesFromMax, computeKarvonenZones } from "@/lib/domain/hr-zones";

describe("computeHrZonesFromMax", () => {
  it("returns five zones bounded by percentages of fcMax", () => {
    const zones = computeHrZonesFromMax(200);
    expect(zones).toHaveLength(5);
    expect(zones[0]).toEqual({ zone: 1, min: 100, max: 120 });
    expect(zones[4]).toEqual({ zone: 5, min: 180, max: 200 });
  });

  it("returns [] for non-finite or non-positive input", () => {
    expect(computeHrZonesFromMax(0)).toEqual([]);
    expect(computeHrZonesFromMax(Number.NaN)).toEqual([]);
  });
});

describe("computeKarvonenZones", () => {
  it("uses heart-rate reserve", () => {
    const zones = computeKarvonenZones(200, 50);
    expect(zones[0]).toEqual({ zone: 1, min: 125, max: 140 });
    expect(zones[4]).toEqual({ zone: 5, min: 185, max: 200 });
  });

  it("returns [] when fcRest >= fcMax", () => {
    expect(computeKarvonenZones(150, 150)).toEqual([]);
  });
});
