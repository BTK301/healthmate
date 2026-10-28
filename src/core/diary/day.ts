import type { MacroSet, NutritionTarget } from "@/core/types";
import { sumMacros, ZERO } from "@/core/nutrition/macros";
import type { DiaryByDate, DiaryEntry } from "./types";

export interface DaySummary {
  totals: MacroSet;
  remaining: MacroSet;
  /** 0..1+, consumed / target */
  progress: number;
  overTarget: boolean;
}

export function entriesFor(byDate: DiaryByDate, date: string): DiaryEntry[] {
  return [...(byDate[date] ?? [])].sort((a, b) => a.loggedAt - b.loggedAt);
}

export function dayTotals(entries: DiaryEntry[]): MacroSet {
  return sumMacros(entries.map((e) => e.nutrition));
}

export function summarize(
  entries: DiaryEntry[],
  target: NutritionTarget,
): DaySummary {
  const totals = dayTotals(entries);
  const remaining: MacroSet = {
    kcal: Math.max(0, target.calories - totals.kcal),
    proteinG: Math.max(0, target.proteinG - totals.proteinG),
    fatG: Math.max(0, target.fatG - totals.fatG),
    carbG: Math.max(0, target.carbG - totals.carbG),
    fiberG: Math.max(0, target.fiberG - totals.fiberG),
    sodiumMg: Math.max(0, target.sodiumMg - totals.sodiumMg),
  };

  return {
    totals,
    remaining,
    progress: target.calories > 0 ? totals.kcal / target.calories : 0,
    overTarget: totals.kcal > target.calories * 1.05,
  };
}

/**
 * Adds one entry. Logging the same recipe into the same slot twice in a day is
 * treated as a toggle in the UI, but the store stays append-only so the diary
 * can never silently drop data.
 */
export function addEntry(
  byDate: DiaryByDate,
  entry: DiaryEntry,
): DiaryByDate {
  const day = byDate[entry.date] ?? [];
  return { ...byDate, [entry.date]: [...day, entry] };
}

export function removeEntry(
  byDate: DiaryByDate,
  date: string,
  id: string,
): DiaryByDate {
  const day = byDate[date] ?? [];
  return { ...byDate, [date]: day.filter((e) => e.id !== id) };
}

/** Recipe ids already logged in a slot today — powers the "đã ăn" state. */
export function loggedRecipeIds(
  entries: DiaryEntry[],
  slot?: string,
): Set<string> {
  return new Set(
    entries
      .filter((e) => e.source === "recipe" && (!slot || e.slot === slot))
      .map((e) => e.sourceId),
  );
}

export { ZERO };
