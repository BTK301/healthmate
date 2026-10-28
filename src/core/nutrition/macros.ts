import type { MacroSet, Portion, Recipe } from "@/core/types";
import { getFood } from "@/data/foods";

export const ZERO: MacroSet = {
  kcal: 0,
  proteinG: 0,
  fatG: 0,
  carbG: 0,
  fiberG: 0,
  sodiumMg: 0,
};

export function nutritionOf(portions: Portion[], factor = 1): MacroSet {
  return portions.reduce<MacroSet>((acc, p) => {
    const food = getFood(p.foodId);
    const k = (p.grams * factor) / 100;
    return {
      kcal: acc.kcal + food.kcal * k,
      proteinG: acc.proteinG + food.proteinG * k,
      fatG: acc.fatG + food.fatG * k,
      carbG: acc.carbG + food.carbG * k,
      fiberG: acc.fiberG + food.fiberG * k,
      sodiumMg: acc.sodiumMg + food.sodiumMg * k,
    };
  }, ZERO);
}

export function recipeNutrition(recipe: Recipe, factor = 1): MacroSet {
  return nutritionOf(recipe.portions, factor);
}

export function addMacros(a: MacroSet, b: MacroSet): MacroSet {
  return {
    kcal: a.kcal + b.kcal,
    proteinG: a.proteinG + b.proteinG,
    fatG: a.fatG + b.fatG,
    carbG: a.carbG + b.carbG,
    fiberG: a.fiberG + b.fiberG,
    sodiumMg: a.sodiumMg + b.sodiumMg,
  };
}

export function sumMacros(list: MacroSet[]): MacroSet {
  return list.reduce(addMacros, ZERO);
}

export function roundMacros(m: MacroSet): MacroSet {
  return {
    kcal: Math.round(m.kcal),
    proteinG: Math.round(m.proteinG),
    fatG: Math.round(m.fatG),
    carbG: Math.round(m.carbG),
    fiberG: Math.round(m.fiberG),
    sodiumMg: Math.round(m.sodiumMg),
  };
}

export function tagsOf(recipe: Recipe): Set<string> {
  const tags = new Set(recipe.tags);
  for (const p of recipe.portions) {
    for (const t of getFood(p.foodId).tags) tags.add(t);
  }
  return tags;
}
