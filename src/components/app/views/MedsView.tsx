"use client";

import { useMemo } from "react";
import { Check, Clock, Plus, ScanLine, Sun, Sunrise, Moon } from "lucide-react";
import type { ActiveRule } from "@/core/rules/types";
import type { DoseLog, MedicationPlan } from "@/core/meds/types";
import { FOOD_LABEL } from "@/core/meds/types";
import {
  adherence,
  dosesForDate,
  nextDose,
  prettyTime,
} from "@/core/meds/schedule";
import { drugById } from "@/data/drugs";
import { classInfoFor } from "@/data/drugClasses";
import { Card, Bar, SeverityPill, SectionTitle } from "@/components/app/ui";
import { AddMedicationSheet, TrashButton } from "@/components/app/AddMedicationSheet";
import { ScanSheet } from "@/components/app/ScanSheet";
import { cn } from "@/lib/cn";
import { useState } from "react";

const iconForTime = (time: string) => {
  const h = Number(time.split(":")[0]);
  if (h < 11) return Sunrise;
  if (h < 17) return Sun;
  return Moon;
};

export function MedsView({
  plans,
  logs,
  today,
  active,
  onToggle,
  onRemove,
  onAdd,
}: {
  plans: MedicationPlan[];
  logs: DoseLog[];
  today: string;
  active: ActiveRule[];
  onToggle: (doseId: string, planId: string, date: string, time: string) => void;
  onRemove: (planId: string) => void;
  onAdd: (plan: Omit<MedicationPlan, "id" | "createdAt">) => void;
}) {
  const [open, setOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);

  const doses = useMemo(
    () => dosesForDate(plans, logs, today),
    [plans, logs, today],
  );
  const stats = useMemo(() => adherence(plans, logs, 7), [plans, logs]);
  const next = useMemo(() => nextDose(doses), [doses]);
  const takenToday = doses.filter((d) => d.taken).length;

  const rulesFor = (plan: MedicationPlan) => {
    const drug = drugById.get(plan.drugId);
    if (!drug) return [];
    return active.filter((a) =>
      a.rule.when.drugClasses?.some((c) => drug.classes.includes(c)),
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold tracking-[0.16em] text-muted uppercase">
            Lịch uống thuốc
          </p>
          <h1 className="mt-1 font-display text-[26px] font-extrabold">
            {doses.length > 0
              ? `${takenToday}/${doses.length} liều hôm nay`
              : "Chưa có lịch uống"}
          </h1>
          <p className="mt-1 text-[12px] text-muted">
            {next
              ? `Liều kế tiếp: ${next.plan.doseText} ${drugById.get(next.plan.drugId)?.name ?? ""} lúc ${prettyTime(next.time)}`
              : doses.length > 0
                ? "Đã uống đủ các liều hôm nay."
                : "Thêm thuốc để app nhắc mỗi ngày."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setScanOpen(true)}
            className="inline-flex h-10 items-center gap-1.5 rounded-pill border border-navy/15 bg-white px-4 text-[12.5px] font-semibold text-navy transition-colors hover:bg-canvas"
          >
            <ScanLine className="h-4 w-4" />
            Quét đơn
          </button>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-10 items-center gap-1.5 rounded-pill bg-navy px-4 text-[12.5px] font-semibold text-white transition-transform hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            Thêm thuốc
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-[10.5px] font-medium text-muted">Tuân thủ 7 ngày</p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="tabular font-display text-[26px] leading-none font-extrabold text-good">
              {Math.round(stats.rate * 100)}%
            </span>
            <span className="text-[11px] font-medium text-muted">
              {stats.taken}/{stats.total} liều
            </span>
          </div>
          <Bar value={stats.rate} max={1} tone="bg-good" className="mt-2 h-1.5" />
        </Card>

        <Card className="p-4">
          <p className="text-[10.5px] font-medium text-muted">Chuỗi ngày đủ liều</p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="tabular font-display text-[26px] leading-none font-extrabold">
              {stats.streakDays}
            </span>
            <span className="text-[11px] font-medium text-muted">ngày liên tiếp</span>
          </div>
          <p className="mt-2 text-[10.5px] text-muted">
            {stats.streakDays > 0 ? "Tiếp tục giữ nhé." : "Bắt đầu từ hôm nay."}
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-[10.5px] font-medium text-muted">Thuốc đang dùng</p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="tabular font-display text-[26px] leading-none font-extrabold">
              {plans.length}
            </span>
            <span className="text-[11px] font-medium text-muted">loại</span>
          </div>
          <p className="mt-2 text-[10.5px] text-muted">
            {plans.filter((p) => p.endDate === null).length} dài hạn
          </p>
        </Card>
      </div>

      <Card className="p-5">
        <SectionTitle title="Hôm nay" />
        {doses.length === 0 ? (
          <div className="rounded-2xl bg-canvas/60 px-4 py-8 text-center">
            <Clock className="mx-auto h-4 w-4 text-navy/40" />
            <p className="mt-2 text-[12px] font-medium text-muted">
              Chưa có liều nào. Bấm “Thêm thuốc” để bắt đầu.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {doses.map((dose) => {
              const drug = drugById.get(dose.plan.drugId);
              const Icon = iconForTime(dose.time);
              return (
                <li key={dose.id}>
                  <button
                    type="button"
                    onClick={() =>
                      onToggle(dose.id, dose.plan.id, dose.date, dose.time)
                    }
                    aria-pressed={dose.taken}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors",
                      dose.taken
                        ? "border-good/25 bg-good-soft/50"
                        : dose.overdue
                          ? "border-danger/25 bg-danger/5"
                          : "border-line bg-white hover:bg-canvas/60",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-9 w-9 shrink-0 place-items-center rounded-full",
                        dose.taken
                          ? "bg-good text-white"
                          : dose.overdue
                            ? "bg-danger/10 text-danger"
                            : "bg-canvas text-navy",
                      )}
                    >
                      {dose.taken ? (
                        <Check className="h-4 w-4" strokeWidth={3} />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline gap-1.5">
                        <span className="tabular text-[13px] font-bold text-navy">
                          {prettyTime(dose.time)}
                        </span>
                        <span className="truncate text-[13px] font-semibold">
                          {drug?.name ?? "Thuốc"}
                        </span>
                      </span>
                      <span className="block text-[10.5px] text-muted">
                        {dose.plan.doseText} · {FOOD_LABEL[dose.plan.foodTiming]}
                        {dose.overdue ? " · quá giờ" : ""}
                      </span>
                    </span>

                    <span
                      className={cn(
                        "shrink-0 rounded-pill px-2 py-1 text-[10px] font-bold",
                        dose.taken
                          ? "bg-good text-white"
                          : dose.overdue
                            ? "bg-danger/10 text-danger"
                            : "bg-canvas text-muted",
                      )}
                    >
                      {dose.taken ? "Đã uống" : dose.overdue ? "Chưa uống" : "Sắp tới"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card className="p-5">
        <SectionTitle
          title="Đơn thuốc của bạn"
          action={
            <span className="text-[11px] font-semibold text-muted">
              {plans.length} loại
            </span>
          }
        />
        {plans.length === 0 ? (
          <p className="rounded-2xl bg-canvas/60 px-4 py-6 text-center text-[12px] text-muted">
            Chưa có thuốc nào.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {plans.map((plan) => {
              const drug = drugById.get(plan.drugId);
              const warnings = rulesFor(plan);
              return (
                <li
                  key={plan.id}
                  className="rounded-2xl border border-line/70 bg-white p-3.5"
                >
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold text-navy">
                        {drug?.name ?? "Thuốc"}
                      </p>
                      {drug ? (
                        <p className="mt-0.5 text-[10.5px] text-navy/70">
                          {classInfoFor(drug.classes)[0]?.label} ·{" "}
                          {classInfoFor(drug.classes)[0]?.usedFor}
                        </p>
                      ) : null}
                      <p className="mt-0.5 text-[10.5px] text-muted">
                        {plan.doseText} · {FOOD_LABEL[plan.foodTiming]} ·{" "}
                        {plan.endDate ? `đến ${plan.endDate}` : "dài hạn"}
                      </p>
                    </div>
                    <TrashButton
                      onClick={() => onRemove(plan.id)}
                      label={`Xoá ${drug?.name ?? "thuốc"}`}
                    />
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {plan.times.map((t) => (
                      <span
                        key={t}
                        className="tabular rounded-pill bg-canvas px-2 py-0.5 text-[10.5px] font-bold text-navy"
                      >
                        {prettyTime(t)}
                      </span>
                    ))}
                  </div>

                  {warnings.length > 0 ? (
                    <ul className="mt-2 space-y-1.5">
                      {warnings.slice(0, 2).map(({ rule }) => (
                        <li
                          key={rule.id}
                          className="rounded-xl bg-peach-soft/50 px-2.5 py-2"
                        >
                          <div className="flex items-center gap-1.5">
                            <SeverityPill severity={rule.severity} />
                          </div>
                          <p className="mt-1 text-[10.5px] leading-snug text-[#7a4a17]">
                            {rule.effect.advice}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <AddMedicationSheet
        open={open}
        onClose={() => setOpen(false)}
        onSave={onAdd}
      />

      <ScanSheet
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onImport={(plans) => plans.forEach((p) => onAdd(p))}
      />
    </div>
  );
}
