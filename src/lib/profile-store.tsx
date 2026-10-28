"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ProfileInput } from "@/core/types";

const KEY = "healthmate.profile.v1";

export const DEFAULT_PROFILE: ProfileInput = {
  name: "Nam",
  sex: "male",
  age: 32,
  heightCm: 172,
  weightKg: 74,
  activity: "light",
  goal: "lose",
  occupation: "office",
  conditionIds: ["hypertension"],
  drugIds: ["ibuprofen"],
  allergies: [],
};

interface Ctx {
  profile: ProfileInput | null;
  ready: boolean;
  save: (p: ProfileInput) => void;
  reset: () => void;
}

const ProfileContext = createContext<Ctx | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<ProfileInput | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setProfile(JSON.parse(raw) as ProfileInput);
    } catch {
      /* corrupt storage — start fresh */
    }
    setReady(true);
  }, []);

  const save = useCallback((p: ProfileInput) => {
    setProfile(p);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(p));
    } catch {
      /* quota / private mode — keep in memory only */
    }
  }, []);

  const reset = useCallback(() => {
    setProfile(null);
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* noop */
    }
  }, []);

  const value = useMemo(
    () => ({ profile, ready, save, reset }),
    [profile, ready, save, reset],
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used inside ProfileProvider");
  return ctx;
}
