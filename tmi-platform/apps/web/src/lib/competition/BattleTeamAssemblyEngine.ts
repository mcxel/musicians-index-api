/**
 * BattleTeamAssemblyEngine
 * Team and role-slot assembly for solo/duo/group/band/crew battles.
 */

import {
  BattleFormatType,
  BattleRoleSlot,
  battleFormatRulesEngine,
} from "@/lib/competition/BattleFormatRulesEngine";

export interface TeamMember {
  userId: string;
  displayName: string;
  roleSlot: BattleRoleSlot;
}

export interface BattleTeam {
  teamId: string;
  teamName: string;
  members: TeamMember[];
}

export interface TeamAssemblyResult {
  ok: boolean;
  reason?: string;
  slotsRequired: BattleRoleSlot[];
  sideA?: BattleTeam;
  sideB?: BattleTeam;
}

export class BattleTeamAssemblyEngine {
  validateMatchup(format: BattleFormatType, sideA: BattleTeam, sideB: BattleTeam): TeamAssemblyResult {
    const slotsRequired = battleFormatRulesEngine.getTeamConfig(format).roleSlots;

    const aValid = this.validateTeamAgainstSlots(sideA, slotsRequired);
    if (!aValid.ok) return { ok: false, reason: `side-a-${aValid.reason}`, slotsRequired };

    const bValid = this.validateTeamAgainstSlots(sideB, slotsRequired);
    if (!bValid.ok) return { ok: false, reason: `side-b-${bValid.reason}`, slotsRequired };

    return { ok: true, slotsRequired, sideA, sideB };
  }

  getRequiredSlots(format: BattleFormatType): BattleRoleSlot[] {
    return [...battleFormatRulesEngine.getTeamConfig(format).roleSlots];
  }

  private validateTeamAgainstSlots(team: BattleTeam, required: BattleRoleSlot[]): { ok: boolean; reason?: string } {
    if (team.members.length < required.length) {
      return { ok: false, reason: "insufficient-members" };
    }

    const provided = new Set(team.members.map((m) => m.roleSlot));
    const missing = required.filter((slot) => !provided.has(slot));
    if (missing.length > 0) {
      return { ok: false, reason: `missing-slot-${missing.join("-")}` };
    }

    return { ok: true };
  }
}

export const battleTeamAssemblyEngine = new BattleTeamAssemblyEngine();
