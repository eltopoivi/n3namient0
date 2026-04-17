import { describe, expect, it } from "vitest";

import {
  formatDuration,
  paceSecPerKm,
  parseDurationString,
  speedKmh,
  vamMetersPerHour,
} from "@/lib/domain/workouts";

describe("workouts domain", () => {
  it("paceSecPerKm", () => {
    expect(paceSecPerKm(3600, 10_000)).toBe(360);
    expect(paceSecPerKm(1000, 0)).toBeNull();
  });

  it("speedKmh", () => {
    expect(speedKmh(3600, 20_000)).toBe(20);
    expect(speedKmh(0, 1)).toBeNull();
  });

  it("vamMetersPerHour", () => {
    expect(vamMetersPerHour(500, 3600)).toBe(500);
    expect(vamMetersPerHour(500, 0)).toBeNull();
  });

  it("formatDuration", () => {
    expect(formatDuration(90)).toBe("1m 30s");
    expect(formatDuration(3661)).toBe("1h 01m");
    expect(formatDuration(-5)).toBe("–");
  });

  it("parseDurationString", () => {
    expect(parseDurationString("30")).toBe(1800); // 30 minutes
    expect(parseDurationString("1:30")).toBe(90); // 1m 30s
    expect(parseDurationString("1:30:00")).toBe(5400);
    expect(parseDurationString("bad")).toBeNull();
  });
});
