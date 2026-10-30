"use client";

import { useState } from "react";
import { CalendarCheck, ShieldAlert } from "lucide-react";
import type { ActiveRule, Constraints } from "@/core/rules/types";
import type { DoseLog, MedicationPlan } from "@/core/meds/types";
import { MedsView } from "@/components/app/views/MedsView";
import { AlertsView } from "@/components/app/views/AlertsView";
import { cn } from "@/lib/cn";

export type TreatmentTab = "schedule" | "interactions";

export function TreatmentView({
  initialTab = "schedule",
  plans,
  logs,
  today,
  active,
  constraints,
  onToggle,
  onRemove,
  onAdd,
}: {
  initialTab?: TreatmentTab;
  plans: MedicationPlan[];
  logs: DoseLog[];
  today: string;
  active: ActiveRule[];
  constraints: Constraints;
  onToggle: (doseId: string, planId: string, date: string, time: string) => void;
  onRemove: (planId: string) => void;
  onAdd: (plan: Omit<MedicationPlan, "id" | "createdAt">) => void;
}) {
  const [tab, setTab] = useState<TreatmentTab>(initialTab);

  const tabs = [
    { id: "schedule" as const, label: "Lịch uống", icon: CalendarCheck },
    { id: "interactions" as const, label: "Tương tác", icon: ShieldAlert },
  ];

  return (
    <div className="space-y-4">
      <div
        role="tablist"
        aria-label="Điều trị"
        className="inline-flex items-center gap-1 rounded-pill border border-white/70 bg-white/70 p-1"
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-pill px-3.5 py-2 text-[12px] font-semibold transition-colors",
              tab === t.id ? "bg-navy text-white" : "text-muted hover:text-navy",
            )}
          >
            <t.icon className="h-3.5 w-3.5" strokeWidth={2.3} />
            {t.label}
            {t.id === "interactions" && active.length > 0 ? (
              <span
                className={cn(
                  "tabular ml-0.5 rounded-full px-1.5 py-0.5 text-[9.5px] font-bold",
                  tab === t.id ? "bg-white/20 text-white" : "bg-danger/10 text-danger",
                )}
              >
                {active.length}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {tab === "schedule" ? (
        <MedsView
          plans={plans}
          logs={logs}
          today={today}
          active={active}
          onToggle={onToggle}
          onRemove={onRemove}
          onAdd={onAdd}
        />
      ) : (
        <AlertsView active={active} constraints={constraints} />
      )}
    </div>
  );
}
