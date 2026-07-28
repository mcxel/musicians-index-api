/**
 * EOS Role Registry — experience access by workspace role (Rule 26).
 * LIVE_SHOWCASE (Monday Night Stage broadcast profile) is allowed for all workspace roles.
 */

import type { EosRole, ExperienceDefinition } from "@/core/eos/types";
import { getExperiencesForRole } from "./ExperienceRegistry";

export interface RoleWorkspaceDefinition {
  id: EosRole;
  displayName: string;
  dashboardLabel: string;
  accentColor: string;
  allowedExperienceCategories: string[];
}

export const ROLE_REGISTRY: Record<EosRole, RoleWorkspaceDefinition> = {
  fan: {
    id: "fan",
    displayName: "Fan",
    dashboardLabel: "FAN HQ",
    accentColor: "#00FF88",
    allowedExperienceCategories: [
      "BATTLE",
      "CHALLENGE",
      "CYPHER",
      "LOUNGE",
      "DANCE_PARTY",
      "FAN_LOBBY",
      "GAME_SHOW",
      "STAGE_SHOW",
      "LIVE_SHOWCASE",
      "CONCERT",
      "LISTENING",
      "TEST",
    ],
  },
  performer: {
    id: "performer",
    displayName: "Performer",
    dashboardLabel: "PERFORMER STUDIO",
    accentColor: "#AA2DFF",
    allowedExperienceCategories: [
      "BATTLE",
      "CHALLENGE",
      "CYPHER",
      "LOUNGE",
      "DANCE_PARTY",
      "GAME_SHOW",
      "STAGE_SHOW",
      "LIVE_SHOWCASE",
      "CONCERT",
      "LISTENING",
      "TEST",
    ],
  },
  admin: {
    id: "admin",
    displayName: "Admin",
    dashboardLabel: "ADMIN OBSERVATORY",
    accentColor: "#FFD700",
    allowedExperienceCategories: [
      "BATTLE",
      "CHALLENGE",
      "CYPHER",
      "LOUNGE",
      "DANCE_PARTY",
      "FAN_LOBBY",
      "GAME_SHOW",
      "STAGE_SHOW",
      "LIVE_SHOWCASE",
      "CONCERT",
      "LISTENING",
      "TEST",
    ],
  },
};

export function canAccessExperience(role: EosRole, experience: ExperienceDefinition): boolean {
  // ExperienceRegistry.permissions is the authority (registry-first).
  // Category lists guide discovery; unknown/new categories must not hard-block
  // if the experience explicitly grants this role.
  const workspace = ROLE_REGISTRY[role];
  const categoryListed = workspace.allowedExperienceCategories.includes(experience.category);
  const broadcastAliasOk =
    experience.category === "LIVE_SHOWCASE" &&
    workspace.allowedExperienceCategories.includes("STAGE_SHOW");

  if (!categoryListed && !broadcastAliasOk) {
    // Soft-allow when the experience itself grants this role — prevents boot hangs
    // when a new category lands before RoleRegistry is updated.
    const granted =
      role === "fan"
        ? experience.permissions.fan
        : role === "performer"
          ? experience.permissions.performer
          : experience.permissions.admin;
    if (!granted) return false;
    return true;
  }

  if (role === "fan") return experience.permissions.fan;
  if (role === "performer") return experience.permissions.performer;
  return experience.permissions.admin;
}

export function getAccessibleExperiences(role: EosRole): ExperienceDefinition[] {
  return getExperiencesForRole(role).filter((exp) => canAccessExperience(role, exp));
}

export function sessionRoleToEosRole(sessionRole: string): EosRole {
  const r = sessionRole.toUpperCase();
  if (r === "ADMIN" || r === "SUPERADMIN" || r === "STAFF") return "admin";
  if (
    r === "PERFORMER" ||
    r === "ARTIST" ||
    r === "BAND" ||
    r === "VENUE" ||
    r === "PROMOTER"
  ) {
    return "performer";
  }
  return "fan";
}
