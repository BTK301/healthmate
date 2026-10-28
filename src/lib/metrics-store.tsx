"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { WeightEntry } from "@/core/metrics/weight";
import {
  addWeight as addWeightPure,
  normalize,
  removeSampleEntries,
  sampleHistory,
} from "@/core/metrics/weight";

const KEY = "healthmate.weights.v1";

interface Ctx {
  entries: WeightEntry[];
  ready: boolean;
  add: (weightKg: number, date?: string) => void;
  clearSamples: () => void;
}

const MetricsContext = createContext<Ctx | null>(null);

export function MetricsProvider({
  children,
  seedWeight = 74,
}: {
  children: React.ReactNode;
  seedWeight?: number;
}) {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        setEntries(normalize(JSON.parse(raw) as WeightEntry[]));
      } else {
        // first run: provide demo history so the chart is not empty
        const seeded = sampleHistory(seedWeight);
        setEntries(seeded);
        window.localStorage.setItem(KEY, JSON.stringify(seeded));
      }
    } catch {
      /* corrupt storage — start empty */
    }
    setReady(true);
    // seedWeight only matters on the very first run
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = useCallback((next: WeightEntry[]) => {
    setEntries(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* quota / private mode */
    }
  }, []);

  const add = useCallback(
    (weightKg: number, date?: string) => {
      setEntries((prev) => {
        const next = addWeightPure(prev, {
          date: date ?? new Date().toISOString().slice(0, 10),
          weightKg,
        });
        try {
          window.localStorage.setItem(KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [],
  );

  const clearSamples = useCallback(() => {
    setEntries((prev) => {
      const next = removeSampleEntries(prev);
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ entries, ready, add, clearSamples }),
    [entries, ready, add, clearSamples],
  );

  return (
    <MetricsContext.Provider value={value}>{children}</MetricsContext.Provider>
  );
}

export function useMetrics() {
  const ctx = useContext(MetricsContext);
  if (!ctx) throw new Error("useMetrics must be used inside MetricsProvider");
  return ctx;
}
