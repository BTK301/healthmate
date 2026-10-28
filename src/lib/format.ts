import type { MacroSet } from "@/core/types";

export const nf = new Intl.NumberFormat("vi-VN");

export function kcal(n: number) {
  return nf.format(Math.round(n));
}

export function grams(n: number) {
  return `${nf.format(Math.round(n))} g`;
}

export function sodium(n: number) {
  return n >= 1000
    ? `${(n / 1000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} g`
    : `${nf.format(Math.round(n))} mg`;
}

export function pct(part: number, whole: number) {
  if (!whole) return 0;
  return Math.max(0, Math.min(100, (part / whole) * 100));
}

export function macroList(m: MacroSet) {
  return [
    { key: "protein", label: "Đạm", value: m.proteinG, kcal: m.proteinG * 4 },
    { key: "carb", label: "Tinh bột", value: m.carbG, kcal: m.carbG * 4 },
    { key: "fat", label: "Béo", value: m.fatG, kcal: m.fatG * 9 },
  ] as const;
}
