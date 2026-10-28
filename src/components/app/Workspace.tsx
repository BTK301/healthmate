"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  LayoutDashboard,
  ShieldAlert,
  UserRound,
  UtensilsCrossed,
} from "lucide-react";
import type { MealPlan, MealSlot, ProfileInput } from "@/core/types";
import { buildPlan, swapMeal } from "@/core/planner/plan";
import { computeTargets } from "@/core/nutrition/targets";
import { buildConstraints, evaluateRules } from "@/core/rules/engine";
import { LogoLockup, BrandCorner } from "@/components/brand/Logo";
import { useProfile } from "@/lib/profile-store";
import { cn } from "@/lib/cn";
import { Dashboard } from "@/components/app/views/Dashboard";
import { MealPlanView } from "@/components/app/views/MealPlanView";
import { AlertsView } from "@/components/app/views/AlertsView";
import { ProfileView } from "@/components/app/views/ProfileView";
import { ScheduleView } from "@/components/app/views/ScheduleView";
import { CoachPanel } from "@/components/app/CoachPanel";
import { buildSchedule } from "@/core/schedule/schedule";

type Tab = "overview" | "plan" | "schedule" | "alerts" | "profile";

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Tổng quan", icon: LayoutDashboard },
  { id: "plan", label: "Thực đơn", icon: UtensilsCrossed },
  { id: "schedule", label: "Lịch", icon: CalendarClock },
  { id: "alerts", label: "Cảnh báo", icon: ShieldAlert },
  { id: "profile", label: "Hồ sơ", icon: UserRound },
];

export function Workspace({ profile }: { profile: ProfileInput }) {
  const { save, reset } = useProfile();
  const [tab, setTab] = useState<Tab>("overview");
  const [seed, setSeed] = useState(7);

  const targets = useMemo(() => computeTargets(profile), [profile]);
  const active = useMemo(() => evaluateRules(profile), [profile]);
  const constraints = useMemo(
    () => buildConstraints(active, targets.sodiumMg),
    [active, targets],
  );
  const effectiveTarget = useMemo(
    () => ({ ...targets, sodiumMg: constraints.sodiumMgMax }),
    [targets, constraints],
  );

  const generated = useMemo(
    () =>
      buildPlan({
        target: effectiveTarget,
        excludeTags: constraints.excludeTags,
        preferTags: constraints.preferTags,
        seed,
      }),
    [effectiveTarget, constraints, seed],
  );

  const [plan, setPlan] = useState<MealPlan>(generated);

  useEffect(() => setPlan(generated), [generated]);

  const handleSwap = (slot: MealSlot) => {
    const used = new Set(plan.meals.map((m) => m.recipe.id));
    setPlan(
      swapMeal(plan, slot, constraints.excludeTags, constraints.preferTags, used),
    );
  };

  return (
    <div className="min-h-dvh pb-24 sm:pb-10">
      <header className="sticky top-0 z-30 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1080px] items-center gap-3 px-5 py-3">
          <Link href="/" aria-label="Về trang chủ">
            <LogoLockup />
          </Link>

          <nav
            aria-label="Điều hướng chính"
            className="ml-auto hidden items-center gap-1 rounded-pill border border-white/70 bg-white/70 p-1 sm:flex"
          >
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                aria-current={tab === t.id}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-pill px-3.5 py-2 text-[12px] font-semibold transition-colors",
                  tab === t.id
                    ? "bg-navy text-white"
                    : "text-muted hover:text-navy",
                )}
              >
                <t.icon className="h-3.5 w-3.5" strokeWidth={2.3} />
                {t.label}
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:ml-0">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-navy text-[12px] font-bold text-white">
              {profile.name.trim().charAt(0).toUpperCase() || "H"}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1080px] px-5 pt-3">
        {tab === "overview" ? (
          <Dashboard
            profile={profile}
            targets={effectiveTarget}
            plan={plan}
            active={active}
            onTab={(t) => setTab(t)}
          />
        ) : null}

        {tab === "plan" ? (
          <MealPlanView
            plan={plan}
            targets={effectiveTarget}
            onSwap={handleSwap}
            onRegenerate={() => setSeed((s) => s + 1)}
          />
        ) : null}

        {tab === "alerts" ? (
          <AlertsView active={active} constraints={constraints} />
        ) : null}

        {tab === "schedule" ? (
          <ScheduleView
            items={buildSchedule({
              profile,
              plan,
              active,
              targets: effectiveTarget,
            })}
            profile={profile}
          />
        ) : null}

        {tab === "profile" ? (
          <ProfileView
            profile={profile}
            targets={targets}
            onChange={save}
            onReset={reset}
          />
        ) : null}
      </main>

      {/* mobile dock */}
      <nav
        aria-label="Điều hướng di động"
        className="fixed inset-x-3 bottom-3 z-30 sm:hidden"
      >
        <div className="flex items-center justify-between rounded-[22px] border border-white/80 bg-white/90 px-1 py-1.5 shadow-float backdrop-blur-md">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-current={tab === t.id}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-[15px] py-1.5 text-[10px] font-semibold transition-colors",
                tab === t.id ? "bg-navy text-white" : "text-muted",
              )}
            >
              <t.icon className="h-4 w-4" strokeWidth={2.2} />
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <BrandCorner className="hidden sm:block" />

      <CoachPanel
        ctx={{
          profile,
          targets: effectiveTarget,
          plan,
          active,
          constraints,
        }}
      />
    </div>
  );
}
