/**
 * BattleFormatRulesEngine
 * Canon format and team-size rules for challenge/battle requests.
 */

export type BattleTier = "free" | "pro" | "bronze" | "silver" | "gold" | "platinum" | "diamond";

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

export interface BattleFormatRule {
  format: BattleFormatType;
  minTeamSize: number;
  maxTeamSize: number;
  defaultTeamSize: number;
  category: "battle" | "cypher" | "contest" | "showcase";
  label: string;
}

const FORMAT_RULES: Record<BattleFormatType, BattleFormatRule> = {
  "solo-vs-solo": { format: "solo-vs-solo", minTeamSize: 1, maxTeamSize: 1, defaultTeamSize: 1, category: "battle", label: "Solo 1v1" },
  "duo-vs-duo": { format: "duo-vs-duo", minTeamSize: 2, maxTeamSize: 2, defaultTeamSize: 2, category: "battle", label: "Duo 2v2" },
  "group-vs-group": { format: "group-vs-group", minTeamSize: 3, maxTeamSize: 10, defaultTeamSize: 3, category: "battle", label: "Group" },
  "band-vs-band": { format: "band-vs-band", minTeamSize: 2, maxTeamSize: 12, defaultTeamSize: 4, category: "battle", label: "Band" },
  "comedian-vs-comedian": { format: "comedian-vs-comedian", minTeamSize: 1, maxTeamSize: 1, defaultTeamSize: 1, category: "contest", label: "Comedian" },
  "dancer-vs-dancer": { format: "dancer-vs-dancer", minTeamSize: 1, maxTeamSize: 1, defaultTeamSize: 1, category: "contest", label: "Dancer" },
  "rapper-vs-rapper": { format: "rapper-vs-rapper", minTeamSize: 1, maxTeamSize: 1, defaultTeamSize: 1, category: "battle", label: "Rapper" },
  "singer-vs-singer": { format: "singer-vs-singer", minTeamSize: 1, maxTeamSize: 1, defaultTeamSize: 1, category: "battle", label: "Singer" },
  "producer-vs-producer": { format: "producer-vs-producer", minTeamSize: 1, maxTeamSize: 1, defaultTeamSize: 1, category: "battle", label: "Producer" },
  "instrumentalist-vs-instrumentalist": { format: "instrumentalist-vs-instrumentalist", minTeamSize: 1, maxTeamSize: 1, defaultTeamSize: 1, category: "battle", label: "Instrumentalist" },
  "jug-off": { format: "jug-off", minTeamSize: 1, maxTeamSize: 2, defaultTeamSize: 1, category: "contest", label: "Jug-Off" },
  "dance-off": { format: "dance-off", minTeamSize: 1, maxTeamSize: 2, defaultTeamSize: 1, category: "contest", label: "Dance-Off" },
  "dirty-dozens": { format: "dirty-dozens", minTeamSize: 1, maxTeamSize: 2, defaultTeamSize: 1, category: "contest", label: "Dirty Dozens" },
  "mini-dozens": { format: "mini-dozens", minTeamSize: 1, maxTeamSize: 2, defaultTeamSize: 1, category: "contest", label: "Mini Dozens" },
  "open-performer-challenge": { format: "open-performer-challenge", minTeamSize: 1, maxTeamSize: 20, defaultTeamSize: 4, category: "showcase", label: "Open Circle" },
};

export class BattleFormatRulesEngine {
  getRule(format: BattleFormatType): BattleFormatRule {
    return FORMAT_RULES[format];
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
