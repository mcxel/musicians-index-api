/**
 * JudgingCriteriaRegistry — versioned reusable criteria templates.
 * Reuses FanRubricVotingEngine DEFAULT_RUBRIC_CRITERIA; does not create a second scoring engine.
 * Bots may propose templates; only admin/host publish locks them onto a vote session.
 */

import { DEFAULT_RUBRIC_CRITERIA } from "@/lib/voting/FanRubricVotingEngine";

export type JudgingCriterionDef = {
  id: string;
  label: string;
  /** 1–5 default scale unless overridden */
  scaleMin: number;
  scaleMax: number;
  instruction: string;
  weightPercent: number;
};

export type JudgingCriteriaTemplate = {
  templateId: string;
  version: number;
  name: string;
  description: string;
  criteria: JudgingCriterionDef[];
  /** Sum of weightPercent must equal 100 when locked */
  locked: boolean;
  source: "SYSTEM" | "HOST" | "ADMIN" | "BOT_PROPOSED";
};

export type LockedCriteriaRuleset = {
  rulesetId: string;
  templateId: string;
  version: number;
  criteria: JudgingCriterionDef[];
  lockedAt: number;
  lockedBy: string;
};

const SYSTEM_TEMPLATES: JudgingCriteriaTemplate[] = [
  {
    templateId: "quick_vote_binary",
    version: 1,
    name: "Quick Vote (A/B)",
    description: "Simple two-choice audience vote. No multi-criterion scoring.",
    criteria: [],
    locked: true,
    source: "SYSTEM",
  },
  {
    templateId: "fan_rubric_default",
    version: 1,
    name: "Fan Rubric (Default)",
    description: "Standard fan judging rubric used by battles / gauntlet / challenges.",
    criteria: DEFAULT_RUBRIC_CRITERIA.map((c, i, arr) => ({
      id: c.id,
      label: c.label,
      scaleMin: 1,
      scaleMax: 5,
      instruction: `Score ${c.label} from 1 (weak) to 5 (excellent).`,
      weightPercent: Math.floor(100 / arr.length) + (i < 100 % arr.length ? 1 : 0),
    })),
    locked: true,
    source: "SYSTEM",
  },
  {
    templateId: "performance_core_5",
    version: 1,
    name: "Performance Core 5",
    description: "Delivery, originality, stage presence, musicality, crowd connection.",
    criteria: [
      { id: "delivery", label: "Delivery", scaleMin: 1, scaleMax: 5, instruction: "Score delivery 1–5.", weightPercent: 20 },
      { id: "originality", label: "Originality", scaleMin: 1, scaleMax: 5, instruction: "Score originality 1–5.", weightPercent: 20 },
      { id: "stage_presence", label: "Stage Presence", scaleMin: 1, scaleMax: 5, instruction: "Score stage presence 1–5.", weightPercent: 20 },
      { id: "musicality", label: "Musicality", scaleMin: 1, scaleMax: 5, instruction: "Score musicality 1–5.", weightPercent: 20 },
      { id: "crowd_connection", label: "Crowd Connection", scaleMin: 1, scaleMax: 5, instruction: "Score crowd connection 1–5.", weightPercent: 20 },
    ],
    locked: true,
    source: "SYSTEM",
  },
];

const hostCustom = new Map<string, JudgingCriteriaTemplate>();

export function listJudgingTemplates(): JudgingCriteriaTemplate[] {
  return [...SYSTEM_TEMPLATES, ...hostCustom.values()];
}

export function getJudgingTemplate(templateId: string): JudgingCriteriaTemplate | undefined {
  return listJudgingTemplates().find((t) => t.templateId === templateId);
}

export function validateCriteriaWeights(criteria: JudgingCriterionDef[]): {
  ok: boolean;
  reason?: string;
} {
  if (criteria.length === 0) return { ok: true };
  for (const c of criteria) {
    if (c.scaleMin >= c.scaleMax) {
      return { ok: false, reason: `INVALID_SCALE:${c.id}` };
    }
    if (c.weightPercent < 0) {
      return { ok: false, reason: `NEGATIVE_WEIGHT:${c.id}` };
    }
  }
  const sum = criteria.reduce((acc, c) => acc + c.weightPercent, 0);
  if (sum !== 100) {
    return { ok: false, reason: `WEIGHT_SUM_MUST_BE_100:got_${sum}` };
  }
  return { ok: true };
}

/**
 * Lock a ruleset onto a vote/contest session. After lock, criteria must not change.
 */
export function lockCriteriaRuleset(input: {
  templateId: string;
  lockedBy: string;
  customCriteria?: JudgingCriterionDef[];
}): { ok: true; ruleset: LockedCriteriaRuleset } | { ok: false; reason: string } {
  const template = getJudgingTemplate(input.templateId);
  if (!template && !input.customCriteria) {
    return { ok: false, reason: "TEMPLATE_NOT_FOUND" };
  }
  const criteria = input.customCriteria ?? template!.criteria;
  const weightCheck = validateCriteriaWeights(criteria);
  if (!weightCheck.ok) return { ok: false, reason: weightCheck.reason ?? "INVALID_WEIGHTS" };

  const ruleset: LockedCriteriaRuleset = {
    rulesetId: `ruleset_${input.templateId}_v${template?.version ?? 1}_${Date.now()}`,
    templateId: input.templateId,
    version: template?.version ?? 1,
    criteria: criteria.map((c) => ({ ...c })),
    lockedAt: Date.now(),
    lockedBy: input.lockedBy,
  };
  return { ok: true, ruleset };
}

export function proposeBotCriteriaTemplate(input: {
  name: string;
  description: string;
  criteria: JudgingCriterionDef[];
  proposedByBotId: string;
}): { ok: true; template: JudgingCriteriaTemplate } | { ok: false; reason: string } {
  const weightCheck = validateCriteriaWeights(input.criteria);
  if (!weightCheck.ok) return { ok: false, reason: weightCheck.reason ?? "INVALID_WEIGHTS" };
  const template: JudgingCriteriaTemplate = {
    templateId: `bot_proposed_${input.proposedByBotId}_${Date.now()}`,
    version: 1,
    name: input.name,
    description: `${input.description} [BOT_PROPOSED — not active until host/admin publishes]`,
    criteria: input.criteria,
    locked: false,
    source: "BOT_PROPOSED",
  };
  hostCustom.set(template.templateId, template);
  return { ok: true, template };
}

/** Publish a bot-proposed or host-draft template (explicit human action only). */
export function publishCriteriaTemplate(
  templateId: string,
  publishedBy: string,
): { ok: true; template: JudgingCriteriaTemplate } | { ok: false; reason: string } {
  const t = hostCustom.get(templateId) ?? getJudgingTemplate(templateId);
  if (!t) return { ok: false, reason: "TEMPLATE_NOT_FOUND" };
  if (t.source === "SYSTEM") return { ok: true, template: t };
  const published: JudgingCriteriaTemplate = {
    ...t,
    locked: true,
    source: "ADMIN",
    description: `${t.description} · publishedBy=${publishedBy}`,
  };
  hostCustom.set(published.templateId, published);
  return { ok: true, template: published };
}
