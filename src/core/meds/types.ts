import type { MealSlot } from "@/core/types";

export type FoodTiming = "before" | "after" | "any";

export interface MedicationPlan {
  id: string;
  /** id from data/drugs.ts */
  drugId: string;
  /** free text, e.g. "1 viên", "5 ml" — never interpreted as advice */
  doseText: string;
  /** 24h "HH:mm", sorted ascending */
  times: string[];
  startDate: string;
  /** null = long-term (chronic disease) */
  endDate: string | null;
  foodTiming: FoodTiming;
  note?: string;
  createdAt: number;
}

export interface DoseLog {
  /** `${planId}|${date}|${time}` */
  id: string;
  planId: string;
  date: string;
  time: string;
  takenAt: number;
}

export interface Dose {
  id: string;
  plan: MedicationPlan;
  date: string;
  time: string;
  taken: boolean;
  takenAt?: number;
  /** overdue = past its time today and not taken */
  overdue: boolean;
  upcoming: boolean;
}

export const dateKey = (d = new Date()) => {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const doseId = (planId: string, date: string, time: string) =>
  `${planId}|${date}|${time}`;

export const TIME_PRESETS: { label: string; times: string[] }[] = [
  { label: "1 lần/ngày", times: ["08:00"] },
  { label: "2 lần/ngày", times: ["08:00", "20:00"] },
  { label: "3 lần/ngày", times: ["07:00", "12:00", "19:00"] },
];

export const FOOD_LABEL: Record<FoodTiming, string> = {
  before: "Trước ăn 30 phút",
  after: "Sau ăn",
  any: "Không phụ thuộc bữa ăn",
};

export const SLOT_HINT: Record<MealSlot, string> = {
  breakfast: "Bữa sáng",
  lunch: "Bữa trưa",
  dinner: "Bữa tối",
  snack: "Bữa phụ",
};
