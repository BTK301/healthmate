"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import type {
  ActivityLevel,
  Goal,
  OccupationPreset,
  ProfileInput,
  Sex,
} from "@/core/types";
import {
  ACTIVITY_LABEL,
  OCCUPATION_LABEL,
  goalLabel,
} from "@/core/nutrition/targets";
import { LogoLockup, LogoMark } from "@/components/brand/Logo";
import { DEFAULT_PROFILE } from "@/lib/profile-store";
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

const STEP_TITLES = ["Về bạn", "Chỉ số", "Mục tiêu"];

export function Onboarding({
  onDone,
}: {
  onDone: (profile: ProfileInput) => void;
}) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<ProfileInput>(DEFAULT_PROFILE);

  const patch = <K extends keyof ProfileInput>(
    key: K,
    value: ProfileInput[K],
  ) => setDraft((d) => ({ ...d, [key]: value }));

  const next = () => setStep((s) => Math.min(2, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[560px] flex-col px-5 py-6">
      <div className="flex items-center justify-between">
        <LogoLockup />
        <button
          type="button"
          onClick={() => onDone(DEFAULT_PROFILE)}
          className="inline-flex items-center gap-1.5 rounded-pill border border-navy/12 bg-white/70 px-3 py-1.5 text-[11.5px] font-semibold text-navy transition-colors hover:bg-white"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Dùng dữ liệu mẫu
        </button>
      </div>

      {/* progress */}
      <div className="mt-8 flex items-center gap-2">
        {STEP_TITLES.map((title, i) => (
          <div key={title} className="flex-1">
            <div
              className={cn(
                "h-1 rounded-full transition-colors duration-300",
                i <= step ? "bg-good" : "bg-navy/10",
              )}
            />
            <p
              className={cn(
                "mt-2 text-[10.5px] font-semibold tracking-wide",
                i <= step ? "text-navy" : "text-muted/60",
              )}
            >
              {title}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-1 flex-col justify-center py-8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === 0 ? (
              <div className="space-y-5">
                <h1 className="font-display text-[30px] font-extrabold">
                  Bắt đầu từ tên bạn.
                </h1>
                <label className="block">
                  <span className="text-[12.5px] font-semibold text-muted">
                    Tên gọi
                  </span>
                  <input
                    value={draft.name}
                    onChange={(e) => patch("name", e.target.value)}
                    className="mt-1.5 h-12 w-full rounded-2xl border border-line bg-white px-4 text-[15px] font-medium outline-none focus:border-navy/40"
                    placeholder="Ví dụ: Nam"
                  />
                </label>

                <div>
                  <span className="text-[12.5px] font-semibold text-muted">
                    Giới tính sinh học
                  </span>
                  <div className="mt-1.5 grid grid-cols-2 gap-2">
                    {(["male", "female"] as Sex[]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => patch("sex", s)}
                        className={cn(
                          "h-12 rounded-2xl border text-[14px] font-semibold transition-all",
                          draft.sex === s
                            ? "border-navy bg-navy text-white"
                            : "border-line bg-white text-navy hover:border-navy/30",
                        )}
                      >
                        {s === "male" ? "Nam" : "Nữ"}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] text-muted">
                    Dùng để tính chuyển hoá cơ bản — không dùng cho mục đích khác.
                  </p>
                </div>

                <label className="block">
                  <span className="text-[12.5px] font-semibold text-muted">
                    Tuổi
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={draft.age}
                    onChange={(e) =>
                      patch("age", Number(e.target.value) || 0)
                    }
                    className="mt-1.5 h-12 w-full rounded-2xl border border-line bg-white px-4 text-[15px] font-medium outline-none focus:border-navy/40"
                  />
                </label>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="space-y-5">
                <h1 className="font-display text-[30px] font-extrabold">
                  Chỉ số cơ thể.
                </h1>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-[12.5px] font-semibold text-muted">
                      Chiều cao (cm)
                    </span>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={draft.heightCm}
                      onChange={(e) =>
                        patch("heightCm", Number(e.target.value) || 0)
                      }
                      className="mt-1.5 h-12 w-full rounded-2xl border border-line bg-white px-4 text-[15px] font-medium outline-none focus:border-navy/40"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[12.5px] font-semibold text-muted">
                      Cân nặng (kg)
                    </span>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={draft.weightKg}
                      onChange={(e) =>
                        patch("weightKg", Number(e.target.value) || 0)
                      }
                      className="mt-1.5 h-12 w-full rounded-2xl border border-line bg-white px-4 text-[15px] font-medium outline-none focus:border-navy/40"
                    />
                  </label>
                </div>

                <div>
                  <span className="text-[12.5px] font-semibold text-muted">
                    Công việc của bạn
                  </span>
                  <div className="mt-1.5 space-y-2">
                    {OCCUPATIONS.map((o) => (
                      <button
                        key={o}
                        type="button"
                        onClick={() => patch("occupation", o)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-[13.5px] font-semibold transition-all",
                          draft.occupation === o
                            ? "border-navy bg-navy-soft/60 text-navy"
                            : "border-line bg-white text-navy hover:border-navy/30",
                        )}
                      >
                        {OCCUPATION_LABEL[o]}
                        {draft.occupation === o ? (
                          <Check className="h-4 w-4" />
                        ) : null}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] text-muted">
                    Nghề nghiệp ảnh hưởng đến nhu cầu năng lượng và lịch sinh
                    hoạt được gợi ý.
                  </p>
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-5">
                <h1 className="font-display text-[30px] font-extrabold">
                  Bạn muốn hướng tới đâu?
                </h1>

                <div>
                  <span className="text-[12.5px] font-semibold text-muted">
                    Mức vận động hằng ngày
                  </span>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {ACTIVITIES.map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => patch("activity", a)}
                        className={cn(
                          "rounded-pill border px-3.5 py-2 text-[12.5px] font-semibold transition-all",
                          draft.activity === a
                            ? "border-navy bg-navy text-white"
                            : "border-line bg-white text-navy hover:border-navy/30",
                        )}
                      >
                        {ACTIVITY_LABEL[a]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[12.5px] font-semibold text-muted">
                    Mục tiêu
                  </span>
                  <div className="mt-1.5 grid grid-cols-3 gap-2">
                    {GOALS.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => patch("goal", g)}
                        className={cn(
                          "rounded-2xl border px-2 py-4 text-[12.5px] font-bold transition-all",
                          draft.goal === g
                            ? "border-good bg-good-soft text-good"
                            : "border-line bg-white text-navy hover:border-navy/30",
                        )}
                      >
                        {goalLabel[g]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-canvas/70 p-4">
                  <p className="text-[11.5px] leading-relaxed text-muted">
                    Bước tiếp theo bạn sẽ thêm thuốc đang dùng và bệnh nền. Đây
                    là phần giúp HealthMate đưa ra cảnh báo phù hợp — bạn có thể
                    bỏ qua và thêm sau.
                  </p>
                </div>
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={back}
            className="inline-flex h-12 items-center gap-1.5 rounded-pill border border-navy/12 bg-white px-5 text-[13.5px] font-semibold text-navy"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </button>
        ) : (
          <span className="text-[11.5px] text-muted">
            <LogoMark className="mr-1 inline h-3.5 w-3.5 align-[-2px] text-good" />
            Không cần đăng ký
          </span>
        )}

        <button
          type="button"
          onClick={() => (step === 2 ? onDone(draft) : next())}
          className="ml-auto inline-flex h-12 items-center gap-2 rounded-pill bg-navy px-6 text-[13.5px] font-semibold text-white transition-transform hover:-translate-y-0.5"
        >
          {step === 2 ? "Xem kết quả" : "Tiếp tục"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
