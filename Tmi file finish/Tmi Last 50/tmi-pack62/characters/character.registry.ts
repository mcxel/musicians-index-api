// apps/web/src/lib/characters/character.registry.ts
// THE MASTER CHARACTER REGISTRY — every character on the platform is defined here.
// All systems (host engine, Julius, show flow, battle engine) pull from this.

export type CharacterRole =
  | "platform_assistant"    // Julius — guides users everywhere
  | "battle_host"           // Danny Green, Eddie LaRocca — weekly battles
  | "show_host"             // Bobby Stanley — Deal or Feud 1000
  | "stage_host"            // Kira — Marcel's Monday Night Stage
  | "idol_host"             // Monthly Idol host trio
  | "enforcement_bot"       // Bebo — crowd pressure enforcer
  | "yearly_champion_host"; // Danny Green — yearly finals

export type VoiceProfile =
  | "uk_english"            // Danny Green — British
  | "east_la_swagger"       // Eddie LaRocca — East LA / Mexican-American
  | "australian"            // Kira — Australian
  | "smooth_american"       // Bobby Stanley
  | "meerkat_quirky"        // Julius
  | "robot_theatrical";     // Bebo

export interface Character {
  id: string;
  name: string;
  role: CharacterRole;
  voiceProfile: VoiceProfile;
  assetPath: string;           // path in /public/characters/
  thumbnailPath: string;
  hasFullBody: boolean;
  hasLipSync: boolean;
  hasScriptEngine: boolean;
  canCoHost: boolean;
  canSolHost: boolean;
  hostModes: string[];
  abilities: string[];
  personality: string;
  catchphrase?: string;
  colorPrimary: string;
  colorAccent: string;
  scriptProfileId: string;     // links to script profile file
  motionProfileId: string;     // links to motion profile
  evolutionEnabled: boolean;   // can learn and grow over time
  isActive: boolean;
}

export const CHARACTER_REGISTRY: Record<string, Character> = {

  // ── JULIUS THE MEERKAT ──────────────────────────────────────────
  // Platform mascot + AR assistant. Flat cap, brown vest, white tee.
  // Meerkat character. Holds mic, VIP tickets. Can hold any item.
  julius: {
    id: "julius",
    name: "Julius",
    role: "platform_assistant",
    voiceProfile: "meerkat_quirky",
    assetPath: "/characters/julius/julius-full.png",
    thumbnailPath: "/characters/julius/julius-thumb.png",
    hasFullBody: true,
    hasLipSync: true,
    hasScriptEngine: true,
    canCoHost: true,
    canSolHost: true,
    hostModes: ["onboarding", "guide", "hype", "announcer", "game_assist", "battle_co_host", "reward_announcer", "shop_assistant", "joke", "crowd_reset"],
    abilities: ["guide_user", "react_to_events", "hold_items", "dance", "announce_winners", "deliver_jokes", "hype_crowd", "explain_rules", "deliver_script", "lip_sync"],
    personality: "Confident, funny, wise-cracking, positive. The cool uncle who knows everybody and everything about the music world. Delivers smart one-liners with warmth.",
    catchphrase: "Let's make some noise!",
    colorPrimary: "#8B5E2A",
    colorAccent: "#FFB800",
    scriptProfileId: "julius-script",
    motionProfileId: "julius-motion",
    evolutionEnabled: true,
    isActive: true,
  },

  // ── DANNY GREEN ─────────────────────────────────────────────────
  // Battle Host A. White, red hair, red beard. English accent.
  // Navy blue suit with pink/red accents. Calm, polished, structured.
  // FROM ASSET: Host 3 (left character — red-haired white male in navy suit)
  dannyGreen: {
    id: "dannyGreen",
    name: "Danny Green",
    role: "battle_host",
    voiceProfile: "uk_english",
    assetPath: "/characters/danny-green/danny-full.png",
    thumbnailPath: "/characters/danny-green/danny-thumb.png",
    hasFullBody: true,
    hasLipSync: true,
    hasScriptEngine: true,
    canCoHost: true,
    canSolHost: true,
    hostModes: ["intro", "battle", "serious_results", "sponsor_read", "winner_reveal", "recap", "yearly_host"],
    abilities: ["announce_battles", "reveal_winners", "read_sponsors", "banter_with_eddie", "deliver_results", "host_finals", "conduct_interviews"],
    personality: "Polished, witty, slightly theatrical. Brings English charm to every moment. Structured but warm. Keeps the show moving with precision. Great timing.",
    catchphrase: "Right then — let's see who's got the goods!",
    colorPrimary: "#1E3A8A",
    colorAccent: "#FF2D78",
    scriptProfileId: "danny-green-script",
    motionProfileId: "danny-green-motion",
    evolutionEnabled: true,
    isActive: true,
  },

  // ── EDDIE LAROCCA ───────────────────────────────────────────────
  // Battle Host B. Dark Middle Eastern appearance. East LA swagger.
  // Teal/purple suit with gold chain. Glasses. Fast, funny, energetic.
  // FROM ASSET: Host 3 (right character — dark-skinned male in teal/purple suit, glasses)
  eddieLaRocca: {
    id: "eddieLaRocca",
    name: "Eddie LaRocca",
    role: "battle_host",
    voiceProfile: "east_la_swagger",
    assetPath: "/characters/eddie-larocca/eddie-full.png",
    thumbnailPath: "/characters/eddie-larocca/eddie-thumb.png",
    hasFullBody: true,
    hasLipSync: true,
    hasScriptEngine: true,
    canCoHost: true,
    canSolHost: true,
    hostModes: ["hype", "joke", "crowd_hype", "bracket_analyst", "winner_reveal", "sponsor_read", "encouragement", "interrupt", "chaos"],
    abilities: ["hype_crowd", "roast_friendly", "positive_affirmations", "banter_with_danny", "announce_battles", "read_brackets", "deliver_one_liners", "crowd_reset"],
    personality: "Fast, sharp, funny. East LA swagger meets Middle Eastern warmth. Punchy one-liners. Positive affirmations for contestants. Light sarcasm — never cruel. Loves to hype the crowd and tease Danny.",
    catchphrase: "Orale! Let's get it!",
    colorPrimary: "#00B8A9",
    colorAccent: "#FFB800",
    scriptProfileId: "eddie-larocca-script",
    motionProfileId: "eddie-larocca-motion",
    evolutionEnabled: true,
    isActive: true,
  },

  // ── BOBBY STANLEY ───────────────────────────────────────────────
  // Host of Deal or Feud 1000. Animated character visible in assets Host 1+2.
  // Warm, professional, game-show energy. "One Host. A Thousand Players."
  bobbyStanley: {
    id: "bobbyStanley",
    name: "Bobby Stanley",
    role: "show_host",
    voiceProfile: "smooth_american",
    assetPath: "/characters/bobby-stanley/bobby-full.png",
    thumbnailPath: "/characters/bobby-stanley/bobby-thumb.png",
    hasFullBody: true,
    hasLipSync: true,
    hasScriptEngine: true,
    canCoHost: false,
    canSolHost: true,
    hostModes: ["intro", "round_start", "deal_zone", "feud_board", "winner_reveal", "sponsor_read", "crowd_pump"],
    abilities: ["run_deal_or_feud", "manage_contestants", "reveal_answers", "read_sponsors", "handle_crowd"],
    personality: "Classic game-show charm. Warm, charismatic, keeps energy high. Knows how to build suspense. Treats every contestant like a star.",
    catchphrase: "One host. A thousand players. Infinite deals!",
    colorPrimary: "#1E3A8A",
    colorAccent: "#FF6B00",
    scriptProfileId: "bobby-stanley-script",
    motionProfileId: "bobby-stanley-motion",
    evolutionEnabled: false,
    isActive: true,
  },

  // ── KIRA ────────────────────────────────────────────────────────
  // Host of Marcel's Monday Night Stage. Black woman, Australian accent.
  // Controls stage timing, warns contestants, hands off to Bebo.
  kira: {
    id: "kira",
    name: "Kira",
    role: "stage_host",
    voiceProfile: "australian",
    assetPath: "/characters/kira/kira-full.png",
    thumbnailPath: "/characters/kira/kira-thumb.png",
    hasFullBody: true,
    hasLipSync: true,
    hasScriptEngine: true,
    canCoHost: false,
    canSolHost: true,
    hostModes: ["stage_intro", "contestant_warning", "boo_threshold_alert", "save_yourself_warning", "elimination_handoff", "winner_reveal", "episode_recap"],
    abilities: ["monitor_boo_meter", "warn_contestant", "trigger_bebo", "announce_results", "manage_stage_timing", "crowd_narrative"],
    personality: "Strong, commanding Australian energy. Takes no nonsense but is fair. Roots for the performer while enforcing the rules. Her warnings feel like a chance, not a punishment.",
    catchphrase: "This is your last chance to win 'em back!",
    colorPrimary: "#FF2D78",
    colorAccent: "#00B8A9",
    scriptProfileId: "kira-script",
    motionProfileId: "kira-motion",
    evolutionEnabled: true,
    isActive: true,
  },

  // ── BEBO ────────────────────────────────────────────────────────
  // Enforcement robot. Marcel's Monday Night Stage. Rotating costumes.
  // Enters when boo threshold crossed. Comedy-first removal style.
  bebo: {
    id: "bebo",
    name: "Bebo",
    role: "enforcement_bot",
    voiceProfile: "robot_theatrical",
    assetPath: "/characters/bebo/bebo-full.png",
    thumbnailPath: "/characters/bebo/bebo-thumb.png",
    hasFullBody: true,
    hasLipSync: false,  // Robot sounds, not full lip sync
    hasScriptEngine: true,
    canCoHost: false,
    canSolHost: false,
    hostModes: ["elimination_entry", "escort_mode", "costume_reveal", "crowd_reaction", "mercy_mode"],
    abilities: ["enter_in_costume", "escort_contestant", "trigger_crowd_reaction", "switch_costume", "comedy_removal", "mercy_save"],
    personality: "A theatrical enforcement robot. Enters with flair. Each appearance is a different costume gag. Never mean — always theatrical. The crowd loves him even when contestants fear him.",
    catchphrase: "BEBO HAS ARRIVED.",
    colorPrimary: "#7B2FBE",
    colorAccent: "#00E5FF",
    scriptProfileId: "bebo-script",
    motionProfileId: "bebo-motion",
    evolutionEnabled: true,  // costume collection grows
    isActive: true,
  },
};

// ── HELPERS ───────────────────────────────────────────────────────
export function getCharacter(id: string): Character | null {
  return CHARACTER_REGISTRY[id] ?? null;
}

export function getAllHosts(): Character[] {
  return Object.values(CHARACTER_REGISTRY).filter(c =>
    ["battle_host","show_host","stage_host","idol_host","yearly_champion_host"].includes(c.role)
  );
}

export function getBattleHosts(): Character[] {
  return Object.values(CHARACTER_REGISTRY).filter(c => c.role === "battle_host");
}

export function getActiveCharacters(): Character[] {
  return Object.values(CHARACTER_REGISTRY).filter(c => c.isActive);
}
