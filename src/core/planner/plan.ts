import type {
  MacroSet,
  MealPlan,
  MealSlot,
  NutritionTarget,
  PlannedMeal,
  Recipe,
} from "@/core/types";
import { recipes } from "@/data/recipes";
import {
  addMacros,
  nutritionOf,
  recipeNutrition,
  sumMacros,
  tagsOf,
  ZERO,
} from "@/core/nutrition/macros";
import { clamp } from "@/core/nutrition/targets";

export const SLOT_WEIGHT: Record<MealSlot, number> = {
  breakfast: 0.25,
  lunch: 0.35,
  dinner: 0.3,
  snack: 0.1,
};

export const SLOT_LABEL: Record<MealSlot, string> = {
  breakfast: "Bữa sáng",
  lunch: "Bữa trưa",
  dinner: "Bữa tối",
  snack: "Bữa phụ",
};

const SLOT_ORDER: MealSlot[] = ["breakfast", "lunch", "dinner", "snack"];

export interface PlanOptions {
  target: NutritionTarget;
  excludeTags?: Set<string>;
  preferTags?: Set<string>;
  /** recipe ids already used — used by the "swap" action */
  skipRecipeIds?: Set<string>;
  seed?: number;
  maxMinutes?: number;
}

/** Deterministic pseudo-random, so the same seed gives the same plan. */
function jitter(seed: number, i: number) {
  const x = Math.sin(seed * 9301 + i * 49297) * 233280;
  return x - Math.floor(x);
}

function eligible(
  slot: MealSlot,
  excludeTags: Set<string>,
  skip: Set<string>,
  maxMinutes?: number,
): Recipe[] {
  return recipes.filter((r) => {
    if (r.slot !== slot) return false;
    if (skip.has(r.id)) return false;
    if (maxMinutes && r.minutes > maxMinutes) return false;
    const tags = tagsOf(r);
    for (const t of excludeTags) if (tags.has(t)) return false;
    return true;
  });
}

/**
 * Greedy selection per slot plus a proportional portion correction.
 * Fast (single pass), deterministic, and easy to explain in the UI.
 */
export function buildPlan(options: PlanOptions): MealPlan {
  const {
    target,
    excludeTags = new Set(),
    preferTags = new Set(),
    skipRecipeIds = new Set(),
    seed = 7,
    maxMinutes,
  } = options;

  const used = new Set<string>();
  const picked: { slot: MealSlot; recipe: Recipe }[] = [];

  for (const [index, slot] of SLOT_ORDER.entries()) {
    const slotTarget = target.calories * SLOT_WEIGHT[slot];
    const pool = eligible(slot, excludeTags, skipRecipeIds, maxMinutes);
    if (pool.length === 0) continue;

    let best = pool[0]!;
    let bestScore = Number.POSITIVE_INFINITY;

    for (const recipe of pool) {
      const nutrition = recipeNutrition(recipe);
      const tags = tagsOf(recipe);
      const preferences = [...preferTags].filter((t) => tags.has(t)).length;

      const proteinTarget = target.proteinG * SLOT_WEIGHT[slot];
      const proteinGap =
        proteinTarget > 0
          ? Math.max(0, (proteinTarget - nutrition.proteinG) / proteinTarget)
          : 0;

      const score =
        Math.abs(nutrition.kcal - slotTarget) / slotTarget +
        proteinGap * 0.7 +
        (used.has(recipe.id) ? 0.45 : 0) +
        preferences * -0.06 +
        jitter(seed + index, recipe.id.length) * 0.16;

      if (score < bestScore) {
        bestScore = score;
        best = recipe;
      }
    }

    used.add(best.id);
    picked.push({ slot, recipe: best });
  }

  const rawTotal = sumMacros(
    picked.map((p) => recipeNutrition(p.recipe)),
  );

  const factor = clamp(
    rawTotal.kcal > 0 ? target.calories / rawTotal.kcal : 1,
    0.85,
    1.2,
  );

  const meals: PlannedMeal[] = picked.map((p) => ({
    slot: p.slot,
    recipe: p.recipe,
    nutrition: recipeNutrition(p.recipe, factor),
  }));

  const total = sumMacros(meals.map((m) => m.nutrition));
  const fit = target.calories > 0 ? 1 - Math.abs(total.kcal - target.calories) / target.calories : 0;

  return { meals, total, target, fit: Math.max(0, Math.min(1, fit)) };
}

/** Replace one meal with the next best candidate for that slot. */
export function swapMeal(
  plan: MealPlan,
  slot: MealSlot,
  excludeTags: Set<string>,
  preferTags: Set<string>,
  usedIds: Set<string>,
): MealPlan {
  const current = plan.meals.find((m) => m.slot === slot);
  if (!current) return plan;

  const pool = eligible(slot, excludeTags, usedIds);
  if (pool.length === 0) return plan;

  const closest = pool.reduce((best, recipe) => {
    const a = Math.abs(recipeNutrition(recipe).kcal - current.nutrition.kcal);
    const b = Math.abs(recipeNutrition(best).kcal - current.nutrition.kcal);
    if (a === b) {
      const tags = tagsOf(recipe);
      const prefs = [...preferTags].filter((t) => tags.has(t)).length;
      return prefs > 0 ? recipe : best;
    }
    return a < b ? recipe : best;
  }, pool[0]!);

  const factor =
    recipeNutrition(closest).kcal > 0
      ? current.nutrition.kcal / recipeNutrition(closest).kcal
      : 1;

  const meals = plan.meals.map((m) =>
    m.slot === slot
      ? {
          ...m,
          recipe: closest,
          nutrition: recipeNutrition(closest, clamp(factor, 0.7, 1.5)),
        }
      : m,
  );

  const total = sumMacros(meals.map((m) => m.nutrition));
  const fit =
    plan.target.calories > 0
      ? 1 - Math.abs(total.kcal - plan.target.calories) / plan.target.calories
      : 0;

  return { ...plan, meals, total, fit: Math.max(0, Math.min(1, fit)) };
}

export { ZERO };
export type { MacroSet };
