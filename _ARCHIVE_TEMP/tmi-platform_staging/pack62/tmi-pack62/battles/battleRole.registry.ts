// apps/web/src/engines/battles/battleRole.registry.ts
// Role-based battle taxonomy. Singer vs singer. Drummer vs drummer. 
// NEVER generic artist vs artist.

export type BattleRole =
  | "vocalist"           // general singers
  | "rapper"             // rap / hip-hop specific
  | "comedian"           // stand-up / comedy performance
  | "dancer"             // individual dancer
  | "guitarist"
  | "bassist"
  | "drummer"
  | "pianist"
  | "keyboardist"
  | "producer"           // beat/track producer
  | "dj"
  | "beatmaker"
  | "songwriter"
  | "solo_artist"        // all-around solo performer
  | "duo"                // 2-person group
  | "band"               // full band
  | "dance_group"        // dance crew / group
  | "music_group"        // vocal/music group
  | "cypher_rapper"      // cypher-specific battle rapper
  | "backup_vocalist";   // background vocal spotlight

export type BattleMode =
  | "solo_role"          // one performer vs same role
  | "member_role"        // band member vs same role from another band
  | "team_battle"        // full group vs full group
  | "cypher_battle"      // open cypher, multiple competitors
  | "instrument_showcase" // single instrument showcase bracket
  | "judged_final"       // judge-panel assisted (quarterly/yearly)
  | "audience_vote";     // pure audience voting (most battles)

export interface BattleRoleConfig {
  role: BattleRole;
  label: string;
  icon: string;
  genre: string[];       // compatible genres
  battleModes: BattleMode[];
  scoringWeights: {
    audienceVote: number;    // 0-1
    performanceQuality: number;
    retention: number;
    engagement: number;
    finalsBonus?: number;
  };
  roomScene: string;     // which environment skin to use
  audioProfile: string;
  canBattleAs: "individual" | "group_member" | "both";
  weeklySlot?: string;   // preferred day if scheduled weekly
}

export const BATTLE_ROLE_REGISTRY: Record<BattleRole, BattleRoleConfig> = {
  vocalist:     { role:"vocalist",    label:"Vocalist",      icon:"🎤", genre:["R&B","Pop","Soul","Gospel","Country"],      battleModes:["solo_role","member_role","audience_vote"], scoringWeights:{ audienceVote:0.5, performanceQuality:0.25, retention:0.15, engagement:0.1 }, roomScene:"concert-hall", audioProfile:"stage_ambient",    canBattleAs:"both", weeklySlot:"Monday" },
  rapper:       { role:"rapper",      label:"Rapper",        icon:"🎙️", genre:["Hip Hop","Rap","Trap","Drill"],             battleModes:["solo_role","cypher_battle","audience_vote"], scoringWeights:{ audienceVote:0.5, performanceQuality:0.2, retention:0.15, engagement:0.15 }, roomScene:"warehouse", audioProfile:"cypher_beat",      canBattleAs:"individual", weeklySlot:"Tuesday" },
  comedian:     { role:"comedian",    label:"Comedian",      icon:"😂", genre:["Comedy"],                                  battleModes:["solo_role","audience_vote"], scoringWeights:{ audienceVote:0.6, performanceQuality:0.15, retention:0.15, engagement:0.1 }, roomScene:"tv-studio",  audioProfile:"studio_silence",   canBattleAs:"individual", weeklySlot:"Thursday" },
  dancer:       { role:"dancer",      label:"Dancer",        icon:"💃", genre:["Pop","Hip Hop","Electronic","R&B"],         battleModes:["solo_role","audience_vote"], scoringWeights:{ audienceVote:0.5, performanceQuality:0.3, retention:0.1, engagement:0.1 }, roomScene:"neon-club",  audioProfile:"lobby_ambient",    canBattleAs:"individual", weeklySlot:"Friday" },
  guitarist:    { role:"guitarist",   label:"Guitarist",     icon:"🎸", genre:["Rock","Blues","Metal","Country","Pop"],     battleModes:["solo_role","member_role","instrument_showcase"], scoringWeights:{ audienceVote:0.45, performanceQuality:0.35, retention:0.1, engagement:0.1 }, roomScene:"concert-hall", audioProfile:"stage_ambient", canBattleAs:"both", weeklySlot:"Wednesday" },
  bassist:      { role:"bassist",     label:"Bassist",       icon:"🎵", genre:["Rock","Jazz","Funk","R&B"],                battleModes:["solo_role","member_role","instrument_showcase"], scoringWeights:{ audienceVote:0.4, performanceQuality:0.4, retention:0.1, engagement:0.1 }, roomScene:"concert-hall", audioProfile:"stage_ambient", canBattleAs:"both" },
  drummer:      { role:"drummer",     label:"Drummer",       icon:"🥁", genre:["Rock","Hip Hop","Jazz","Metal","Pop"],     battleModes:["solo_role","member_role","instrument_showcase"], scoringWeights:{ audienceVote:0.45, performanceQuality:0.35, retention:0.1, engagement:0.1 }, roomScene:"warehouse", audioProfile:"stage_ambient",    canBattleAs:"both", weeklySlot:"Wednesday" },
  pianist:      { role:"pianist",     label:"Pianist",       icon:"🎹", genre:["Classical","Jazz","R&B","Gospel","Pop"],  battleModes:["solo_role","member_role","instrument_showcase"], scoringWeights:{ audienceVote:0.4, performanceQuality:0.4, retention:0.1, engagement:0.1 }, roomScene:"concert-hall", audioProfile:"editorial",     canBattleAs:"both" },
  keyboardist:  { role:"keyboardist", label:"Keyboardist",   icon:"🎹", genre:["R&B","Gospel","Jazz","Pop","Electronic"], battleModes:["solo_role","member_role","instrument_showcase"], scoringWeights:{ audienceVote:0.45, performanceQuality:0.35, retention:0.1, engagement:0.1 }, roomScene:"concert-hall", audioProfile:"stage_ambient", canBattleAs:"both" },
  producer:     { role:"producer",    label:"Producer",      icon:"🎛️", genre:["Hip Hop","R&B","Electronic","Pop"],        battleModes:["solo_role","instrument_showcase"], scoringWeights:{ audienceVote:0.5, performanceQuality:0.3, retention:0.1, engagement:0.1 }, roomScene:"warehouse", audioProfile:"studio_silence",   canBattleAs:"individual" },
  dj:           { role:"dj",          label:"DJ",            icon:"🎧", genre:["Electronic","Hip Hop","R&B","Pop"],        battleModes:["solo_role","audience_vote"], scoringWeights:{ audienceVote:0.55, performanceQuality:0.25, retention:0.1, engagement:0.1 }, roomScene:"neon-club", audioProfile:"lobby_ambient",     canBattleAs:"individual" },
  beatmaker:    { role:"beatmaker",   label:"Beatmaker",     icon:"🥁", genre:["Hip Hop","R&B","Electronic"],             battleModes:["solo_role","audience_vote"], scoringWeights:{ audienceVote:0.5, performanceQuality:0.3, retention:0.1, engagement:0.1 }, roomScene:"warehouse", audioProfile:"studio_silence",   canBattleAs:"individual" },
  songwriter:   { role:"songwriter",  label:"Songwriter",    icon:"✍️", genre:["Pop","Country","R&B","Folk"],              battleModes:["solo_role","audience_vote"], scoringWeights:{ audienceVote:0.5, performanceQuality:0.3, retention:0.1, engagement:0.1 }, roomScene:"tv-studio", audioProfile:"editorial",         canBattleAs:"individual" },
  solo_artist:  { role:"solo_artist", label:"Solo Artist",   icon:"⭐", genre:["any"],                                    battleModes:["solo_role","audience_vote"], scoringWeights:{ audienceVote:0.5, performanceQuality:0.25, retention:0.15, engagement:0.1 }, roomScene:"concert-hall", audioProfile:"stage_ambient", canBattleAs:"individual" },
  duo:          { role:"duo",         label:"Duo",           icon:"👥", genre:["any"],                                    battleModes:["team_battle","audience_vote"], scoringWeights:{ audienceVote:0.5, performanceQuality:0.25, retention:0.15, engagement:0.1 }, roomScene:"concert-hall", audioProfile:"stage_ambient", canBattleAs:"group_member", weeklySlot:"Saturday" },
  band:         { role:"band",        label:"Band",          icon:"🎸", genre:["Rock","Pop","Hip Hop","Jazz","R&B"],      battleModes:["team_battle","audience_vote"], scoringWeights:{ audienceVote:0.4, performanceQuality:0.3, retention:0.15, engagement:0.15 }, roomScene:"concert-hall", audioProfile:"stage_ambient", canBattleAs:"group_member", weeklySlot:"Saturday" },
  dance_group:  { role:"dance_group", label:"Dance Group",   icon:"💃", genre:["Hip Hop","Pop","Electronic"],             battleModes:["team_battle","audience_vote"], scoringWeights:{ audienceVote:0.55, performanceQuality:0.25, retention:0.1, engagement:0.1 }, roomScene:"neon-club", audioProfile:"lobby_ambient",  canBattleAs:"group_member", weeklySlot:"Friday" },
  music_group:  { role:"music_group", label:"Music Group",   icon:"🎵", genre:["R&B","Pop","Gospel","Hip Hop"],           battleModes:["team_battle","audience_vote"], scoringWeights:{ audienceVote:0.5, performanceQuality:0.25, retention:0.15, engagement:0.1 }, roomScene:"concert-hall", audioProfile:"stage_ambient", canBattleAs:"group_member" },
  cypher_rapper:{ role:"cypher_rapper",label:"Cypher Rapper",icon:"🔥", genre:["Hip Hop","Rap"],                         battleModes:["cypher_battle","audience_vote"], scoringWeights:{ audienceVote:0.5, performanceQuality:0.2, retention:0.15, engagement:0.15 }, roomScene:"warehouse", audioProfile:"cypher_beat",    canBattleAs:"individual" },
  backup_vocalist:{ role:"backup_vocalist",label:"Backup Vocalist",icon:"🎵", genre:["R&B","Pop","Soul"],                battleModes:["solo_role","member_role","audience_vote"], scoringWeights:{ audienceVote:0.5, performanceQuality:0.3, retention:0.1, engagement:0.1 }, roomScene:"concert-hall", audioProfile:"stage_ambient", canBattleAs:"both" },
};

// Matchmaking rule: roles that can battle each other
export function canBattleEachOther(role1: BattleRole, role2: BattleRole): boolean {
  // Same role always valid
  if (role1 === role2) return true;
  // Special cross-role combos (all must be approved here)
  const VALID_CROSS_BATTLES: Array<[BattleRole, BattleRole]> = [
    ["vocalist","backup_vocalist"],
    ["rapper","cypher_rapper"],
    ["pianist","keyboardist"],
    ["guitarist","bassist"],
  ];
  return VALID_CROSS_BATTLES.some(([a,b]) => (role1===a && role2===b) || (role1===b && role2===a));
}
