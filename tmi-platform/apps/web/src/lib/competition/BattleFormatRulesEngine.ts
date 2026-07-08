/**
 * BattleFormatRulesEngine
 * Canon format, team configuration, and round-plan rules for challenge/battle requests.
 */

export type BattleTier = "free" | "pro" | "RUBY" | "silver" | "gold" | "platinum" | "diamond";

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

export type BattleFormatType =
  | "solo-vs-solo"
  | "duo-vs-duo"
  | "group-vs-group"
  | "band-vs-band"
  | "comedian-vs-comedian"
  | "dancer-vs-dancer"
  | "rapper-vs-rapper"
  | "singer-vs-singer"
  | "producer-vs-producer"
  | "instrumentalist-vs-instrumentalist"
  | "jug-off"
  | "dance-off"
  | "dirty-dozens"
  | "mini-dozens"
  | "open-performer-challenge";

export type EventTeamStructure = "solo" | "duo" | "trio" | "small-group" | "large-group";

export type EventTeamAssemblyMode = "fixed" | "captain-built" | "draft" | "merged" | "ai-filled";

export type EventTeamBehavior = "static" | "split" | "merge" | "relay" | "captain-led" | "substitution-enabled";

export type EventScoringModel = "judges" | "audience" | "ai" | "hybrid";

export type EventEliminationStyle = "single" | "relay" | "round-based" | "tournament" | "none";

export type EventCollaborationMode = "competitive" | "cooperative" | "hybrid";

export type EventRoundMode = "full-team" | "role-vs-role" | "captain-showdown" | "representative-showdown" | "finale";

export interface EventRoundConfig {
  key: string;
  label: string;
  mode: EventRoundMode;
  roleSlot?: BattleRoleSlot;
}

export interface EventTeamConfig {
  structure: EventTeamStructure;
  minMembers: number;
  maxMembers: number;
  defaultMembers: number;
  assemblyModes: EventTeamAssemblyMode[];
  behaviors: EventTeamBehavior[];
  captainRequired: boolean;
  roleSlots: BattleRoleSlot[];
  viewerModes: string[];
}

export interface BattleFormatRule {
  format: BattleFormatType;
  minTeamSize: number;
  maxTeamSize: number;
  defaultTeamSize: number;
  category: "battle" | "cypher" | "contest" | "showcase";
  label: string;
  teamConfig: EventTeamConfig;
  scoringModels: EventScoringModel[];
  eliminationStyles: EventEliminationStyle[];
  collaborationMode: EventCollaborationMode;
  roundPlan: EventRoundConfig[];
}

function buildRule(input: {
  format: BattleFormatType;
  minTeamSize: number;
  maxTeamSize: number;
  defaultTeamSize: number;
  category: "battle" | "cypher" | "contest" | "showcase";
  label: string;
  structure: EventTeamStructure;
  roleSlots: BattleRoleSlot[];
  assemblyModes?: EventTeamAssemblyMode[];
  behaviors?: EventTeamBehavior[];
  scoringModels?: EventScoringModel[];
  eliminationStyles?: EventEliminationStyle[];
  collaborationMode?: EventCollaborationMode;
  roundPlan?: EventRoundConfig[];
}): BattleFormatRule {
  const roleViewerModes = input.roleSlots.map((role) => `${role}-cam`);

  return {
    format: input.format,
    minTeamSize: input.minTeamSize,
    maxTeamSize: input.maxTeamSize,
    defaultTeamSize: input.defaultTeamSize,
    category: input.category,
    label: input.label,
    teamConfig: {
      structure: input.structure,
      minMembers: input.minTeamSize,
      maxMembers: input.maxTeamSize,
      defaultMembers: input.defaultTeamSize,
      assemblyModes: input.assemblyModes ?? ["fixed", "captain-built"],
      behaviors: input.behaviors ?? ["static"],
      captainRequired: input.maxTeamSize > 1,
      roleSlots: [...input.roleSlots],
      viewerModes: ["full-team", ...roleViewerModes, "audience-cam"],
    },
    scoringModels: input.scoringModels ?? ["audience", "judges", "hybrid"],
    eliminationStyles: input.eliminationStyles ?? ["round-based"],
    collaborationMode: input.collaborationMode ?? "competitive",
    roundPlan: input.roundPlan ?? [{ key: "main", label: input.label, mode: "full-team" }],
  };
}

const FORMAT_RULES: Record<BattleFormatType, BattleFormatRule> = {
  "solo-vs-solo": buildRule({
    format: "solo-vs-solo", minTeamSize: 1, maxTeamSize: 1, defaultTeamSize: 1, category: "battle", label: "Solo 1v1",
    structure: "solo", roleSlots: ["vocal"], eliminationStyles: ["single", "round-based"],
  }),
  "duo-vs-duo": buildRule({
    format: "duo-vs-duo", minTeamSize: 2, maxTeamSize: 2, defaultTeamSize: 2, category: "battle", label: "Duo 2v2",
    structure: "duo", roleSlots: ["vocal", "producer"], behaviors: ["static", "relay", "captain-led"],
  }),
  "group-vs-group": buildRule({
    format: "group-vs-group", minTeamSize: 3, maxTeamSize: 10, defaultTeamSize: 3, category: "battle", label: "Group",
    structure: "small-group", roleSlots: ["vocal", "rap", "dj"],
    assemblyModes: ["fixed", "captain-built", "draft", "merged", "ai-filled"],
    behaviors: ["static", "split", "merge", "relay", "captain-led", "substitution-enabled"],
    roundPlan: [
      { key: "team-opening", label: "Team Opening", mode: "full-team" },
      { key: "captain-round", label: "Captain Round", mode: "captain-showdown" },
      { key: "representative-round", label: "Representative Round", mode: "representative-showdown" },
      { key: "team-finale", label: "Team Finale", mode: "finale" },
    ],
  }),
  "band-vs-band": buildRule({
    format: "band-vs-band", minTeamSize: 2, maxTeamSize: 12, defaultTeamSize: 4, category: "battle", label: "Band",
    structure: "small-group", roleSlots: ["vocal", "drums", "guitar", "bass"],
    assemblyModes: ["fixed", "captain-built", "draft", "ai-filled"],
    behaviors: ["static", "split", "relay", "captain-led", "substitution-enabled"],
    roundPlan: [
      { key: "full-band", label: "Full Band", mode: "full-team" },
      { key: "vocal-duel", label: "Singer vs Singer", mode: "role-vs-role", roleSlot: "vocal" },
      { key: "guitar-focus", label: "Guitar Focus", mode: "role-vs-role", roleSlot: "guitar" },
      { key: "rhythm-focus", label: "Rhythm Focus", mode: "role-vs-role", roleSlot: "drums" },
      { key: "band-finale", label: "Band Finale", mode: "finale" },
    ],
  }),
  "comedian-vs-comedian": buildRule({
    format: "comedian-vs-comedian", minTeamSize: 1, maxTeamSize: 1, defaultTeamSize: 1, category: "contest", label: "Comedian",
    structure: "solo", roleSlots: ["comedian"], scoringModels: ["audience", "judges"], eliminationStyles: ["single", "round-based"],
  }),
  "dancer-vs-dancer": buildRule({
    format: "dancer-vs-dancer", minTeamSize: 1, maxTeamSize: 1, defaultTeamSize: 1, category: "contest", label: "Dancer",
    structure: "solo", roleSlots: ["dancer"], scoringModels: ["audience", "judges", "hybrid"], eliminationStyles: ["single", "round-based", "tournament"],
  }),
  "rapper-vs-rapper": buildRule({
    format: "rapper-vs-rapper", minTeamSize: 1, maxTeamSize: 1, defaultTeamSize: 1, category: "battle", label: "Rapper",
    structure: "solo", roleSlots: ["rap"], eliminationStyles: ["single", "round-based"],
  }),
  "singer-vs-singer": buildRule({
    format: "singer-vs-singer", minTeamSize: 1, maxTeamSize: 1, defaultTeamSize: 1, category: "battle", label: "Singer",
    structure: "solo", roleSlots: ["vocal"], eliminationStyles: ["single", "round-based"],
  }),
  "producer-vs-producer": buildRule({
    format: "producer-vs-producer", minTeamSize: 1, maxTeamSize: 1, defaultTeamSize: 1, category: "battle", label: "Producer",
    structure: "solo", roleSlots: ["producer"], scoringModels: ["audience", "judges", "ai", "hybrid"], eliminationStyles: ["single", "round-based"],
  }),
  "instrumentalist-vs-instrumentalist": buildRule({
    format: "instrumentalist-vs-instrumentalist", minTeamSize: 1, maxTeamSize: 1, defaultTeamSize: 1, category: "battle", label: "Instrumentalist",
    structure: "solo", roleSlots: ["guitar"], eliminationStyles: ["single", "round-based"],
  }),
  "jug-off": buildRule({
    format: "jug-off", minTeamSize: 1, maxTeamSize: 2, defaultTeamSize: 1, category: "contest", label: "Jug-Off",
    structure: "solo", roleSlots: ["vocal"], behaviors: ["static", "relay"], scoringModels: ["audience", "judges"], eliminationStyles: ["single", "round-based"],
  }),
  "dance-off": buildRule({
    format: "dance-off", minTeamSize: 1, maxTeamSize: 2, defaultTeamSize: 1, category: "contest", label: "Dance-Off",
    structure: "solo", roleSlots: ["dancer"], behaviors: ["static", "relay"], scoringModels: ["audience", "judges", "hybrid"], eliminationStyles: ["single", "round-based", "tournament"],
  }),
  "dirty-dozens": buildRule({
    format: "dirty-dozens", minTeamSize: 1, maxTeamSize: 2, defaultTeamSize: 1, category: "contest", label: "Dirty Dozens",
    structure: "solo", roleSlots: ["rap"], behaviors: ["static", "relay"], scoringModels: ["audience", "judges"], eliminationStyles: ["round-based"],
  }),
  "mini-dozens": buildRule({
    format: "mini-dozens", minTeamSize: 1, maxTeamSize: 2, defaultTeamSize: 1, category: "contest", label: "Mini Dozens",
    structure: "solo", roleSlots: ["rap"], behaviors: ["static", "relay"], scoringModels: ["audience", "judges"], eliminationStyles: ["round-based"],
  }),
  "open-performer-challenge": buildRule({
    format: "open-performer-challenge", minTeamSize: 1, maxTeamSize: 20, defaultTeamSize: 4, category: "showcase", label: "Open Circle",
    structure: "large-group", roleSlots: ["vocal", "rap", "producer", "dj"],
    assemblyModes: ["fixed", "captain-built", "draft", "merged", "ai-filled"],
    behaviors: ["static", "split", "merge", "relay", "captain-led", "substitution-enabled"],
    scoringModels: ["audience", "hybrid"], eliminationStyles: ["none", "round-based"], collaborationMode: "hybrid",
    roundPlan: [
      { key: "open-floor", label: "Open Floor", mode: "full-team" },
      { key: "representative-showcase", label: "Representative Showcase", mode: "representative-showdown" },
      { key: "collab-finale", label: "Collab Finale", mode: "finale" },
    ],
  }),
};

export class BattleFormatRulesEngine {
  getRule(format: BattleFormatType): BattleFormatRule {
    return FORMAT_RULES[format];
  }

  getTeamConfig(format: BattleFormatType): EventTeamConfig {
    return this.getRule(format).teamConfig;
  }

  getRoundPlan(format: BattleFormatType): EventRoundConfig[] {
    return this.getRule(format).roundPlan;
  }

  listRules(): BattleFormatRule[] {
    return Object.values(FORMAT_RULES);
  }

  validateTeamSize(format: BattleFormatType, teamSize: number): boolean {
    const rule = this.getRule(format);
    return teamSize >= rule.minTeamSize && teamSize <= rule.maxTeamSize;
  }

  clampTeamSize(format: BattleFormatType, teamSize: number): number {
    const rule = this.getRule(format);
    if (teamSize < rule.minTeamSize) return rule.minTeamSize;
    if (teamSize > rule.maxTeamSize) return rule.maxTeamSize;
    return teamSize;
  }

  isDirectChallengeTier(tier: BattleTier): boolean {
    return tier === "gold" || tier === "platinum" || tier === "diamond";
  }
}

export const battleFormatRulesEngine = new BattleFormatRulesEngine();
