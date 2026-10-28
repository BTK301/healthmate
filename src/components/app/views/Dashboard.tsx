"use client";

import dynamic from "next/dynamic";
import { ArrowUpRight, CircleAlert, Plus, Sparkles, Trash2, Utensils } from "lucide-react";
import type { MealPlan, NutritionTarget, ProfileInput } from "@/core/types";
import type { ActiveRule } from "@/core/rules/types";
import type { DaySummary } from "@/core/diary/day";
import type { DiaryEntry } from "@/core/diary/types";
import { SLOT_LABEL } from "@/core/planner/plan";
import { BMI_LABEL, goalLabel } from "@/core/nutrition/targets";
import { Card, Bar, SeverityPill, SectionTitle } from "@/components/app/ui";
import { WeightCard } from "@/components/app/WeightCard";
import { useMetrics } from "@/lib/metrics-store";
import { kcal, nf } from "@/lib/format";

const HealthOrb = dynamic(() => import("@/components/three/HealthOrb"), {
  ssr: false,
});

export function Dashboard({
  profile,
  targets,
  plan,
  active,
  summary,
  entries,
  onRemoveEntry,
  onAddFood,
  onTab,
}: {
  profile: ProfileInput;
  targets: NutritionTarget;
  plan: MealPlan;
  active: ActiveRule[];
  summary: DaySummary;
  entries: DiaryEntry[];
  onRemoveEntry: (id: string) => void;
  onAddFood: () => void;
  onTab: (t: "plan" | "alerts") => void;
}) {
  const hasLog = entries.length > 0;
  const headline = hasLog ? summary.remaining.kcal : targets.calories;
  const { entries: weights, add: addWeight, clearSamples } = useMetrics();

  const macros = [
    {
      label: "Đạm",
      target: targets.proteinG,
      consumed: summary.totals.proteinG,
      tone: "bg-good",
      over: "bg-danger",
    },
    {
      label: "Béo",
      target: targets.fatG,
      consumed: summary.totals.fatG,
      tone: "bg-peach",
      over: "bg-danger",
    },
    {
      label: "Tinh bột",
      target: targets.carbG,
      consumed: summary.totals.carbG,
      tone: "bg-navy/70",
      over: "bg-danger",
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[12px] font-medium text-muted">
          Chào {profile.name} 👋
        </p>
        <h1 className="mt-1 font-display text-[26px] font-extrabold sm:text-[30px]">
          {hasLog
            ? summary.remaining.kcal > 0
              ? `Còn ${kcal(summary.remaining.kcal)} kcal cho hôm nay`
              : "Bạn đã ăn đủ hôm nay"
            : `Hôm nay bạn cần ${kcal(targets.calories)} kcal`}
        </h1>
      </div>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-9">
          <div className="relative grid h-[184px] w-[184px] shrink-0 place-items-center">
            <HealthOrb className="absolute inset-0" />
            <div className="relative text-center">
              <div className="flex items-start justify-center gap-1">
                <span className="tabular font-display text-[44px] leading-none font-extrabold tracking-[-0.045em] text-good">
                  {kcal(headline)}
                </span>
                <span className="mt-1.5 rounded-full bg-white/70 px-1.5 py-0.5 text-[9.5px] font-semibold text-good">
                  kcal
                </span>
              </div>
              <p className="mt-1 text-[10.5px] font-medium text-muted">
                {hasLog ? "còn lại hôm nay" : "mục tiêu hôm nay"}
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

            <div className="mt-4 rounded-2xl border border-line/70 bg-white px-3.5 py-3">
              <div className="flex items-baseline justify-between">
                <span className="text-[10.5px] font-medium text-muted">
                  Đã ăn hôm nay
                </span>
                <span className="tabular text-[11.5px] font-bold text-navy">
                  {kcal(summary.totals.kcal)} / {kcal(targets.calories)} kcal
                </span>
              </div>
              <Bar
                value={summary.totals.kcal}
                max={targets.calories}
                tone={summary.overTarget ? "bg-danger" : "bg-good"}
                className="mt-2 h-1.5"
              />
              {summary.overTarget ? (
                <p className="mt-1.5 text-[10.5px] font-medium text-danger">
                  Đã vượt mục tiêu — bữa còn lại nên nhẹ hơn.
                </p>
              ) : null}
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2.5">
              {macros.map((m) => {
                const share = m.target > 0 ? m.consumed / m.target : 0;
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
                      {hasLog ? Math.round(m.consumed) : m.target}
                      <span className="ml-0.5 text-[10px] font-medium text-muted">
                        / {m.target} g
                      </span>
                    </p>
                    <Bar
                      value={share}
                      max={1}
                      tone={share > 1.05 ? m.over : m.tone}
                      className="mt-2 h-1"
                    />
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between rounded-2xl bg-canvas/70 px-3.5 py-2.5">
              <p className="text-[11.5px] font-medium text-muted">
                Natri hôm nay
              </p>
              <p className="tabular text-[12.5px] font-bold text-navy">
                {hasLog
                  ? `${nf.format(Math.round(summary.totals.sodiumMg))} / `
                  : ""}
                {nf.format(targets.sodiumMg)} mg
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <Card className="p-5">
          <SectionTitle
            title="Đã ăn hôm nay"
            action={
              <button
                type="button"
                onClick={onAddFood}
                className="inline-flex h-8 items-center gap-1 rounded-pill bg-navy px-3 text-[11px] font-semibold text-white"
              >
                <Plus className="h-3.5 w-3.5" />
                Thêm món
              </button>
            }
          />

          {entries.length === 0 ? (
            <div className="rounded-2xl bg-canvas/60 px-4 py-7 text-center">
              <span className="mx-auto grid h-9 w-9 place-items-center rounded-full bg-white text-navy/45">
                <Utensils className="h-4 w-4" strokeWidth={2} />
              </span>
              <p className="mt-2.5 text-[12px] font-medium text-muted">
                Chưa ghi món nào hôm nay.
              </p>
              <p className="mt-1 text-[11px] text-muted/80">
                Ăn xong thì bấm “Thêm món” để trừ vào mục tiêu.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-line/70">
              {entries.map((e) => (
                <li key={e.id} className="flex items-center gap-3 py-2.5 first:pt-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">
                      {SLOT_LABEL[e.slot]}
                    </p>
                    <p className="truncate text-[13px] font-semibold">
                      {e.name}
                      {e.grams ? (
                        <span className="ml-1 text-[11px] font-normal text-muted">
                          · {e.grams} g
                        </span>
                      ) : null}
                    </p>
                  </div>
                  <span className="tabular text-[12px] font-bold text-navy">
                    {kcal(e.nutrition.kcal)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveEntry(e.id)}
                    aria-label={`Xoá ${e.name}`}
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3 flex items-center justify-between border-t border-line/70 pt-2.5">
            <button
              type="button"
              onClick={() => onTab("plan")}
              className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-navy"
            >
              Xem thực đơn gợi ý
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
            {hasLog ? (
              <span className="tabular text-[11.5px] font-semibold text-muted">
                {kcal(summary.totals.proteinG)} g đạm ·{" "}
                {kcal(summary.totals.sodiumMg)} mg natri
              </span>
            ) : null}
          </div>
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
              <span className="mx-auto grid h-8 w-8 place-items-center rounded-full bg-white">
                <Sparkles className="h-4 w-4 text-good" />
              </span>
              <p className="mt-2.5 text-[12px] font-medium text-muted">
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

      <WeightCard
        entries={weights}
        heightCm={profile.heightCm}
        onAdd={addWeight}
        onClearSamples={clearSamples}
      />
    </div>
  );
}
