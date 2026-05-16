/**
 * BattleTeamAssemblyEngine
 * Team and role-slot assembly for solo/duo/group/band/crew battles.
 */

import { BattleFormatType } from "@/lib/competition/BattleFormatRulesEngine";

export type BattleRoleSlot =
  | "vocal"
  | "rap"
  | "drums"
  | "guitar"
  | "bass"
  | "keys"
  | "dj"
  | "producer"
  | "dancer"
  | "comedian";

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

const FORMAT_ROLE_TEMPLATES: Record<BattleFormatType, BattleRoleSlot[]> = {
  "solo-vs-solo": ["vocal"],
  "duo-vs-duo": ["vocal", "producer"],
  "group-vs-group": ["vocal", "rap", "dj"],
  "band-vs-band": ["vocal", "drums", "guitar", "bass"],
  "comedian-vs-comedian": ["comedian"],
  "dancer-vs-dancer": ["dancer"],
  "rapper-vs-rapper": ["rap"],
  "singer-vs-singer": ["vocal"],
  "producer-vs-producer": ["producer"],
  "instrumentalist-vs-instrumentalist": ["guitar"],
  "jug-off": ["vocal"],
  "dance-off": ["dancer"],
  "dirty-dozens": ["rap"],
  "mini-dozens": ["rap"],
  "open-performer-challenge": ["vocal", "rap", "producer", "dj"],
};

export class BattleTeamAssemblyEngine {
  validateMatchup(format: BattleFormatType, sideA: BattleTeam, sideB: BattleTeam): TeamAssemblyResult {
    const slotsRequired = FORMAT_ROLE_TEMPLATES[format] ?? ["vocal"];

    const aValid = this.validateTeamAgainstSlots(sideA, slotsRequired);
    if (!aValid.ok) return { ok: false, reason: `side-a-${aValid.reason}`, slotsRequired };

    const bValid = this.validateTeamAgainstSlots(sideB, slotsRequired);
    if (!bValid.ok) return { ok: false, reason: `side-b-${bValid.reason}`, slotsRequired };

    return { ok: true, slotsRequired, sideA, sideB };
  }

  getRequiredSlots(format: BattleFormatType): BattleRoleSlot[] {
    return [...(FORMAT_ROLE_TEMPLATES[format] ?? ["vocal"])];
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
