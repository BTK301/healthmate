import type { ProfileInput } from "@/core/types";
import { drugById } from "@/data/drugs";
import { conditionById } from "@/data/conditions";
import { rules } from "@/data/interactions";
import type { ActiveRule, Constraints, Severity } from "./types";

const SEVERITY_ORDER: Record<Severity, number> = {
  warning: 0,
  caution: 1,
  info: 2,
};

/**
 * Deterministic rule evaluation. The LLM is never allowed to invent
 * interactions — it only explains what this function returns.
 */
export function evaluateRules(
  profile: Pick<ProfileInput, "drugIds" | "conditionIds">,
): ActiveRule[] {
  const classes = new Set<string>();
  for (const id of profile.drugIds) {
    for (const c of drugById.get(id)?.classes ?? []) classes.add(c);
  }
  const conditions = new Set(profile.conditionIds);

  const active: ActiveRule[] = [];

  for (const rule of rules) {
    const w = rule.when;

    if (w.drugClasses && !w.drugClasses.some((c) => classes.has(c))) continue;
    if (w.drugIds && !w.drugIds.some((id) => profile.drugIds.includes(id)))
      continue;
    if (w.conditionIds && !w.conditionIds.some((c) => conditions.has(c)))
      continue;
    if (
      w.requiresConditionIds &&
      !w.requiresConditionIds.every((c) => conditions.has(c))
    )
      continue;

    let source = "";
    if (w.drugClasses) {
      const drug = profile.drugIds
        .map((id) => drugById.get(id))
        .find((d) => d?.classes.some((c) => w.drugClasses!.includes(c)));
      source = drug?.name ?? "Thuốc đang dùng";
    } else if (w.conditionIds) {
      source = conditionById.get(w.conditionIds[0] ?? "")?.name ?? "Bệnh nền";
    }

    active.push({ rule, source });
  }

  return active.sort(
    (a, b) =>
      SEVERITY_ORDER[a.rule.severity] - SEVERITY_ORDER[b.rule.severity] ||
      a.rule.title.localeCompare(b.rule.title, "vi"),
  );
}

export function buildConstraints(
  active: ActiveRule[],
  baseSodiumMg = 2000,
): Constraints {
  let sodium = baseSodiumMg;
  const excludeTags = new Set<string>();
  const preferTags = new Set<string>();

  for (const { rule } of active) {
    if (rule.effect.sodiumMgMax) sodium = Math.min(sodium, rule.effect.sodiumMgMax);
    for (const t of rule.effect.excludeTags ?? []) excludeTags.add(t);
    for (const t of rule.effect.preferTags ?? []) preferTags.add(t);
  }

  // a hard exclusion always beats a preference
  for (const t of excludeTags) preferTags.delete(t);

  return { sodiumMgMax: sodium, excludeTags, preferTags };
}
