export function paceSecPerKm(durS: number, distM: number): number | null {
  if (!Number.isFinite(durS) || !Number.isFinite(distM) || distM <= 0) return null;
  return durS / (distM / 1000);
}

export function speedKmh(durS: number, distM: number): number | null {
  if (!Number.isFinite(durS) || !Number.isFinite(distM) || durS <= 0) return null;
  return (distM / 1000) / (durS / 3600);
}

export function vamMetersPerHour(elevGainM: number, durS: number): number | null {
  if (!Number.isFinite(elevGainM) || !Number.isFinite(durS) || durS <= 0) return null;
  return elevGainM / (durS / 3600);
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "–";
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`;
  if (m > 0) return `${m}m ${sec.toString().padStart(2, "0")}s`;
  return `${sec}s`;
}

export function formatPace(secPerKm: number | null | undefined): string {
  if (secPerKm == null || !Number.isFinite(secPerKm) || secPerKm <= 0) return "–";
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}:${s.toString().padStart(2, "0")}/km`;
}

export function parseDurationString(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(":").map((p) => p.trim());
  if (parts.some((p) => !/^\d+$/.test(p))) return null;
  const nums = parts.map(Number);
  if (nums.length === 1) {
    const [m] = nums;
    return typeof m === "number" ? m * 60 : null;
  }
  if (nums.length === 2) {
    const [m, s] = nums;
    return typeof m === "number" && typeof s === "number" ? m * 60 + s : null;
  }
  if (nums.length === 3) {
    const [h, m, s] = nums;
    return typeof h === "number" && typeof m === "number" && typeof s === "number"
      ? h * 3600 + m * 60 + s
      : null;
  }
  return null;
}
