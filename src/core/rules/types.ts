import type { DrugClass } from "@/data/drugs";

export type Severity = "info" | "caution" | "warning";
export type Evidence = "A" | "B" | "C" | "D";

export interface Rule {
  id: string;
  title: string;
  severity: Severity;
  evidence: Evidence;
  /**
   * Every present key must match (AND). Values inside a key are OR.
   */
  when: {
    drugClasses?: DrugClass[];
    drugIds?: string[];
    conditionIds?: string[];
    requiresConditionIds?: string[];
  };
  effect: {
    sodiumMgMax?: number;
    excludeTags?: string[];
    preferTags?: string[];
    advice: string;
    lifestyle: string[];
    citation: string;
  };
}

export interface ActiveRule {
  rule: Rule;
  /** what triggered it, for the UI ("Ibuprofen") */
  source: string;
}

export interface Constraints {
  sodiumMgMax: number;
  excludeTags: Set<string>;
  preferTags: Set<string>;
}
