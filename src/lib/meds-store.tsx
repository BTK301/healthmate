"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { DoseLog, MedicationPlan } from "@/core/meds/types";
import { dateKey, doseId } from "@/core/meds/types";
import { dosesForDate, sortTimes } from "@/core/meds/schedule";

const PLANS_KEY = "healthmate.meds.v1";
const LOGS_KEY = "healthmate.doses.v1";

interface Ctx {
  plans: MedicationPlan[];
  logs: DoseLog[];
  ready: boolean;
  today: string;
  addPlan: (plan: Omit<MedicationPlan, "id" | "createdAt">) => void;
  removePlan: (id: string) => void;
  toggleDose: (doseId: string, planId: string, date: string, time: string) => void;
  drugIds: string[];
}

const MedsContext = createContext<Ctx | null>(null);

function seedPlans(drugIds: string[]): MedicationPlan[] {
  const now = Date.now();
  return drugIds.map((drugId, i) => ({
    id: `seed-${drugId}-${i}`,
    drugId,
    doseText: "1 viên",
    times: ["08:00"],
    startDate: dateKey(),
    endDate: null,
    foodTiming: "after",
    createdAt: now + i,
  }));
}

export function MedsProvider({
  children,
  seedDrugIds = [],
}: {
  children: React.ReactNode;
  seedDrugIds?: string[];
}) {
  const [plans, setPlans] = useState<MedicationPlan[]>([]);
  const [logs, setLogs] = useState<DoseLog[]>([]);
  const [ready, setReady] = useState(false);
  const [today, setToday] = useState(() => dateKey());

  useEffect(() => {
    try {
      const rawPlans = window.localStorage.getItem(PLANS_KEY);
      const rawLogs = window.localStorage.getItem(LOGS_KEY);
      setLogs(rawLogs ? (JSON.parse(rawLogs) as DoseLog[]) : []);

      if (rawPlans) {
        setPlans(JSON.parse(rawPlans) as MedicationPlan[]);
      } else {
        // first run: turn the drugs already on the profile into a schedule
        const seeded = seedPlans(seedDrugIds);
        setPlans(seeded);
        window.localStorage.setItem(PLANS_KEY, JSON.stringify(seeded));
      }
    } catch {
      /* corrupt storage — start empty */
    }
    setToday(dateKey());
    setReady(true);
    // seed only matters on the very first run
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistPlans = useCallback((next: MedicationPlan[]) => {
    setPlans(next);
    try {
      window.localStorage.setItem(PLANS_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const persistLogs = useCallback((next: DoseLog[]) => {
    setLogs(next);
    try {
      window.localStorage.setItem(LOGS_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const addPlan = useCallback(
    (plan: Omit<MedicationPlan, "id" | "createdAt">) => {
      setPlans((prev) => {
        const next = [
          ...prev,
          {
            ...plan,
            times: sortTimes(plan.times),
            id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            createdAt: Date.now(),
          },
        ];
        try {
          window.localStorage.setItem(PLANS_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [],
  );

  const removePlan = useCallback((id: string) => {
    setPlans((prev) => {
      const next = prev.filter((p) => p.id !== id);
      try {
        window.localStorage.setItem(PLANS_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const toggleDose = useCallback(
    (id: string, planId: string, date: string, time: string) => {
      setLogs((prev) => {
        const exists = prev.some((l) => l.id === id);
        const next = exists
          ? prev.filter((l) => l.id !== id)
          : [...prev, { id, planId, date, time, takenAt: Date.now() }];
        try {
          window.localStorage.setItem(LOGS_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [],
  );

  const drugIds = useMemo(
    () => [...new Set(plans.map((p) => p.drugId))],
    [plans],
  );

  const value = useMemo(
    () => ({
      plans,
      logs,
      ready,
      today,
      addPlan,
      removePlan,
      toggleDose,
      drugIds,
    }),
    [plans, logs, ready, today, addPlan, removePlan, toggleDose, drugIds],
  );

  return <MedsContext.Provider value={value}>{children}</MedsContext.Provider>;
}

export function useMeds() {
  const ctx = useContext(MedsContext);
  if (!ctx) throw new Error("useMeds must be used inside MedsProvider");
  return ctx;
}

export { dosesForDate, doseId };
