/**
 * AI Music Challenge integrity — AI-generated work only in the AI MUSIC CHALLENGE lane.
 * Using AI work against a human in a normal (human) challenge = cheating.
 * Wires CompetitionIntegrityEngine + FanRubric score penalty + audit flag.
 */

import {
  createDefaultIntegrityProfile,
  processEventOutcome,
  type CompetitorIntegrityProfile,
} from "@/lib/competition/CompetitionIntegrityEngine";
import { isAiMusicChallengeLane, type ChallengeLaneId } from "@/lib/challenge/ChallengeDefinition";
import { applyRubricPointPenalty } from "@/lib/voting/FanRubricVotingEngine";

export const AI_MUSIC_CHALLENGE_BADGE = "AI MUSIC CHALLENGE";

/** FanRubric / scoring point deduction when AI work is used in a human lane. */
export const AI_CHEAT_RUBRIC_PENALTY = 2;

/** CIR integrity hit for presenting AI work as human. */
export const AI_CHEAT_INTEGRITY_PENALTY = 20;

export type AiWorkDeclaration = {
  workId: string;
  madeWithAi: boolean;
  /** Optional tool tag: suno | udio | other */
  aiTool?: string | null;
};

export type AiCheatAuditEntry = {
  id: string;
  at: number;
  roomId: string;
  matchId: string;
  userId: string;
  workId: string;
  challengeLane: string;
  reason: "AI_WORK_IN_HUMAN_CHALLENGE";
  rubricPenalty: number;
  integrityPenalty: number;
  disputeOpen: boolean;
  status: "FLAGGED" | "DISPUTED" | "RESOLVED_UPHELD" | "RESOLVED_CLEARED";
};

const auditLog: AiCheatAuditEntry[] = [];

export function isAiTaggedWork(input: {
  madeWithAi?: boolean;
  type?: string | null;
  tags?: string[] | null;
}): boolean {
  if (input.madeWithAi) return true;
  const t = (input.type ?? "").toLowerCase();
  if (t.startsWith("ai_") || t === "ai_songs" || t === "ai_beats") return true;
  const tags = input.tags ?? [];
  return tags.some((tag) => {
    const x = tag.toLowerCase();
    return x === "ai" || x === "ai_music" || x === "suno" || x === "udio" || x.includes("ai-generated");
  });
}

/**
 * AI work may only compete inside the AI Music Challenge lane.
 * Human lanes (including Song Challenge) forbid AI vs human.
 */
export function assertAiWorkAllowedInLane(input: {
  challengeLane: ChallengeLaneId | string;
  workIsAi: boolean;
  opponentIsHuman?: boolean;
}): { ok: true } | { ok: false; code: "AI_IN_HUMAN_CHALLENGE"; message: string } {
  if (!input.workIsAi) return { ok: true };
  if (isAiMusicChallengeLane(input.challengeLane)) return { ok: true };
  return {
    ok: false,
    code: "AI_IN_HUMAN_CHALLENGE",
    message:
      "AI-generated work is only allowed in AI MUSIC CHALLENGE. Using AI work against a human in a normal challenge is forbidden.",
  };
}

export function applyAiCheatPenalties(input: {
  userId: string;
  roomId: string;
  matchId: string;
  workId: string;
  challengeLane: string;
  integrityProfile?: CompetitorIntegrityProfile;
}): {
  integrity: CompetitorIntegrityProfile;
  rubricPenalty: number;
  audit: AiCheatAuditEntry;
} {
  const base = input.integrityProfile ?? createDefaultIntegrityProfile(input.userId);
  const integrity = processEventOutcome(base, "AI_WORK_AS_HUMAN");
  applyRubricPointPenalty(input.userId, AI_CHEAT_RUBRIC_PENALTY, "AI_WORK_IN_HUMAN_CHALLENGE");
  const audit: AiCheatAuditEntry = {
    id: `ai-cheat-${Date.now()}-${input.userId}`,
    at: Date.now(),
    roomId: input.roomId,
    matchId: input.matchId,
    userId: input.userId,
    workId: input.workId,
    challengeLane: input.challengeLane,
    reason: "AI_WORK_IN_HUMAN_CHALLENGE",
    rubricPenalty: AI_CHEAT_RUBRIC_PENALTY,
    integrityPenalty: AI_CHEAT_INTEGRITY_PENALTY,
    disputeOpen: true,
    status: "FLAGGED",
  };
  auditLog.unshift(audit);
  if (auditLog.length > 200) auditLog.pop();
  return { integrity, rubricPenalty: AI_CHEAT_RUBRIC_PENALTY, audit };
}

export function openAiCheatDispute(auditId: string): AiCheatAuditEntry | null {
  const entry = auditLog.find((a) => a.id === auditId);
  if (!entry) return null;
  entry.disputeOpen = true;
  entry.status = "DISPUTED";
  return { ...entry };
}

export function resolveAiCheatDispute(
  auditId: string,
  upheld: boolean,
): AiCheatAuditEntry | null {
  const entry = auditLog.find((a) => a.id === auditId);
  if (!entry) return null;
  entry.disputeOpen = false;
  entry.status = upheld ? "RESOLVED_UPHELD" : "RESOLVED_CLEARED";
  return { ...entry };
}

export function listAiCheatAudits(limit = 50): AiCheatAuditEntry[] {
  return auditLog.slice(0, Math.max(1, limit)).map((a) => ({ ...a }));
}

/**
 * Validate a challenge submit declaration.
 * Human lane + Made with AI → reject / flag path (caller applies penalties).
 */
export function validateChallengeWorkDeclaration(input: {
  challengeLane: ChallengeLaneId | string;
  declaration: AiWorkDeclaration;
}): {
  ok: boolean;
  allowSubmit: boolean;
  shouldFlag: boolean;
  message: string;
} {
  const ai = input.declaration.madeWithAi;
  const gate = assertAiWorkAllowedInLane({
    challengeLane: input.challengeLane,
    workIsAi: ai,
    opponentIsHuman: true,
  });
  if (gate.ok) {
    return {
      ok: true,
      allowSubmit: true,
      shouldFlag: false,
      message: isAiMusicChallengeLane(input.challengeLane)
        ? "AI MUSIC CHALLENGE — AI-tagged works accepted."
        : "Human challenge — work accepted.",
    };
  }
  return {
    ok: false,
    allowSubmit: false,
    shouldFlag: true,
    message: gate.message,
  };
}
