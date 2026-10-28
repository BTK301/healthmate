export interface WeightEntry {
  /** YYYY-MM-DD */
  date: string;
  weightKg: number;
  /** generated demo data — cleared as soon as the user logs their own weight */
  sample?: boolean;
}

export const dateKey = (daysAgo = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/** Sorted ascending by date, one entry per day (latest wins). */
export function normalize(entries: WeightEntry[]): WeightEntry[] {
  const byDate = new Map<string, WeightEntry>();
  for (const e of entries) byDate.set(e.date, e);
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

/** Adds or replaces the entry for that day. */
export function addWeight(
  entries: WeightEntry[],
  entry: WeightEntry,
): WeightEntry[] {
  return normalize([...entries, entry]);
}

export function removeSampleEntries(entries: WeightEntry[]): WeightEntry[] {
  return entries.filter((e) => !e.sample);
}

export interface WeightStats {
  current: number | null;
  first: number | null;
  delta: number | null;
  /** kg per week, computed over the covered span */
  ratePerWeek: number | null;
  bmi: number | null;
  spanDays: number;
  count: number;
  includesSample: boolean;
}

const daysBetween = (a: string, b: string) =>
  Math.round(
    (new Date(`${b}T00:00:00`).getTime() - new Date(`${a}T00:00:00`).getTime()) /
      86_400_000,
  );

export function stats(entries: WeightEntry[], heightCm: number): WeightStats {
  const list = normalize(entries);
  if (list.length === 0) {
    return {
      current: null,
      first: null,
      delta: null,
      ratePerWeek: null,
      bmi: null,
      spanDays: 0,
      count: 0,
      includesSample: false,
    };
  }

  const first = list[0]!;
  const last = list[list.length - 1]!;
  const spanDays = daysBetween(first.date, last.date);
  const delta = last.weightKg - first.weightKg;

  return {
    current: last.weightKg,
    first: first.weightKg,
    delta,
    ratePerWeek:
      spanDays > 0 ? (delta / spanDays) * 7 : null,
    bmi:
      heightCm > 0
        ? Math.round((last.weightKg / Math.pow(heightCm / 100, 2)) * 10) / 10
        : null,
    spanDays,
    count: list.length,
    includesSample: list.some((e) => e.sample),
  };
}

/** Points inside the window, oldest first. */
export function windowOf(entries: WeightEntry[], days: number): WeightEntry[] {
  const list = normalize(entries);
  if (list.length === 0) return [];
  const last = list[list.length - 1]!;
  const cutoff = new Date(`${last.date}T00:00:00`);
  cutoff.setDate(cutoff.getDate() - days);
  return list.filter((e) => new Date(`${e.date}T00:00:00`) >= cutoff);
}

/** Demo history so the chart is meaningful before the user logs anything. */
export function sampleHistory(targetKg: number, points = 9): WeightEntry[] {
  const start = targetKg + 2.6;
  return Array.from({ length: points }, (_, i) => {
    const daysAgo = (points - 1 - i) * 3.5;
    const progress = i / (points - 1);
    // small plateaus + noise so the curve looks like a real weigh-in series
    const wobble = Math.sin(i * 1.9) * 0.28 + Math.cos(i * 3.1) * 0.16;
    const weight = start + (targetKg - start) * progress + wobble;
    return {
      date: dateKey(Math.round(daysAgo)),
      weightKg: Math.round(weight * 10) / 10,
      sample: true,
    };
  });
}
