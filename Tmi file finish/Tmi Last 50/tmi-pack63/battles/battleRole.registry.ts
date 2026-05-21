// apps/web/src/lib/battles/battleRole.registry.ts
// Role-based battle taxonomy. Match by role first, then genre/tier/activity.
// NO generic artist-vs-artist. Every battle must match same role.

export type BattleRole =
  | "vocalist"       | "rapper"        | "comedian"     | "dancer"
  | "guitarist"      | "bassist"       | "drummer"      | "pianist"
  | "keyboardist"    | "producer"      | "dj"           | "beatmaker"
  | "songwriter"     | "solo_artist"   | "duo"          | "band"
  | "dance_group"    | "music_group"   | "cypher_rapper";

export type BattleMode =
  | "solo_role"        // singer vs singer
  | "member_role"      // drummer from Band A vs drummer from Band B
  | "team_battle"      // band vs band
  | "cypher_battle"    // rapper cypher
  | "instrument_showcase" // guitarist showcase
  | "judged_final"     // monthly/yearly finals
  | "audience_vote";   // pure audience vote

export interface BattleRoleConfig {
  role: BattleRole;
  label: string;
  allowedModes: BattleMode[];
  scoringDimensions: string[];
  roomScene: string;        // maps to venue skin
  hostPreference: string;   // "danny" | "eddie" | "julius" | "both"
  weeklySlot: string;       // which day of the week
  audienceVoteWeight: number; // 0-1
  sponsorCompatible: boolean;
  minParticipants: number;
  maxParticipants: number;
}

export const BATTLE_ROLE_REGISTRY: Record<BattleRole, BattleRoleConfig> = {
  vocalist:    { role:"vocalist",    label:"Singer vs Singer",      allowedModes:["solo_role","audience_vote"],     scoringDimensions:["pitch","timing","stage_presence","audience_vote","retention"],      roomScene:"concert-hall",        hostPreference:"danny",  weeklySlot:"Monday",    audienceVoteWeight:0.5, sponsorCompatible:true,  minParticipants:2, maxParticipants:2 },
  rapper:      { role:"rapper",      label:"Rapper vs Rapper",      allowedModes:["solo_role","cypher_battle"],     scoringDimensions:["bars","delivery","crowd_reaction","originality","audience_vote"],   roomScene:"warehouse",           hostPreference:"eddie",  weeklySlot:"Monday",    audienceVoteWeight:0.5, sponsorCompatible:true,  minParticipants:2, maxParticipants:8 },
  comedian:    { role:"comedian",    label:"Comedian vs Comedian",   allowedModes:["solo_role","audience_vote"],     scoringDimensions:["laughs","delivery","timing","crowd_reaction","audience_vote"],      roomScene:"talk-show-set",       hostPreference:"eddie",  weeklySlot:"Monday",    audienceVoteWeight:0.5, sponsorCompatible:true,  minParticipants:2, maxParticipants:4 },
  dancer:      { role:"dancer",      label:"Dancer vs Dancer",       allowedModes:["solo_role","audience_vote"],     scoringDimensions:["technique","energy","crowd_reaction","creativity","audience_vote"],  roomScene:"neon-club",           hostPreference:"eddie",  weeklySlot:"Wednesday", audienceVoteWeight:0.5, sponsorCompatible:true,  minParticipants:2, maxParticipants:4 },
  guitarist:   { role:"guitarist",   label:"Guitarist vs Guitarist", allowedModes:["solo_role","member_role"],       scoringDimensions:["execution","musicality","creativity","crowd_response","completion"], roomScene:"concert-hall",        hostPreference:"danny",  weeklySlot:"Tuesday",   audienceVoteWeight:0.4, sponsorCompatible:true,  minParticipants:2, maxParticipants:2 },
  bassist:     { role:"bassist",     label:"Bassist vs Bassist",     allowedModes:["solo_role","member_role"],       scoringDimensions:["groove","timing","complexity","audience_vote"],                      roomScene:"concert-hall",        hostPreference:"danny",  weeklySlot:"Tuesday",   audienceVoteWeight:0.4, sponsorCompatible:false, minParticipants:2, maxParticipants:2 },
  drummer:     { role:"drummer",     label:"Drummer vs Drummer",     allowedModes:["solo_role","member_role","instrument_showcase"], scoringDimensions:["timing","complexity","groove","consistency","audience_vote"], roomScene:"neon-announcement-stage", hostPreference:"both", weeklySlot:"Tuesday", audienceVoteWeight:0.45, sponsorCompatible:true, minParticipants:2, maxParticipants:2 },
  pianist:     { role:"pianist",     label:"Pianist vs Pianist",     allowedModes:["solo_role","member_role"],       scoringDimensions:["execution","musicality","creativity","crowd_response"],              roomScene:"concert-hall",        hostPreference:"danny",  weeklySlot:"Tuesday",   audienceVoteWeight:0.4, sponsorCompatible:true,  minParticipants:2, maxParticipants:2 },
  keyboardist: { role:"keyboardist", label:"Keyboardist vs Keyboardist", allowedModes:["solo_role","member_role"],  scoringDimensions:["execution","musicality","creativity","crowd_response"],              roomScene:"concert-hall",        hostPreference:"danny",  weeklySlot:"Tuesday",   audienceVoteWeight:0.4, sponsorCompatible:true,  minParticipants:2, maxParticipants:2 },
  producer:    { role:"producer",    label:"Producer vs Producer",   allowedModes:["solo_role","audience_vote"],     scoringDimensions:["beat_quality","creativity","crowd_reaction","completion"],           roomScene:"tv-studio",           hostPreference:"eddie",  weeklySlot:"Wednesday", audienceVoteWeight:0.5, sponsorCompatible:true,  minParticipants:2, maxParticipants:4 },
  dj:          { role:"dj",          label:"DJ vs DJ",               allowedModes:["solo_role","audience_vote"],     scoringDimensions:["mix_quality","energy","crowd_reaction","creativity"],                roomScene:"neon-club",           hostPreference:"eddie",  weeklySlot:"Wednesday", audienceVoteWeight:0.5, sponsorCompatible:true,  minParticipants:2, maxParticipants:2 },
  beatmaker:   { role:"beatmaker",   label:"Beatmaker vs Beatmaker", allowedModes:["solo_role"],                     scoringDimensions:["beat_quality","creativity","crowd_reaction"],                        roomScene:"tv-studio",           hostPreference:"eddie",  weeklySlot:"Wednesday", audienceVoteWeight:0.5, sponsorCompatible:false, minParticipants:2, maxParticipants:4 },
  songwriter:  { role:"songwriter",  label:"Songwriter vs Songwriter", allowedModes:["solo_role","judged_final"],   scoringDimensions:["lyric_quality","melody","originality","audience_vote"],              roomScene:"talk-show-set",       hostPreference:"danny",  weeklySlot:"Monday",    audienceVoteWeight:0.4, sponsorCompatible:true,  minParticipants:2, maxParticipants:4 },
  solo_artist: { role:"solo_artist", label:"Artist Showcase",         allowedModes:["solo_role","audience_vote"],   scoringDimensions:["performance","crowd_reaction","stage_presence","retention"],         roomScene:"concert-hall",        hostPreference:"danny",  weeklySlot:"Friday",    audienceVoteWeight:0.5, sponsorCompatible:true,  minParticipants:1, maxParticipants:6 },
  duo:         { role:"duo",         label:"Duo vs Duo",              allowedModes:["team_battle","audience_vote"],  scoringDimensions:["cohesion","performance","crowd_reaction","audience_vote"],           roomScene:"concert-hall",        hostPreference:"both",   weeklySlot:"Thursday",  audienceVoteWeight:0.5, sponsorCompatible:true,  minParticipants:2, maxParticipants:2 },
  band:        { role:"band",        label:"Band vs Band",            allowedModes:["team_battle","judged_final"],   scoringDimensions:["cohesion","arrangement","stage_energy","crowd_retention","audience_vote"], roomScene:"festival",       hostPreference:"both",   weeklySlot:"Thursday",  audienceVoteWeight:0.4, sponsorCompatible:true,  minParticipants:2, maxParticipants:2 },
  dance_group: { role:"dance_group", label:"Dance Group vs Dance Group", allowedModes:["team_battle","audience_vote"], scoringDimensions:["synchrony","energy","creativity","crowd_reaction"],             roomScene:"neon-club",           hostPreference:"eddie",  weeklySlot:"Wednesday", audienceVoteWeight:0.5, sponsorCompatible:true,  minParticipants:2, maxParticipants:2 },
  music_group: { role:"music_group", label:"Group vs Group",          allowedModes:["team_battle","judged_final"],   scoringDimensions:["cohesion","performance","crowd_reaction","audience_vote"],           roomScene:"festival",            hostPreference:"both",   weeklySlot:"Thursday",  audienceVoteWeight:0.45,sponsorCompatible:true,  minParticipants:2, maxParticipants:2 },
  cypher_rapper: { role:"cypher_rapper", label:"Cypher Battle",      allowedModes:["cypher_battle","audience_vote"], scoringDimensions:["bars","delivery","crowd_reaction","originality","audience_vote"],  roomScene:"warehouse",           hostPreference:"eddie",  weeklySlot:"Thursday",  audienceVoteWeight:0.5, sponsorCompatible:true,  minParticipants:2, maxParticipants:8 },
};

export function getBattleRoleConfig(role: BattleRole): BattleRoleConfig {
  return BATTLE_ROLE_REGISTRY[role];
}

// Matchmaking guard: NEVER match different roles
export function canBattle(roleA: BattleRole, roleB: BattleRole): boolean {
  return roleA === roleB;
}
