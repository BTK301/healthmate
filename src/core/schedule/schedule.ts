import type { MacroSet, ProfileInput, MealPlan, NutritionTarget } from "@/core/types";
import type { ActiveRule } from "@/core/rules/types";
import { drugById } from "@/data/drugs";
import { SLOT_LABEL } from "@/core/planner/plan";
import { OCCUPATION_LABEL } from "@/core/nutrition/targets";

export type ScheduleKind = "wake" | "med" | "meal" | "move" | "rest" | "water" | "sleep" | "work";

export interface ScheduleItem {
  time: string;
  title: string;
  detail?: string;
  kind: ScheduleKind;
}

interface Template {
  wake: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  move: string;
  sleep: string;
  work?: string;
}

const TEMPLATES: Record<ProfileInput["occupation"], Template> = {
  office: {
    wake: "06:30",
    breakfast: "07:15",
    lunch: "12:00",
    dinner: "18:45",
    move: "20:15",
    sleep: "22:45",
    work: "08:30",
  },
  manual: {
    wake: "05:30",
    breakfast: "06:00",
    lunch: "11:30",
    dinner: "18:00",
    move: "20:00",
    sleep: "21:45",
    work: "07:00",
  },
  shift: {
    wake: "13:30",
    breakfast: "14:15",
    lunch: "19:00",
    dinner: "23:30",
    move: "12:00",
    sleep: "07:30",
    work: "16:00",
  },
};

function mealAt(plan: MealPlan, slot: "breakfast" | "lunch" | "dinner" | "snack") {
  const meal = plan.meals.find((m) => m.slot === slot);
  return meal;
}

function describeMeal(m?: { recipe: { name: string }; nutrition: MacroSet }) {
  if (!m) return undefined;
  return `${m.recipe.name} · ${Math.round(m.nutrition.kcal)} kcal`;
}

/**
 * Builds a single daily timeline that merges medication timing, meals and
 * movement. Generated from templates + rules — never from a language model.
 */
export function buildSchedule({
  profile,
  plan,
  active,
}: {
  profile: ProfileInput;
  plan: MealPlan;
  active: ActiveRule[];
  targets: NutritionTarget;
}): ScheduleItem[] {
  const t = TEMPLATES[profile.occupation];
  const items: ScheduleItem[] = [];

  items.push({
    time: t.wake,
    title: "Thức dậy",
    detail:
      profile.occupation === "shift"
        ? "Uống một cốc nước ấm trước khi ăn."
        : "Uống 250 ml nước sau khi thức dậy.",
    kind: "wake",
  });

  // medication that must be taken on an empty stomach
  const thyroid = profile.drugIds
    .map((id) => drugById.get(id))
    .find((d) => d?.classes.includes("thyroid"));
  if (thyroid) {
    items.push({
      time: t.wake,
      title: `Uống ${thyroid.name} (bụng đói)`,
      detail: "Cách bữa sáng 30–60 phút, không uống cùng sữa hoặc cà phê.",
      kind: "med",
    });
  }

  items.push({
    time: t.breakfast,
    title: "Bữa sáng",
    detail: describeMeal(mealAt(plan, "breakfast")),
    kind: "meal",
  });

  // most oral medicines are taken with or right after food
  const withFood = profile.drugIds
    .map((id) => drugById.get(id))
    .filter((d) => d && !d.classes.includes("thyroid"));
  if (withFood.length > 0) {
    items.push({
      time: t.breakfast,
      title: `Uống thuốc sau ăn`,
      detail: withFood.map((d) => d!.name).join(", "),
      kind: "med",
    });
  }

  if (t.work) {
    items.push({
      time: t.work,
      title:
        profile.occupation === "office"
          ? "Bắt đầu làm việc"
          : profile.occupation === "manual"
            ? "Bắt đầu ca làm"
            : "Vào ca",
      detail:
        profile.occupation === "office"
          ? "Đứng dậy giãn cơ 5 phút sau mỗi 60–90 phút ngồi."
          : "Khởi động 5 phút trước khi vào ca.",
      kind: "work",
    });
  }

  items.push({
    time: "10:00",
    title: "Giãn cơ & nghỉ mắt",
    detail: "5 phút: cổ, vai, cổ tay. Nhìn xa 20 giây mỗi 20 phút.",
    kind: "rest",
  });

  items.push({
    time: t.lunch,
    title: "Bữa trưa",
    detail: describeMeal(mealAt(plan, "lunch")),
    kind: "meal",
  });

  items.push({
    time: "12:40",
    title: "Đi bộ 10 phút",
    detail: "Đi bộ nhẹ sau ăn giúp giảm đỉnh đường huyết.",
    kind: "move",
  });

  items.push({
    time: "15:00",
    title: "Uống 250 ml nước",
    detail:
      profile.occupation === "manual"
        ? "Làm việc ngoài trời: thêm điện giải nếu ra nhiều mồ hôi."
        : "Mục tiêu 1,5–2 lít nước cả ngày.",
    kind: "water",
  });

  const snack = mealAt(plan, "snack");
  if (snack) {
    items.push({
      time: "16:00",
      title: "Bữa phụ",
      detail: describeMeal(snack),
      kind: "meal",
    });
  }

  items.push({
    time: t.dinner,
    title: "Bữa tối",
    detail: describeMeal(mealAt(plan, "dinner")),
    kind: "meal",
  });

  // movement is adjusted by what the rules say
  const heavyLift = active.find((a) =>
    a.rule.effect.excludeTags?.includes("alcohol") &&
    a.rule.id === "nsaid-raises-bp",
  );
  items.push({
    time: t.move,
    title: heavyLift ? "Vận động nhẹ 30 phút" : "Vận động 30 phút",
    detail: heavyLift
      ? "Đi bộ nhanh hoặc đạp xe. Tránh nâng tạ nặng và nín thở khi gắng sức."
      : "Đi bộ nhanh, đạp xe hoặc bài tập sức mạnh nhẹ.",
    kind: "move",
  });

  const gastritis = active.some((a) => a.rule.id === "gastritis-irritants");
  items.push({
    time: t.sleep,
    title: "Đi ngủ",
    detail: gastritis
      ? "Không nằm ngay sau ăn; dừng ăn trước giờ ngủ ít nhất 2 giờ."
      : "Ngủ 7–8 tiếng. Ngừng caffeine ít nhất 6 giờ trước khi ngủ.",
    kind: "sleep",
  });

  return items.sort((a, b) => a.time.localeCompare(b.time));
}

export const KIND_LABEL: Record<ScheduleKind, string> = {
  wake: "Thức dậy",
  med: "Thuốc",
  meal: "Bữa ăn",
  move: "Vận động",
  rest: "Nghỉ",
  water: "Nước",
  sleep: "Giấc ngủ",
  work: "Công việc",
};

export function scheduleSummary(profile: ProfileInput) {
  return OCCUPATION_LABEL[profile.occupation];
}

export { SLOT_LABEL };
