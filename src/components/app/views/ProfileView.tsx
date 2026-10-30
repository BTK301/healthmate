"use client";

import { RotateCcw, Pill } from "lucide-react";
import type {
  ActivityLevel,
  Goal,
  NutritionTarget,
  OccupationPreset,
  ProfileInput,
} from "@/core/types";
import {
  ACTIVITY_LABEL,
  BMI_LABEL,
  goalLabel,
  OCCUPATION_LABEL,
} from "@/core/nutrition/targets";
import { conditions } from "@/data/conditions";
import { Card, SectionTitle } from "@/components/app/ui";
import { nf } from "@/lib/format";
import { cn } from "@/lib/cn";

const ACTIVITIES: ActivityLevel[] = [
  "sedentary",
  "light",
  "moderate",
  "active",
  "very_active",
];
const OCCUPATIONS: OccupationPreset[] = ["office", "shift", "manual"];
const GOALS: Goal[] = ["lose", "maintain", "gain"];

export function ProfileView({
  profile,
  targets,
  onChange,
  onReset,
}: {
  profile: ProfileInput;
  targets: NutritionTarget;
  onChange: (p: ProfileInput) => void;
  onReset: () => void;
}) {
  const patch = <K extends keyof ProfileInput>(
    key: K,
    value: ProfileInput[K],
  ) => onChange({ ...profile, [key]: value });

  const toggleCondition = (id: string) => {
    const list = profile.conditionIds;
    patch(
      "conditionIds",
      list.includes(id) ? list.filter((x) => x !== id) : [...list, id],
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-bold tracking-[0.16em] text-muted uppercase">
          Hồ sơ
        </p>
        <h1 className="mt-1 font-display text-[26px] font-extrabold">
          Chỉ số & thuốc đang dùng
        </h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <Card className="p-5">
            <SectionTitle title="Chỉ số cơ thể" />
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-[11.5px] font-semibold text-muted">
                  Cân nặng (kg)
                </span>
                <input
                  type="number"
                  value={profile.weightKg}
                  onChange={(e) =>
                    patch("weightKg", Number(e.target.value) || 0)
                  }
                  className="mt-1.5 h-11 w-full rounded-xl border border-line bg-white px-3 text-[14px] font-medium outline-none focus:border-navy/40"
                />
              </label>
              <label className="block">
                <span className="text-[11.5px] font-semibold text-muted">
                  Chiều cao (cm)
                </span>
                <input
                  type="number"
                  value={profile.heightCm}
                  onChange={(e) =>
                    patch("heightCm", Number(e.target.value) || 0)
                  }
                  className="mt-1.5 h-11 w-full rounded-xl border border-line bg-white px-3 text-[14px] font-medium outline-none focus:border-navy/40"
                />
              </label>
            </div>

            <div className="mt-4">
              <span className="text-[11.5px] font-semibold text-muted">
                Mức vận động
              </span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {ACTIVITIES.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => patch("activity", a)}
                    className={cn(
                      "rounded-pill border px-3 py-1.5 text-[11.5px] font-semibold transition-colors",
                      profile.activity === a
                        ? "border-navy bg-navy text-white"
                        : "border-line bg-white text-navy hover:bg-canvas",
                    )}
                  >
                    {ACTIVITY_LABEL[a]}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <span className="text-[11.5px] font-semibold text-muted">
                  Nghề nghiệp
                </span>
                <div className="mt-1.5 space-y-1.5">
                  {OCCUPATIONS.map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => patch("occupation", o)}
                      className={cn(
                        "w-full rounded-xl border px-3 py-2 text-left text-[11.5px] font-semibold transition-colors",
                        profile.occupation === o
                          ? "border-navy bg-navy-soft/60 text-navy"
                          : "border-line bg-white text-navy hover:bg-canvas",
                      )}
                    >
                      {OCCUPATION_LABEL[o]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[11.5px] font-semibold text-muted">
                  Mục tiêu
                </span>
                <div className="mt-1.5 space-y-1.5">
                  {GOALS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => patch("goal", g)}
                      className={cn(
                        "w-full rounded-xl border px-3 py-2 text-left text-[11.5px] font-semibold transition-colors",
                        profile.goal === g
                          ? "border-good bg-good-soft text-good"
                          : "border-line bg-white text-navy hover:bg-canvas",
                      )}
                    >
                      {goalLabel[g]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <SectionTitle
              title="Thuốc đang dùng"
              action={
                <span className="text-[11px] font-semibold text-muted">
                  {profile.drugIds.length} loại
                </span>
              }
            />
            <div className="flex items-center gap-2.5 rounded-2xl bg-canvas/70 px-3.5 py-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-navy">
                <Pill className="h-4 w-4" />
              </span>
              <p className="text-[11.5px] leading-snug text-muted">
                Thuốc và giờ uống được quản lý ở tab{" "}
                <b className="font-semibold text-navy">Thuốc</b> — thêm, đổi giờ,
                đánh dấu đã uống và xem cảnh báo riêng cho từng loại.
              </p>
            </div>
            {profile.drugIds.length > 0 ? (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {profile.drugIds.map((id) => (
                  <span
                    key={id}
                    className="rounded-pill bg-white px-2.5 py-1 text-[11px] font-semibold text-navy ring-1 ring-line"
                  >
                    {id}
                  </span>
                ))}
              </div>
            ) : null}
          </Card>

          <Card className="p-5">
            <SectionTitle title="Bệnh nền" />
            <div className="flex flex-wrap gap-1.5">
              {conditions.map((c) => {
                const on = profile.conditionIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCondition(c.id)}
                    className={cn(
                      "rounded-pill border px-3 py-1.5 text-[11.5px] font-semibold transition-colors",
                      on
                        ? "border-danger/40 bg-danger/10 text-danger"
                        : "border-line bg-white text-navy hover:bg-canvas",
                    )}
                    title={c.hint}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <SectionTitle title="Kết quả tính" />
            <dl className="space-y-2.5">
              {[
                { k: "Chuyển hoá cơ bản", v: `${nf.format(targets.bmr)} kcal` },
                { k: "Nhu cầu duy trì", v: `${nf.format(targets.tdee)} kcal` },
                { k: "Mục tiêu mỗi ngày", v: `${nf.format(targets.calories)} kcal` },
                { k: "Đạm", v: `${targets.proteinG} g` },
                { k: "Béo", v: `${targets.fatG} g` },
                { k: "Tinh bột", v: `${targets.carbG} g` },
                {
                  k: "BMI",
                  v: `${targets.bmi} · ${BMI_LABEL[targets.bmiCategory]}`,
                },
              ].map((row) => (
                <div
                  key={row.k}
                  className="flex items-center justify-between gap-3 border-b border-line/60 pb-2 last:border-0 last:pb-0"
                >
                  <dt className="text-[11.5px] text-muted">{row.k}</dt>
                  <dd className="tabular text-[12px] font-bold text-navy">
                    {row.v}
                  </dd>
                </div>
              ))}
            </dl>

            <details className="mt-4 rounded-xl bg-canvas/60 px-3 py-2">
              <summary className="cursor-pointer text-[11.5px] font-semibold text-navy">
                Cách tính
              </summary>
              <ul className="mt-2 space-y-1.5">
                {targets.explanation.map((line) => (
                  <li
                    key={line}
                    className="text-[10.5px] leading-relaxed text-muted"
                  >
                    · {line}
                  </li>
                ))}
              </ul>
            </details>
          </Card>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-pill border border-navy/12 bg-white text-[12px] font-semibold text-muted transition-colors hover:text-navy"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Xoá dữ liệu và làm lại
          </button>
        </div>
      </div>
    </div>
  );
}
