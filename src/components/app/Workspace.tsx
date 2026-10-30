"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Pill, UserRound, UtensilsCrossed } from "lucide-react";
import type { MealPlan, MealSlot, ProfileInput } from "@/core/types";
import { buildPlan, swapMeal } from "@/core/planner/plan";
import { computeTargets } from "@/core/nutrition/targets";
import { buildConstraints, evaluateRules } from "@/core/rules/engine";
import { buildSchedule } from "@/core/schedule/schedule";
import { LogoLockup } from "@/components/brand/Logo";
import { useProfile } from "@/lib/profile-store";
import { useDiary } from "@/lib/diary-store";
import { useMeds } from "@/lib/meds-store";
import { loggedRecipeIds, summarize } from "@/core/diary/day";
import { cn } from "@/lib/cn";
import { Dashboard } from "@/components/app/views/Dashboard";
import { MealPlanView } from "@/components/app/views/MealPlanView";
import { ProfileView } from "@/components/app/views/ProfileView";
import { TreatmentView, type TreatmentTab } from "@/components/app/views/TreatmentView";
import { RoutineCard } from "@/components/app/RoutineCard";
import { CoachPanel } from "@/components/app/CoachPanel";
import { AddFoodSheet } from "@/components/app/AddFoodSheet";

type Tab = "overview" | "treatment" | "meals" | "profile";

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Hôm nay", icon: LayoutDashboard },
  { id: "treatment", label: "Điều trị", icon: Pill },
  { id: "meals", label: "Bữa ăn", icon: UtensilsCrossed },
  { id: "profile", label: "Hồ sơ", icon: UserRound },
];

export function Workspace({ profile }: { profile: ProfileInput }) {
  const { save, reset } = useProfile();
  const { entries, add, remove } = useDiary();
  const { plans, logs, today, addPlan, removePlan, toggleDose, drugIds } =
    useMeds();

  const [tab, setTab] = useState<Tab>("overview");
  const [treatmentTab, setTreatmentTab] = useState<TreatmentTab>("schedule");
  const [seed, setSeed] = useState(7);
  const [addOpen, setAddOpen] = useState(false);

  // The medication schedule is the source of truth for which drugs are active,
  // so the rule engine always reflects what the user actually takes.
  const rulesProfile = useMemo<ProfileInput>(
    () => ({ ...profile, drugIds }),
    [profile, drugIds],
  );

  const targets = useMemo(() => computeTargets(rulesProfile), [rulesProfile]);
  const active = useMemo(() => evaluateRules(rulesProfile), [rulesProfile]);
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

  const summary = useMemo(
    () => summarize(entries, effectiveTarget),
    [entries, effectiveTarget],
  );

  const loggedIds = useMemo(() => loggedRecipeIds(entries), [entries]);

  const routine = useMemo(
    () => buildSchedule({ profile, plan, active, targets: effectiveTarget }),
    [profile, plan, active, effectiveTarget],
  );

  const openTreatment = (sub: TreatmentTab) => {
    setTreatmentTab(sub);
    setTab("treatment");
  };

  const handleSwap = (slot: MealSlot) => {
    const used = new Set(plan.meals.map((m) => m.recipe.id));
    setPlan(
      swapMeal(plan, slot, constraints.excludeTags, constraints.preferTags, used),
    );
  };

  const handleToggleLog = (meal: MealPlan["meals"][number]) => {
    const existing = entries.find(
      (e) =>
        e.source === "recipe" &&
        e.sourceId === meal.recipe.id &&
        e.slot === meal.slot,
    );
    if (existing) {
      remove(existing.id);
      return;
    }
    add({
      slot: meal.slot,
      source: "recipe",
      sourceId: meal.recipe.id,
      name: meal.recipe.name,
      nutrition: meal.nutrition,
    });
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
          <div className="space-y-4">
            <Dashboard
              profile={profile}
              targets={effectiveTarget}
              plan={plan}
              active={active}
              summary={summary}
              entries={entries}
              onRemoveEntry={remove}
              onAddFood={() => setAddOpen(true)}
              onOpenTreatment={openTreatment}
              onOpenMeals={() => setTab("meals")}
            />
            <RoutineCard items={routine} />
          </div>
        ) : null}

        {tab === "treatment" ? (
          <TreatmentView
            key={treatmentTab}
            initialTab={treatmentTab}
            plans={plans}
            logs={logs}
            today={today}
            active={active}
            constraints={constraints}
            onToggle={toggleDose}
            onRemove={removePlan}
            onAdd={addPlan}
          />
        ) : null}

        {tab === "meals" ? (
          <MealPlanView
            plan={plan}
            targets={effectiveTarget}
            onSwap={handleSwap}
            onRegenerate={() => setSeed((s) => s + 1)}
            loggedIds={loggedIds}
            onToggleLog={handleToggleLog}
          />
        ) : null}

        {tab === "profile" ? (
          <ProfileView
            profile={rulesProfile}
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

      <CoachPanel
        ctx={{
          profile: rulesProfile,
          targets: effectiveTarget,
          plan,
          active,
          constraints,
          summary,
        }}
      />

      <AddFoodSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onPick={(item) => add(item)}
      />
    </div>
  );
}
