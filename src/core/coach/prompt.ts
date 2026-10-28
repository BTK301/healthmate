import type { CoachContext } from "./coach";

/**
 * The LLM never receives raw database access — only these facts, already
 * computed by the deterministic engine. That is what keeps its numbers honest.
 */
export function buildFacts(ctx: CoachContext): string {
  const { profile, targets, plan, active, constraints, summary } = ctx;

  const lines: string[] = [];
  lines.push(
    `Hồ sơ: ${profile.sex === "male" ? "nam" : "nữ"}, ${profile.age} tuổi, ${profile.heightCm} cm, ${profile.weightKg} kg.`,
  );
  lines.push(
    `Nhu cầu: BMR ${targets.bmr} kcal, duy trì ${targets.tdee} kcal, mục tiêu ${targets.calories} kcal/ngày.`,
  );
  lines.push(
    `Đạm ${targets.proteinG} g, béo ${targets.fatG} g, tinh bột ${targets.carbG} g, natri tối đa ${constraints.sodiumMgMax} mg.`,
  );
  lines.push(`BMI ${targets.bmi}.`);

  if (summary && summary.totals.kcal > 0) {
    lines.push(
      `Đã ăn hôm nay: ${Math.round(summary.totals.kcal)} kcal, còn lại ${Math.round(summary.remaining.kcal)} kcal; đạm đã nạp ${Math.round(summary.totals.proteinG)} g, natri ${Math.round(summary.totals.sodiumMg)} mg.`,
    );
  } else {
    lines.push("Hôm nay chưa ghi món nào.");
  }

  lines.push(
    `Thực đơn gợi ý: ${plan.meals.map((m) => `${m.recipe.name} (${Math.round(m.nutrition.kcal)} kcal)`).join(", ")}.`,
  );

  if (active.length > 0) {
    lines.push(
      `Ràng buộc đang áp dụng: ${active
        .map((a) => `${a.rule.title} [${a.rule.severity}]`)
        .join("; ")}.`,
    );
  } else {
    lines.push("Không có ràng buộc đặc biệt nào.");
  }

  const excluded = [...constraints.excludeTags];
  if (excluded.length > 0) lines.push(`Cần tránh: ${excluded.join(", ")}.`);

  return lines.join("\n");
}

export const SYSTEM_PROMPT = `Bạn là trợ lý trong ứng dụng HealthMate, giúp người Việt hiểu về dinh dưỡng và lối sống.

Quy tắc bắt buộc:
1. CHỈ dùng số liệu trong phần DỮ LIỆU. Không tự tính, không tự thêm con số mới.
2. KHÔNG đưa ra liều thuốc, không khuyên tăng/giảm/ngừng thuốc, không chẩn đoán bệnh.
3. Nếu câu hỏi nằm ngoài ăn uống, vận động, giấc ngủ: nói ngắn gọn rằng bạn chỉ hỗ trợ những mảng đó.
4. Nếu người dùng nêu dấu hiệu nguy hiểm (đau ngực, khó thở, ngất...): khuyên gọi 115 ngay, không phân tích thêm.
5. Trả lời tối đa 3 câu, tiếng Việt tự nhiên, xưng "mình", gọi người dùng là "bạn".
6. Không mở đầu bằng "Chắc chắn rồi" hay lặp lại câu hỏi.`;

export function buildUserMessage(question: string, facts: string): string {
  return `DỮ LIỆU (do hệ thống tính, hãy tin số liệu này):\n${facts}\n\nCÂU HỎI CỦA NGƯỜI DÙNG:\n${question}`;
}

const DANGEROUS = [
  "uống thêm",
  "tăng liều",
  "giảm liều",
  "tăng lên",
  "ngừng thuốc",
  "bỏ thuốc",
  "đổi thuốc",
  "thay thuốc",
  "kê đơn",
  "chẩn đoán là",
  "bạn bị bệnh",
];

/** Rejects LLM output that drifts into prescribing or diagnosing. */
export function isUnsafeOutput(text: string): boolean {
  const lower = text.toLowerCase();
  return DANGEROUS.some((phrase) => lower.includes(phrase));
}
