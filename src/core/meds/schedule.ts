import type { Dose, DoseLog, MedicationPlan } from "./types";
import { doseId } from "./types";

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

export function sortTimes(times: string[]): string[] {
  return [...new Set(times)].sort((a, b) => toMinutes(a) - toMinutes(b));
}

/** Plans that are active on a given day (start ≤ date ≤ end). */
export function activePlans(plans: MedicationPlan[], date: string): MedicationPlan[] {
  return plans.filter((p) => {
    if (p.startDate > date) return false;
    if (p.endDate && p.endDate < date) return false;
    return true;
  });
}

/** All doses for one day, chronological, with taken/overdue state. */
export function dosesForDate(
  plans: MedicationPlan[],
  logs: DoseLog[],
  date: string,
  now = new Date(),
): Dose[] {
  const takenMap = new Map(logs.filter((l) => l.date === date).map((l) => [l.id, l]));
  const today = date === `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, "0")}-${`${now.getDate()}`.padStart(2, "0")}`;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const doses: Dose[] = [];
  for (const plan of activePlans(plans, date)) {
    for (const time of plan.times) {
      const id = doseId(plan.id, date, time);
      const log = takenMap.get(id);
      const minutes = toMinutes(time);
      doses.push({
        id,
        plan,
        date,
        time,
        taken: Boolean(log),
        takenAt: log?.takenAt,
        overdue: today && !log && minutes < nowMinutes - 30,
        upcoming: today && !log && minutes >= nowMinutes,
      });
    }
  }

  return doses.sort((a, b) => toMinutes(a.time) - toMinutes(b.time));
}

export interface AdherenceStats {
  taken: number;
  total: number;
  /** 0..1 */
  rate: number;
  streakDays: number;
}

/** Adherence over the last `days` days, ending today. */
export function adherence(
  plans: MedicationPlan[],
  logs: DoseLog[],
  days = 7,
  now = new Date(),
): AdherenceStats {
  let taken = 0;
  let total = 0;
  const perDay: { date: string; ok: boolean; any: boolean }[] = [];

  for (let i = 0; i < days; i += 1) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}-${`${d.getDate()}`.padStart(2, "0")}`;
    const dayDoses = dosesForDate(plans, logs, key, now);
    const dayTaken = dayDoses.filter((x) => x.taken).length;
    taken += dayTaken;
    total += dayDoses.length;
    perDay.push({ date: key, ok: dayDoses.length > 0 && dayTaken === dayDoses.length, any: dayDoses.length > 0 });
  }

  let streak = 0;
  for (const day of perDay) {
    if (!day.any) break;
    if (day.ok) streak += 1;
    else break;
  }

  return {
    taken,
    total,
    rate: total > 0 ? taken / total : 0,
    streakDays: streak,
  };
}

/** The next dose still to take today, if any. */
export function nextDose(doses: Dose[], now = new Date()): Dose | undefined {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return (
    doses.find((d) => !d.taken && toMinutes(d.time) >= nowMinutes) ??
    doses.find((d) => !d.taken)
  );
}

/** Format "08:00" → "8:00" for display. */
export function prettyTime(hhmm: string) {
  const [h, m] = hhmm.split(":");
  return `${Number(h)}:${m}`;
}
