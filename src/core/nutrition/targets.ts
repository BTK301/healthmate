import type {
  ActivityLevel,
  BmiCategory,
  Goal,
  NutritionTarget,
  OccupationPreset,
  ProfileInput,
  Sex,
} from "@/core/types";

/** Physical activity level multipliers (FAO/WHO style). */
export const ACTIVITY_FACTOR: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const ACTIVITY_LABEL: Record<ActivityLevel, string> = {
  sedentary: "Ít vận động",
  light: "Vận động nhẹ",
  moderate: "Vừa phải",
  active: "Năng động",
  very_active: "Rất năng động",
};

/** Extra energy cost of the job itself, on top of the activity multiplier. */
export const OCCUPATION_DELTA: Record<OccupationPreset, number> = {
  office: 0,
  shift: 0.04,
  manual: 0.14,
};

export const OCCUPATION_LABEL: Record<OccupationPreset, string> = {
  office: "Văn phòng / ngồi nhiều",
  shift: "Làm ca / ca đêm",
  manual: "Lao động chân tay",
};

/** Mifflin–St Jeor resting energy expenditure. */
export function bmr(sex: Sex, weightKg: number, heightCm: number, age: number) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

/** WHO Asian cut-offs — different from the Western ones. */
export function bmiCategory(bmi: number): BmiCategory {
  if (!Number.isFinite(bmi) || bmi <= 0) return "unknown";
  if (bmi < 18.5) return "underweight";
  if (bmi < 23) return "normal";
  if (bmi < 25) return "overweight";
  return "obese";
}

export const BMI_LABEL: Record<BmiCategory, string> = {
  underweight: "Thiếu cân",
  normal: "Bình thường",
  overweight: "Thừa cân",
  obese: "Béo phì",
  unknown: "Chưa xác định",
};

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

const round = (v: number, step = 10) => Math.round(v / step) * step;

/**
 * Turns a raw profile into concrete daily targets.
 * Deterministic: same input always yields the same output.
 */
export function computeTargets(input: ProfileInput): NutritionTarget {
  const { sex, age, heightCm, weightKg, activity, goal, occupation } = input;

  const bmrValue = bmr(sex, weightKg, heightCm, age);
  const activityFactor = ACTIVITY_FACTOR[activity] + OCCUPATION_DELTA[occupation];
  const tdee = bmrValue * activityFactor;

  // deficit / surplus, capped so the advice stays safe
  let calories = tdee;
  if (goal === "lose") {
    const deficit = Math.min(500, tdee * 0.175);
    calories = tdee - deficit;
  } else if (goal === "gain") {
    calories = tdee * 1.075;
  }

  const floor = sex === "male" ? 1500 : 1200;
  const wasFloored = calories < floor;
  calories = Math.max(calories, floor);

  // protein: g per kg, higher when losing weight or doing manual work
  const proteinPerKg =
    activity === "sedentary" && occupation === "office"
      ? 1.3
      : goal === "lose"
        ? 1.9
        : 1.6;
  const proteinG = Math.min(proteinPerKg * weightKg, (calories * 0.35) / 4);

  const fatG = (calories * 0.27) / 9;

  const remaining = calories - proteinG * 4 - fatG * 9;
  const carbG = Math.max(0, remaining / 4);

  const fiberG = Math.max(25, Math.round((calories / 1000) * 14));

  const bmi = weightKg / Math.pow(heightCm / 100, 2);
  const category = bmiCategory(bmi);

  const explanation: string[] = [
    `Chuyển hoá cơ bản (Mifflin–St Jeor): ${Math.round(bmrValue)} kcal/ngày.`,
    `Hệ số vận động ${activityFactor.toFixed(3)} → nhu cầu duy trì ${Math.round(tdee)} kcal.`,
    goal === "lose"
      ? "Mục tiêu giảm cân: cắt 17,5% năng lượng, không quá 500 kcal/ngày."
      : goal === "gain"
        ? "Mục tiêu tăng cân: cộng 7,5% năng lượng."
        : "Mục tiêu duy trì: giữ đúng nhu cầu duy trì.",
  ];

  if (wasFloored) {
    explanation.push(
      `Mức tính được thấp hơn ngưỡng an toàn, đã nâng lên ${floor} kcal/ngày.`,
    );
  }

  explanation.push(
    `Đạm ${proteinPerKg} g/kg cân nặng; béo 27% năng lượng; còn lại là tinh bột.`,
  );

  return {
    bmr: Math.round(bmrValue),
    tdee: Math.round(tdee),
    calories: round(calories, 10),
    proteinG: Math.round(proteinG),
    fatG: Math.round(fatG),
    carbG: Math.round(carbG),
    fiberG,
    sodiumMg: 2000,
    bmi: Math.round(bmi * 10) / 10,
    bmiCategory: category,
    explanation,
  };
}

export const goalLabel: Record<Goal, string> = {
  lose: "Giảm cân",
  maintain: "Duy trì",
  gain: "Tăng cân",
};

export { clamp };
