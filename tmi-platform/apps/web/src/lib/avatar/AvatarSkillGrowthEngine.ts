/**
 * AvatarSkillGrowthEngine
 * Tracks skill development across avatar behavioral domains.
 * Skills grow through safe interaction patterns. Each skill has a cap.
 * No skill grows invisibly — every increment is logged.
 */

export type AvatarSkill =
  | "idle_behavior"
  | "walking"
  | "dancing"
  | "eye_contact"
  | "facial_expressions"
  | "lip_sync"
  | "emotes"
  | "stage_reactions"
  | "crowd_reactions"
  | "host_timing"
  | "outfit_coordination"
  | "room_movement"
  | "camera_awareness"
  | "social_response_timing";

export interface SkillLevel {
  skill: AvatarSkill;
  level: number;       // 1–10
  xp: number;         // within current level
  xpToNext: number;
  unlocked: boolean;
  lastImproved: number;
}

export interface AvatarSkillSheet {
  avatarId: string;
  skills: Record<AvatarSkill, SkillLevel>;
  totalXP: number;
  overallTier: "beginner" | "developing" | "capable" | "skilled" | "expert";
  lastUpdated: number;
}

const SKILLS: AvatarSkill[] = [
  "idle_behavior", "walking", "dancing", "eye_contact", "facial_expressions",
  "lip_sync", "emotes", "stage_reactions", "crowd_reactions", "host_timing",
  "outfit_coordination", "room_movement", "camera_awareness", "social_response_timing",
];

const XP_PER_LEVEL = 100;
const MAX_LEVEL = 10;
const skillStore = new Map<string, AvatarSkillSheet>();

function makeSkillLevel(skill: AvatarSkill): SkillLevel {
  return { skill, level: 1, xp: 0, xpToNext: XP_PER_LEVEL, unlocked: true, lastImproved: 0 };
}

function computeTier(totalXP: number): AvatarSkillSheet["overallTier"] {
  if (totalXP < 200) return "beginner";
  if (totalXP < 600) return "developing";
  if (totalXP < 1200) return "capable";
  if (totalXP < 2400) return "skilled";
  return "expert";
}

export function getSkillSheet(avatarId: string): AvatarSkillSheet {
  const existing = skillStore.get(avatarId);
  if (existing) return existing;
  const skills = Object.fromEntries(SKILLS.map(s => [s, makeSkillLevel(s)])) as Record<AvatarSkill, SkillLevel>;
  const fresh: AvatarSkillSheet = {
    avatarId, skills, totalXP: 0, overallTier: "beginner", lastUpdated: Date.now(),
  };
  skillStore.set(avatarId, fresh);
  return fresh;
}

export function awardSkillXP(
  avatarId: string,
  skill: AvatarSkill,
  xpAmount: number,
  auditReason: string
): { sheet: AvatarSkillSheet; leveled: boolean; newLevel: number } {
  const sheet = getSkillSheet(avatarId);
  const current = sheet.skills[skill];

  if (current.level >= MAX_LEVEL) {
    return { sheet, leveled: false, newLevel: MAX_LEVEL };
  }

  const clampedXP = Math.min(xpAmount, 20);
  let { xp, level } = current;
  xp += clampedXP;
  let leveled = false;

  while (xp >= XP_PER_LEVEL && level < MAX_LEVEL) {
    xp -= XP_PER_LEVEL;
    level += 1;
    leveled = true;
  }

  const updatedSkill: SkillLevel = {
    ...current,
    level,
    xp,
    xpToNext: XP_PER_LEVEL - xp,
    lastImproved: Date.now(),
  };

  const totalXP = sheet.totalXP + clampedXP;
  const next: AvatarSkillSheet = {
    ...sheet,
    skills: { ...sheet.skills, [skill]: updatedSkill },
    totalXP,
    overallTier: computeTier(totalXP),
    lastUpdated: Date.now(),
  };
  skillStore.set(avatarId, next);

  void auditReason; // logged by caller via AvatarEvolutionAuditEngine
  return { sheet: next, leveled, newLevel: level };
}

export function getTopSkills(avatarId: string, count: number): SkillLevel[] {
  const sheet = getSkillSheet(avatarId);
  return Object.values(sheet.skills)
    .sort((a, b) => b.level - a.level || b.xp - a.xp)
    .slice(0, count);
}

export function getAllSkillSheets(): AvatarSkillSheet[] {
  return [...skillStore.values()];
}
