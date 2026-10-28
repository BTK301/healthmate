/**
 * Pure domain types. Nothing in `src/core` may import React, Next.js or a DB.
 */

export type Sex = "male" | "female";

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

export type Goal = "lose" | "maintain" | "gain";

export type OccupationPreset = "office" | "shift" | "manual";

export interface ProfileInput {
  name: string;
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: ActivityLevel;
  goal: Goal;
  occupation: OccupationPreset;
  /** ids from data/conditions.ts */
  conditionIds: string[];
  /** ids from data/drugs.ts */
  drugIds: string[];
  allergies: string[];
}

export type BmiCategory =
  | "underweight"
  | "normal"
  | "overweight"
  | "obese"
  | "unknown";

export interface NutritionTarget {
  bmr: number;
  tdee: number;
  calories: number;
  proteinG: number;
  fatG: number;
  carbG: number;
  fiberG: number;
  sodiumMg: number;
  bmi: number;
  bmiCategory: BmiCategory;
  /** Human readable reasons, shown in the UI. */
  explanation: string[];
}

export interface MacroSet {
  kcal: number;
  proteinG: number;
  fatG: number;
  carbG: number;
  fiberG: number;
  sodiumMg: number;
}

export type MealSlot = "breakfast" | "lunch" | "dinner" | "snack";

export interface Portion {
  foodId: string;
  grams: number;
}

export interface Recipe {
  id: string;
  name: string;
  slot: MealSlot;
  /** short list of tags, used for filtering (see core/rules) */
  tags: string[];
  minutes: number;
  /** rough price in thousands of VND for one serving */
  priceK: number;
  portions: Portion[];
  note?: string;
}

export interface PlannedMeal {
  slot: MealSlot;
  recipe: Recipe;
  nutrition: MacroSet;
}

export interface MealPlan {
  meals: PlannedMeal[];
  total: MacroSet;
  target: NutritionTarget;
  /** 0..1, how close the plan lands on the calorie target */
  fit: number;
}
