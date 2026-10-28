import type { MealPlan, NutritionTarget, ProfileInput } from "@/core/types";
import type { ActiveRule, Constraints } from "@/core/rules/types";
import type { DaySummary } from "@/core/diary/day";
import { recipes } from "@/data/recipes";
import { foods, normalize } from "@/data/foods";
import { recipeNutrition, tagsOf } from "@/core/nutrition/macros";
import { tagLabel } from "@/core/rules/labels";
import { drugById } from "@/data/drugs";

export interface CoachContext {
  profile: ProfileInput;
  targets: NutritionTarget;
  plan: MealPlan;
  active: ActiveRule[];
  constraints: Constraints;
  /** today's food log, when available */
  summary?: DaySummary;
}

export interface CoachAnswer {
  text: string;
  chips: string[];
  safety?: "red-flag" | "refusal";
}

const RED_FLAGS = [
  "đau ngực",
  "đau tim",
  "khó thở",
  "ngất",
  "bất tỉnh",
  "yếu nửa người",
  "méo miệng",
  "nói khó",
  "co giật",
  "chảy máu không cầm",
  "tự tử",
  "đường huyết 3",
  "sốt cao",
];

const REFUSALS = [
  "liều",
  "mấy viên",
  "uống thêm",
  "ngừng thuốc",
  "bỏ thuốc",
  "đổi thuốc",
  "thay thuốc",
  "kê đơn",
  "chẩn đoán",
  "tôi bị bệnh gì",
];

const has = (text: string, keys: string[]) => keys.some((k) => text.includes(k));

export const SUGGESTED_CHIPS = [
  "Hôm nay tôi ăn bao nhiêu calo?",
  "Tôi nên ăn gì bây giờ?",
  "Phở bò có được không?",
  "Tôi đang uống thuốc gì cần lưu ý?",
  "Nên tập gì hôm nay?",
];

/**
 * Deterministic coach. Every number comes from the engine; nothing is
 * generated. When a real LLM is wired in later, this stays as the fallback
 * and the LLM only rephrases the same facts.
 */
export function askCoach(
  question: string,
  ctx: CoachContext,
): CoachAnswer {
  const q = normalize(question);
  const { profile, targets, plan, active, constraints } = ctx;

  if (has(q, RED_FLAGS.map(normalize))) {
    return {
      safety: "red-flag",
      text: "Những dấu hiệu này cần được xử lý ngay, không chờ theo dõi tại nhà. Hãy gọi 115 hoặc đến cơ sở y tế gần nhất. Tôi không thể hỗ trợ đánh giá tình trạng cấp cứu.",
      chips: [],
    };
  }

  if (has(q, REFUSALS.map(normalize))) {
    return {
      safety: "refusal",
      text: "Tôi không đưa ra liều dùng, không khuyên ngừng hay đổi thuốc — việc đó thuộc về bác sĩ hoặc dược sĩ đang điều trị cho bạn. Tôi chỉ có thể giúp về ăn uống, vận động và nhắc giờ uống thuốc theo đơn.",
      chips: ["Vậy tôi nên ăn gì?", "Thuốc này kiêng món gì?"],
    };
  }

  // ---- food / dish lookup ------------------------------------------------
  const planned = plan.meals.find((m) => q.includes(normalize(m.recipe.name)));
  const dish =
    planned?.recipe ?? recipes.find((r) => q.includes(normalize(r.name)));
  if (dish) {
    const nutrition = planned?.nutrition ?? recipeNutrition(dish);
    const tags = tagsOf(dish);
    const conflicts = [...constraints.excludeTags].filter((t) => tags.has(t));
    const parts = [
      `${dish.name} khoảng ${Math.round(nutrition.kcal)} kcal, ${Math.round(nutrition.proteinG)} g đạm, ${Math.round(nutrition.fatG)} g béo.`,
    ];
    if (conflicts.length > 0) {
      parts.push(
        `Món này có ${conflicts.map(tagLabel).join(", ")} — với hồ sơ hiện tại bạn nên chọn món khác hoặc giảm khẩu phần.`,
      );
    } else if (constraints.sodiumMgMax <= 1500) {
      parts.push(
        "Món này không vượt ràng buộc của bạn, nhưng nhớ giảm nước mắm khi chế biến vì bạn đang giới hạn natri 1.500 mg/ngày.",
      );
    } else {
      parts.push("Món này phù hợp với mục tiêu hiện tại của bạn.");
    }
    return { text: parts.join(" "), chips: ["Còn món nào khác?", "Tổng ngày hôm nay bao nhiêu calo?"] };
  }

  const food = foods.find((f) => q.includes(normalize(f.name)));
  if (food) {
    return {
      text: `100 g ${food.name.toLowerCase()} có khoảng ${Math.round(food.kcal)} kcal, ${food.proteinG} g đạm, ${food.fatG} g béo. Bạn có thể thêm vào bữa phụ nếu còn dư năng lượng.`,
      chips: ["Tôi còn bao nhiêu calo?", "Nên ăn gì bây giờ?"],
    };
  }

  // ---- medication --------------------------------------------------------
  const drug = profile.drugIds
    .map((id) => drugById.get(id))
    .find((d) => d && q.includes(normalize(d.name)));
  if (drug) {
    const related = active.filter((a) => a.rule.when.drugClasses?.some((c) => drug.classes.includes(c)));
    if (related.length === 0) {
      return {
        text: `${drug.name} chưa có ràng buộc ăn uống đặc biệt trong danh mục hiện tại. Vẫn nên uống đúng giờ và hỏi dược sĩ nếu bạn dùng thêm thực phẩm bổ sung.`,
        chips: ["Tôi đang uống thuốc gì cần lưu ý?"],
      };
    }
    return {
      text: related.map((a) => `${a.rule.title}: ${a.rule.effect.advice}`).join(" "),
      chips: ["Vậy tôi nên ăn gì?", "Nên tập gì hôm nay?"],
    };
  }

  if (has(q, ["thuốc", "đơn", "uống thuốc"])) {
    const list = active.filter((a) => a.rule.when.drugClasses?.length);
    if (list.length === 0)
      return {
        text: "Hồ sơ của bạn chưa có thuốc nào cần ràng buộc ăn uống. Bạn có thể thêm thuốc ở tab Hồ sơ.",
        chips: ["Tôi nên ăn gì?"],
      };
    return {
      text: `Với ${list.length} nhóm thuốc đang dùng: ${list
        .map((a) => a.rule.title)
        .join("; ")}. Chi tiết từng cảnh báo nằm ở tab Cảnh báo.`,
      chips: ["Có món nào cần tránh?", "Nên tập gì hôm nay?"],
    };
  }

  // ---- calories / macros -------------------------------------------------
  if (has(q, ["calo", "kcal", "năng lượng", "bao nhiêu ăn"])) {
    const logged = ctx.summary?.totals.kcal ?? 0;
    if (logged > 0 && ctx.summary) {
      return {
        text: `Hôm nay bạn đã ăn ${Math.round(logged)} kcal, còn ${Math.round(ctx.summary.remaining.kcal)} kcal trên mục tiêu ${Math.round(targets.calories)}. Đạm đã nạp ${Math.round(ctx.summary.totals.proteinG)}/${targets.proteinG} g.`,
        chips: ["Tôi nên ăn gì bây giờ?", "Còn bao nhiêu đạm?"],
      };
    }
    return {
      text: `Mục tiêu hôm nay của bạn là ${Math.round(targets.calories)} kcal. Thực đơn đang gợi ý có ${Math.round(plan.total.kcal)} kcal — tức ${Math.round((plan.total.kcal / targets.calories) * 100)}% nhu cầu. Đạm ${Math.round(plan.total.proteinG)}/${targets.proteinG} g.`,
      chips: ["Tôi nên ăn gì bây giờ?", "Tại sao lại là con số này?"],
    };
  }

  if (has(q, ["tại sao", "vì sao", "cách tính", "tính ra sao"])) {
    return {
      text: `Công thức Mifflin–St Jeor cho chuyển hoá cơ bản ${Math.round(targets.bmr)} kcal. Nhân với hệ số vận động ra nhu cầu duy trì ${Math.round(targets.tdee)} kcal, rồi điều chỉnh theo mục tiêu để ra ${Math.round(targets.calories)} kcal/ngày.`,
      chips: ["Sai số bao nhiêu?", "Tôi nên ăn gì?"],
    };
  }

  if (has(q, ["đạm", "protein", "chất đạm"])) {
    return {
      text: `Bạn cần khoảng ${targets.proteinG} g đạm/ngày, thực đơn hiện tại đạt ${Math.round(plan.total.proteinG)} g. Nguồn tốt: ức gà, cá lóc, trứng, đậu hũ.`,
      chips: ["Món nào nhiều đạm nhất?", "Tôi nên ăn gì bây giờ?"],
    };
  }

  if (has(q, ["muối", "natri", "mặn"])) {
    return {
      text: `Giới hạn natri của bạn là ${constraints.sodiumMgMax} mg/ngày. Thực đơn hiện tại khoảng ${Math.round(plan.total.sodiumMg)} mg. Nước mắm là nguồn chính — 1 thìa canh đã có thể chứa hơn 1.000 mg natri.`,
      chips: ["Món nào ít muối?", "Tôi đang dùng thuốc gì?"],
    };
  }

  // ---- activity / sleep / water -----------------------------------------
  if (has(q, ["tập", "vận động", "gym", "chạy", "đi bộ", "thể dục"])) {
    const heavy = active.some((a) => a.rule.id === "nsaid-raises-bp");
    return {
      text: heavy
        ? "Hôm nay nên đi bộ nhanh 30 phút hoặc đạp xe nhẹ. Tránh nâng tạ nặng và nín thở khi gắng sức vì bạn đang dùng thuốc kháng viêm."
        : "30 phút đi bộ nhanh hoặc 20 phút tập sức mạnh là đủ. Mục tiêu 150 phút mỗi tuần.",
      chips: ["Lịch hôm nay thế nào?", "Tôi nên ăn gì sau tập?"],
    };
  }

  if (has(q, ["ngủ", "giấc ngủ", "mất ngủ"])) {
    return {
      text: `Mục tiêu 7–8 tiếng. Với người làm ca, giữ giờ ngủ cố định kể cả ngày nghỉ và chặn ánh sáng xanh 1 giờ trước khi ngủ.`,
      chips: ["Tôi nên ăn gì bây giờ?", "Cà phê có sao không?"],
    };
  }

  if (has(q, ["nước", "uống"])) {
    return {
      text: "Mục tiêu 1,5–2 lít nước/ngày, tăng thêm nếu làm việc ngoài trời. Nước tiểu vàng nhạt là dấu hiệu đủ nước.",
      chips: ["Nên tập gì hôm nay?"],
    };
  }

  if (has(q, ["ăn gì", "gợi ý", "thực đơn", "món nào"])) {
    const next = plan.meals[0];
    return {
      text: next
        ? `Gợi ý gần nhất: ${next.recipe.name} (~${Math.round(next.nutrition.kcal)} kcal). Cả ngày đang có ${plan.meals.map((m) => m.recipe.name).join(", ")}.`
        : "Bạn chưa có thực đơn. Mở tab Thực đơn để tạo.",
      chips: ["Đổi món khác", "Tôi còn bao nhiêu calo?"],
    };
  }

  if (has(q, ["giảm cân", "béo", "cân nặng"])) {
    return {
      text: `BMI hiện tại ${targets.bmi}. Mục tiêu ${Math.round(targets.calories)} kcal/ngày là mức giảm an toàn (không quá 500 kcal dưới nhu cầu duy trì ${Math.round(targets.tdee)} kcal). Giảm 0,3–0,5 kg/tuần là bền vững.`,
      chips: ["Tôi nên ăn gì?", "Nên tập gì hôm nay?"],
    };
  }

  return {
    text: `Tôi có thể giúp về năng lượng, đạm, natri, từng món ăn cụ thể, thuốc đang dùng và vận động. Hồ sơ của bạn: ${Math.round(targets.calories)} kcal/ngày, giới hạn natri ${constraints.sodiumMgMax} mg.`,
    chips: SUGGESTED_CHIPS.slice(0, 3),
  };
}
