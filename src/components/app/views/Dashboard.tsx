"use client";

import dynamic from "next/dynamic";
import { ArrowUpRight, CircleAlert, Sparkles, Utensils } from "lucide-react";
import type { MealPlan, NutritionTarget, ProfileInput } from "@/core/types";
import type { ActiveRule } from "@/core/rules/types";
import { SLOT_LABEL } from "@/core/planner/plan";
import { BMI_LABEL, goalLabel } from "@/core/nutrition/targets";
import { Card, Bar, SeverityPill, SectionTitle } from "@/components/app/ui";
import { kcal, nf } from "@/lib/format";

const HealthOrb = dynamic(() => import("@/components/three/HealthOrb"), {
  ssr: false,
});

export function Dashboard({
  profile,
  targets,
  plan,
  active,
  onTab,
}: {
  profile: ProfileInput;
  targets: NutritionTarget;
  plan: MealPlan;
  active: ActiveRule[];
  onTab: (t: "plan" | "alerts") => void;
}) {
  const macros = [
    { label: "Đạm", value: targets.proteinG, kcalPerG: 4, tone: "bg-good" },
    { label: "Béo", value: targets.fatG, kcalPerG: 9, tone: "bg-peach" },
    { label: "Tinh bột", value: targets.carbG, kcalPerG: 4, tone: "bg-navy/70" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[12px] font-medium text-muted">
          Chào {profile.name} 👋
        </p>
        <h1 className="mt-1 font-display text-[26px] font-extrabold sm:text-[30px]">
          Hôm nay bạn cần {kcal(targets.calories)} kcal
        </h1>
      </div>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-9">
          <div className="relative grid h-[184px] w-[184px] shrink-0 place-items-center">
            <HealthOrb className="absolute inset-0" />
            <div className="relative text-center">
              <div className="flex items-start justify-center gap-1">
                <span className="tabular font-display text-[44px] leading-none font-extrabold tracking-[-0.045em] text-good">
                  {kcal(targets.calories)}
                </span>
                <span className="mt-1.5 rounded-full bg-white/70 px-1.5 py-0.5 text-[9.5px] font-semibold text-good">
                  kcal
                </span>
              </div>
              <p className="mt-1 text-[10.5px] font-medium text-muted">
                mục tiêu hôm nay
              </p>
            </div>
          </div>

          <div className="w-full flex-1">
            <div className="flex items-center gap-2">
              <span className="rounded-pill bg-canvas px-2.5 py-1 text-[10.5px] font-bold text-navy">
                {goalLabel[profile.goal]}
              </span>
              <span className="text-[11px] font-medium text-muted">
                BMI {targets.bmi} · {BMI_LABEL[targets.bmiCategory]}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {macros.map((m) => {
                const share = (m.value * m.kcalPerG) / targets.calories;
                return (
                  <div
                    key={m.label}
                    className="rounded-2xl border border-line/70 bg-white px-3 py-2.5"
                  >
                    <div className="flex items-baseline justify-between">
                      <p className="text-[10.5px] font-medium text-muted">
                        {m.label}
                      </p>
                      <p className="tabular text-[9.5px] font-semibold text-muted">
                        {Math.round(share * 100)}%
                      </p>
                    </div>
                    <p className="tabular mt-0.5 font-display text-[17px] font-bold">
                      {m.value}
                      <span className="ml-0.5 text-[10px] font-medium text-muted">
                        g
                      </span>
                    </p>
                    <Bar
                      value={share}
                      max={1}
                      tone={m.tone}
                      className="mt-2 h-1"
                    />
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex items-center justify-between rounded-2xl bg-canvas/70 px-3.5 py-2.5">
              <p className="text-[11.5px] font-medium text-muted">
                Natri tối đa/ngày
              </p>
              <p className="tabular text-[12.5px] font-bold text-navy">
                {nf.format(targets.sodiumMg)} mg
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <Card className="p-5">
          <SectionTitle
            title="Hôm nay ăn gì"
            action={
              <button
                type="button"
                onClick={() => onTab("plan")}
                className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-navy"
              >
                Xem thực đơn
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            }
          />
          <ul className="divide-y divide-line/70">
            {plan.meals.map((m) => (
              <li
                key={m.slot}
                className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-canvas text-navy">
                  <Utensils className="h-3.5 w-3.5" strokeWidth={2.3} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">
                    {SLOT_LABEL[m.slot]}
                  </p>
                  <p className="truncate text-[13px] font-semibold">
                    {m.recipe.name}
                  </p>
                </div>
                <span className="tabular text-[12px] font-bold text-navy">
                  {kcal(m.nutrition.kcal)}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <SectionTitle
            title="Cảnh báo từ hồ sơ"
            action={
              <button
                type="button"
                onClick={() => onTab("alerts")}
                className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-navy"
              >
                Tất cả
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            }
          />
          {active.length === 0 ? (
            <div className="rounded-2xl bg-canvas/60 px-4 py-6 text-center">
              <Sparkles className="mx-auto h-5 w-5 text-good" />
              <p className="mt-2 text-[12px] font-medium text-muted">
                Chưa có ràng buộc nào. Thêm thuốc hoặc bệnh nền để nhận cảnh
                báo.
              </p>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {active.slice(0, 3).map(({ rule, source }) => (
                <li
                  key={rule.id}
                  className="rounded-2xl border border-line/70 bg-white p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[11px] font-semibold text-muted">
                      Từ: {source}
                    </p>
                    <SeverityPill severity={rule.severity} />
                  </div>
                  <p className="mt-1.5 text-[12.5px] leading-snug font-semibold">
                    {rule.title}
                  </p>
                </li>
              ))}
              {active.length > 3 ? (
                <li className="flex items-center gap-1.5 px-1 text-[11px] font-medium text-muted">
                  <CircleAlert className="h-3 w-3" />
                  và {active.length - 3} cảnh báo khác
                </li>
              ) : null}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
