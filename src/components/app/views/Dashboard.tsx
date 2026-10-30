"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import {
  ArrowUpRight,
  Check,
  CircleAlert,
  Clock,
  Pill,
  Plus,
  Sparkles,
  Utensils,
} from "lucide-react";
import type { MealPlan, NutritionTarget, ProfileInput } from "@/core/types";
import type { ActiveRule } from "@/core/rules/types";
import type { DaySummary } from "@/core/diary/day";
import type { DiaryEntry } from "@/core/diary/types";
import { useMeds } from "@/lib/meds-store";
import { useMetrics } from "@/lib/metrics-store";
import {
  adherence,
  dosesForDate,
  nextDose,
  prettyTime,
} from "@/core/meds/schedule";
import { drugById } from "@/data/drugs";
import { BMI_LABEL, goalLabel } from "@/core/nutrition/targets";
import { Card, Bar, SeverityPill, SectionTitle } from "@/components/app/ui";
import { WeightCard } from "@/components/app/WeightCard";
import { kcal, nf } from "@/lib/format";
import { cn } from "@/lib/cn";

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
  onOpenTreatment,
  onOpenMeals,
}: {
  profile: ProfileInput;
  targets: NutritionTarget;
  plan: MealPlan;
  active: ActiveRule[];
  summary: DaySummary;
  entries: DiaryEntry[];
  onRemoveEntry: (id: string) => void;
  onAddFood: () => void;
  onOpenTreatment: (tab: "schedule" | "interactions") => void;
  onOpenMeals: () => void;
}) {
  const { plans, logs, today, toggleDose } = useMeds();
  const {
    entries: weights,
    add: addWeight,
    clearSamples,
  } = useMetrics();

  const doses = useMemo(() => dosesForDate(plans, logs, today), [plans, logs, today]);
  const stats = useMemo(() => adherence(plans, logs, 7), [plans, logs]);
  const next = useMemo(() => nextDose(doses), [doses]);

  const remaining = doses.filter((d) => !d.taken);
  const takenCount = doses.length - remaining.length;
  const done = doses.length > 0 && remaining.length === 0;

  const todayLabel = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date());

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[12px] font-medium text-muted first-letter:uppercase">
          {todayLabel}
        </p>
        <h1 className="mt-1 font-display text-[26px] font-extrabold sm:text-[30px]">
          {done
            ? `Xong việc hôm nay, ${profile.name} 🎉`
            : remaining.length > 0
              ? `${remaining.length} liều cần uống hôm nay`
              : `Chào ${profile.name} 👋`}
        </h1>
      </div>

      {/* ---- medication first ---- */}
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-9">
          <div className="relative grid h-[176px] w-[176px] shrink-0 place-items-center">
            <HealthOrb className="absolute inset-0" />
            <div className="relative text-center">
              {done ? (
                <span className="grid h-14 w-14 place-items-center rounded-full bg-good text-white">
                  <Check className="h-7 w-7" strokeWidth={3} />
                </span>
              ) : (
                <div className="flex items-start justify-center gap-1">
                  <span className="tabular font-display text-[52px] leading-none font-extrabold tracking-[-0.045em] text-good">
                    {remaining.length}
                  </span>
                  <span className="mt-1.5 rounded-full bg-white/70 px-1.5 py-0.5 text-[9.5px] font-semibold text-good">
                    liều
                  </span>
                </div>
              )}
              <p className="mt-1.5 text-[10.5px] font-medium text-muted">
                {done ? "đã uống đủ" : "còn lại hôm nay"}
              </p>
            </div>
          </div>

          <div className="w-full flex-1">
            {next ? (
              <div className="rounded-2xl border border-line/70 bg-white p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold tracking-[0.14em] text-muted uppercase">
                      Liều kế tiếp
                    </p>
                    <p className="mt-1 flex items-baseline gap-1.5">
                      <span className="tabular text-[17px] font-extrabold text-navy">
                        {prettyTime(next.time)}
                      </span>
                      <span className="truncate text-[14px] font-semibold">
                        {drugById.get(next.plan.drugId)?.name ?? "Thuốc"}
                      </span>
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted">
                      {next.plan.doseText} ·{" "}
                      {next.plan.foodTiming === "before"
                        ? "trước ăn 30 phút"
                        : next.plan.foodTiming === "after"
                          ? "sau ăn"
                          : "không phụ thuộc bữa ăn"}
                      {next.overdue ? " · quá giờ" : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      toggleDose(next.id, next.plan.id, next.date, next.time)
                    }
                    className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-pill bg-good px-4 text-[12.5px] font-semibold text-white transition-transform hover:-translate-y-0.5"
                  >
                    <Check className="h-4 w-4" strokeWidth={3} />
                    Đã uống
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-navy/20 bg-canvas/50 p-4 text-center">
                <Pill className="mx-auto h-5 w-5 text-navy/40" />
                <p className="mt-1.5 text-[12px] font-medium text-muted">
                  {doses.length === 0
                    ? "Chưa có lịch uống thuốc."
                    : "Đã uống đủ các liều hôm nay."}
                </p>
                {doses.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => onOpenTreatment("schedule")}
                    className="mt-2 inline-flex h-9 items-center gap-1.5 rounded-pill bg-navy px-4 text-[11.5px] font-semibold text-white"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Thêm thuốc đầu tiên
                  </button>
                ) : null}
              </div>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-pill bg-canvas px-2.5 py-1 text-[10.5px] font-bold text-navy">
                {goalLabel[profile.goal]} · BMI {targets.bmi}
              </span>
              <span
                className={cn(
                  "rounded-pill px-2.5 py-1 text-[10.5px] font-bold",
                  stats.rate >= 0.8
                    ? "bg-good-soft text-good"
                    : stats.rate >= 0.5
                      ? "bg-lime-soft text-[#5c6410]"
                      : "bg-peach-soft text-peach-ink",
                )}
              >
                Tuân thủ 7 ngày {Math.round(stats.rate * 100)}%
              </span>
              {stats.streakDays > 0 ? (
                <span className="rounded-pill bg-peach-soft px-2.5 py-1 text-[10.5px] font-bold text-peach-ink">
                  Chuỗi {stats.streakDays} ngày
                </span>
              ) : null}
            </div>

            {doses.length > 0 ? (
              <div className="mt-3">
                <div className="flex items-center justify-between text-[10.5px] font-medium text-muted">
                  <span>Hôm nay</span>
                  <span className="tabular font-bold text-navy">
                    {takenCount}/{doses.length} liều
                  </span>
                </div>
                <Bar
                  value={takenCount}
                  max={doses.length}
                  tone="bg-good"
                  className="mt-1.5 h-1.5"
                />
              </div>
            ) : null}
          </div>
        </div>
      </Card>

      {/* ---- remaining doses ---- */}
      {remaining.length > 0 ? (
        <Card className="p-5">
          <SectionTitle
            title="Các liều còn lại"
            action={
              <button
                type="button"
                onClick={() => onOpenTreatment("schedule")}
                className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-navy"
              >
                Lịch đầy đủ
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            }
          />
          <ul className="divide-y divide-line/70">
            {remaining.slice(0, 4).map((dose) => (
              <li key={dose.id} className="flex items-center gap-3 py-2.5 first:pt-0">
                <span className="tabular w-10 shrink-0 text-[12px] font-bold text-navy">
                  {prettyTime(dose.time)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold">
                    {drugById.get(dose.plan.drugId)?.name ?? "Thuốc"}
                  </p>
                  <p className="text-[10.5px] text-muted">
                    {dose.plan.doseText}
                    {dose.overdue ? " · quá giờ" : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    toggleDose(dose.id, dose.plan.id, dose.date, dose.time)
                  }
                  className={cn(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-colors",
                    dose.overdue
                      ? "border-danger/30 bg-danger/5 text-danger hover:bg-danger/10"
                      : "border-line bg-white text-navy hover:bg-canvas",
                  )}
                  aria-label={`Đánh dấu đã uống ${drugById.get(dose.plan.drugId)?.name ?? ""}`}
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {/* ---- secondary: meals + alerts ---- */}
      <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <Card className="p-5">
          <SectionTitle
            title="Bữa ăn hôm nay"
            action={
              <button
                type="button"
                onClick={onOpenMeals}
                className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-navy"
              >
                Xem
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            }
          />
          <div className="rounded-2xl border border-line/70 bg-white px-3.5 py-3">
            <div className="flex items-baseline justify-between">
              <span className="text-[10.5px] font-medium text-muted">
                Đã ăn
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
            {entries.length === 0 ? (
              <p className="mt-2 text-[10.5px] text-muted">
                Chưa ghi món nào — bấm “Thêm món” để trừ vào mục tiêu.
              </p>
            ) : null}
          </div>

          <div className="mt-2 flex items-center justify-between rounded-2xl bg-canvas/70 px-3.5 py-2.5">
            <p className="text-[11.5px] font-medium text-muted">
              Natri hôm nay
            </p>
            <p className="tabular text-[12.5px] font-bold text-navy">
              {entries.length > 0
                ? `${nf.format(Math.round(summary.totals.sodiumMg))} / `
                : ""}
              {nf.format(targets.sodiumMg)} mg
            </p>
          </div>

          <button
            type="button"
            onClick={onAddFood}
            className="mt-2 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-pill border border-navy/15 bg-white text-[11.5px] font-semibold text-navy transition-colors hover:bg-canvas"
          >
            <Plus className="h-3.5 w-3.5" />
            Thêm món đã ăn
          </button>
        </Card>

        <Card className="p-5">
          <SectionTitle
            title="Cần lưu ý"
            action={
              <button
                type="button"
                onClick={() => onOpenTreatment("interactions")}
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
                Chưa có ràng buộc nào. Thêm thuốc hoặc bệnh nền để nhận cảnh báo.
              </p>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {active.slice(0, 2).map(({ rule, source }) => (
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
              {active.length > 2 ? (
                <li className="flex items-center gap-1.5 px-1 text-[11px] font-medium text-muted">
                  <CircleAlert className="h-3 w-3" />
                  và {active.length - 2} lưu ý khác
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

      {remaining.length === 0 && doses.length > 0 ? (
        <div className="flex items-center gap-2 rounded-card bg-good-soft/50 px-4 py-3">
          <Clock className="h-4 w-4 text-good" />
          <p className="text-[11.5px] text-good">
            Hôm nay bạn đã uống đủ {doses.length} liều. Mai app sẽ nhắc lại đúng giờ.
          </p>
        </div>
      ) : null}

      <p className="px-1 text-[10px] leading-snug text-muted/80">
        <Utensils className="mr-1 inline h-3 w-3 align-[-2px]" />
        Gợi ý bữa ăn dựa trên bệnh nền và thuốc đang dùng — không thay thế tư vấn
        của bác sĩ.
      </p>
    </div>
  );
}
