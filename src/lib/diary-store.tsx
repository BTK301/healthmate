"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { DiaryByDate, DiaryEntry } from "@/core/diary/types";
import {
  addEntry as addEntryPure,
  entriesFor,
  removeEntry as removeEntryPure,
} from "@/core/diary/day";
import { todayKey } from "@/core/diary/types";

const KEY = "healthmate.diary.v1";

interface Ctx {
  byDate: DiaryByDate;
  ready: boolean;
  today: string;
  entries: DiaryEntry[];
  add: (entry: Omit<DiaryEntry, "id" | "loggedAt" | "date">) => void;
  remove: (id: string) => void;
  clearToday: () => void;
}

const DiaryContext = createContext<Ctx | null>(null);

export function DiaryProvider({ children }: { children: React.ReactNode }) {
  const [byDate, setByDate] = useState<DiaryByDate>({});
  const [ready, setReady] = useState(false);
  const [today, setToday] = useState(() => todayKey());

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setByDate(JSON.parse(raw) as DiaryByDate);
    } catch {
      /* corrupt storage — start with an empty diary */
    }
    setToday(todayKey());
    setReady(true);
  }, []);

  const persist = useCallback((next: DiaryByDate) => {
    setByDate(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* quota / private mode — keep in memory */
    }
  }, []);

  const add = useCallback(
    (entry: Omit<DiaryEntry, "id" | "loggedAt" | "date">) => {
      const full: DiaryEntry = {
        ...entry,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        date: todayKey(),
        loggedAt: Date.now(),
      };
      setByDate((prev) => {
        const next = addEntryPure(prev, full);
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

  const remove = useCallback((id: string) => {
    setByDate((prev) => {
      const next = removeEntryPure(prev, todayKey(), id);
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const clearToday = useCallback(() => {
    const key = todayKey();
    setByDate((prev) => {
      const next = { ...prev, [key]: [] };
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const entries = useMemo(() => entriesFor(byDate, today), [byDate, today]);

  const value = useMemo(
    () => ({ byDate, ready, today, entries, add, remove, clearToday }),
    [byDate, ready, today, entries, add, remove, clearToday],
  );

  return (
    <DiaryContext.Provider value={value}>{children}</DiaryContext.Provider>
  );
}

export function useDiary() {
  const ctx = useContext(DiaryContext);
  if (!ctx) throw new Error("useDiary must be used inside DiaryProvider");
  return ctx;
}
