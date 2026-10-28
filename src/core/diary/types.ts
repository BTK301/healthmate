import type { MacroSet, MealSlot } from "@/core/types";

export interface DiaryEntry {
  id: string;
  /** ISO date, YYYY-MM-DD — diary is stored per day */
  date: string;
  slot: MealSlot;
  /** named source: a recipe or a single food */
  source: "recipe" | "food";
  sourceId: string;
  name: string;
  grams?: number;
  /** macro snapshot at logging time, so later edits to the food DB don't rewrite history */
  nutrition: MacroSet;
  loggedAt: number;
}

export type DiaryByDate = Record<string, DiaryEntry[]>;

export const todayKey = (d = new Date()) => {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
};
