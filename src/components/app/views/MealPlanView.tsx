"use client";

import { Clock, RefreshCw, Repeat2, Wallet } from "lucide-react";
import type { MealPlan, MealSlot, NutritionTarget } from "@/core/types";
import { SLOT_LABEL, SLOT_WEIGHT } from "@/core/planner/plan";
import { Bar, Card, SectionTitle } from "@/components/app/ui";
import { grams, kcal, sodium } from "@/lib/format";
import { cn } from "@/lib/cn";

const TONE = {
  breakfast: "bg-peach-soft text-[#8a5a10]",
  lunch: "bg-good-soft text-good",
  dinner: "bg-navy-soft text-navy",
  snack: "bg-lime-soft text-[#5c6410]",
} as const;

export function MealPlanView({
  plan,
  targets,
  onSwap,
  onRegenerate,
}: {
  plan: MealPlan;
  targets: NutritionTarget;
  onSwap: (slot: MealSlot) => void;
  onRegenerate: () => void;
}) {
  const coverage = Math.round((plan.total.kcal / targets.calories) * 100);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold tracking-[0.16em] text-muted uppercase">
            Thực đơn hôm nay
          </p>
          <h1 className="mt-1 font-display text-[26px] font-extrabold">
            {coverage}% nhu cầu, đúng mục tiêu
          </h1>
        </div>
        <button
          type="button"
          onClick={onRegenerate}
          className="inline-flex h-10 items-center gap-1.5 rounded-pill bg-navy px-4 text-[12.5px] font-semibold text-white transition-transform hover:-translate-y-0.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Đổi cả ngày
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {plan.meals.map((meal) => (
          <Card key={meal.slot} className="flex h-full flex-col p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span
                  className={cn(
                    "inline-block rounded-pill px-2 py-0.5 text-[10px] font-bold",
                    TONE[meal.slot],
                  )}
                >
                  {SLOT_LABEL[meal.slot]} · {Math.round(SLOT_WEIGHT[meal.slot] * 100)}%
                </span>
                <h3 className="mt-2 font-display text-[16px] leading-tight font-bold">
                  {meal.recipe.name}
                </h3>
              </div>
              <div className="text-right">
                <p className="tabular font-display text-[18px] leading-none font-extrabold text-navy">
                  {kcal(meal.nutrition.kcal)}
                </p>
                <p className="text-[9.5px] font-medium text-muted">kcal</p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-medium text-muted">
              <span>
                Đạm{" "}
                <b className="tabular text-navy">
                  {grams(meal.nutrition.proteinG)}
                </b>
              </span>
              <span>
                Béo{" "}
                <b className="tabular text-navy">
                  {grams(meal.nutrition.fatG)}
                </b>
              </span>
              <span>
                Bột{" "}
                <b className="tabular text-navy">
                  {grams(meal.nutrition.carbG)}
                </b>
              </span>
            </div>

            {meal.recipe.note ? (
              <p className="mt-2.5 rounded-xl bg-canvas/70 px-2.5 py-2 text-[11px] leading-snug text-muted">
                {meal.recipe.note}
              </p>
            ) : null}

            <div className="mt-auto flex items-center justify-between border-t border-line/70 pt-2.5">
              <div className="flex items-center gap-3 text-[10.5px] font-medium text-muted">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {meal.recipe.minutes} phút
                </span>
                <span className="inline-flex items-center gap-1">
                  <Wallet className="h-3 w-3" /> ~{meal.recipe.priceK}k
                </span>
              </div>
              <button
                type="button"
                onClick={() => onSwap(meal.slot)}
                className="inline-flex items-center gap-1 rounded-pill border border-navy/12 px-2.5 py-1 text-[10.5px] font-semibold text-navy transition-colors hover:bg-canvas"
              >
                <Repeat2 className="h-3 w-3" />
                Đổi món
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <SectionTitle title="Tổng cả ngày" />
        <div className="flex items-baseline gap-2">
          <span className="tabular font-display text-[30px] font-extrabold text-navy">
            {kcal(plan.total.kcal)}
          </span>
          <span className="text-[12px] font-medium text-muted">
            / {kcal(targets.calories)} kcal
          </span>
        </div>
        <Bar
          value={plan.total.kcal}
          max={targets.calories}
          tone="bg-good"
          className="mt-2 h-2"
        />

        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Đạm", have: plan.total.proteinG, need: targets.proteinG },
            { label: "Béo", have: plan.total.fatG, need: targets.fatG },
            { label: "Tinh bột", have: plan.total.carbG, need: targets.carbG },
            {
              label: "Natri",
              have: plan.total.sodiumMg,
              need: targets.sodiumMg,
            },
          ].map((row) => (
            <div key={row.label} className="rounded-2xl bg-canvas/60 px-3 py-2.5">
              <dt className="text-[10.5px] font-medium text-muted">
                {row.label}
              </dt>
              <dd className="tabular mt-0.5 text-[13px] font-bold text-navy">
                {row.label === "Natri"
                  ? sodium(row.have)
                  : grams(row.have)}
                <span className="ml-1 text-[10px] font-medium text-muted">
                  / {row.label === "Natri" ? sodium(row.need) : grams(row.need)}
                </span>
              </dd>
              <Bar
                value={row.have}
                max={row.need}
                tone={
                  row.have > row.need * 1.05 ? "bg-danger" : "bg-good"
                }
                className="mt-1.5 h-1"
              />
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
