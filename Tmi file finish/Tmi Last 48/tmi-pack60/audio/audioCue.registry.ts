// apps/web/src/engines/audio/audioCue.registry.ts
// All audio cues for the platform. Import this — never hardcode audio paths.

export type AudioCueId =
  | "crown_stinger"          // crown is awarded / crown changes
  | "crown_pulse"            // subtle pulse during crown scene
  | "genre_switch"           // fade into new genre section
  | "magazine_open"          // magazine scene starts
  | "magazine_page_turn"     // page turn inside magazine
  | "magazine_close"         // magazine scene ends
  | "game_show_stinger"      // game show interrupt appears
  | "winner_fanfare"         // winner is revealed
  | "live_alert"             // someone went LIVE
  | "cypher_battle_start"    // cypher battle begins
  | "scene_bridge"           // bridge transition between scenes
  | "cta_popup"              // CTA popup appears
  | "room_join"              // user joins a room
  | "tip_sent"               // tip animation
  | "reward_unlock"          // reward item unlocked
  | "badge_unlock"           // achievement badge
  | "rank_up"                // rank position improved
  | "rank_down"              // rank position dropped
  | "sponsor_stinger"        // sponsor card appears
  | "lobby_ambience"         // background lobby ambient
  | "editorial_ambience"     // background editorial ambient
  | "stage_ambience"         // background stage ambient
  | "game_round_start"       // round starts in game
  | "buzz_in"                // fastest buzz-in
  | "applause"               // audience applause
  | "countdown_tick"         // countdown timer
  | "notification_soft";     // gentle notification ding

export interface AudioCueConfig {
  id: AudioCueId;
  src: string;              // path under /public/audio/
  volume: number;           // 0-1
  loop: boolean;
  mutableByUser: boolean;
  autoplayPolicy: "allow" | "user_gesture_required";
  description: string;
}

export const AUDIO_CUE_REGISTRY: Record<AudioCueId, AudioCueConfig> = {
  crown_stinger:        { id:"crown_stinger",        src:"/audio/ui/crown-reveal.mp3",        volume:0.8, loop:false, mutableByUser:true,  autoplayPolicy:"user_gesture_required", description:"Crown awarded fanfare" },
  crown_pulse:          { id:"crown_pulse",          src:"/audio/ui/crown-pulse.mp3",         volume:0.2, loop:true,  mutableByUser:true,  autoplayPolicy:"allow",                 description:"Subtle crown scene background" },
  genre_switch:         { id:"genre_switch",         src:"/audio/ui/genre-switch.mp3",        volume:0.4, loop:false, mutableByUser:true,  autoplayPolicy:"allow",                 description:"Genre crossfade cue" },
  magazine_open:        { id:"magazine_open",        src:"/audio/ui/page-flip.mp3",           volume:0.5, loop:false, mutableByUser:true,  autoplayPolicy:"allow",                 description:"Magazine opens" },
  magazine_page_turn:   { id:"magazine_page_turn",   src:"/audio/ui/page-flip.mp3",           volume:0.3, loop:false, mutableByUser:true,  autoplayPolicy:"allow",                 description:"Page turn" },
  magazine_close:       { id:"magazine_close",       src:"/audio/ui/page-flip.mp3",           volume:0.3, loop:false, mutableByUser:true,  autoplayPolicy:"allow",                 description:"Magazine closes" },
  game_show_stinger:    { id:"game_show_stinger",    src:"/audio/game/round-start.mp3",       volume:0.7, loop:false, mutableByUser:true,  autoplayPolicy:"user_gesture_required", description:"Game show interrupt" },
  winner_fanfare:       { id:"winner_fanfare",       src:"/audio/game/winner-fanfare.mp3",    volume:0.8, loop:false, mutableByUser:true,  autoplayPolicy:"user_gesture_required", description:"Winner revealed" },
  live_alert:           { id:"live_alert",           src:"/audio/ui/notification.mp3",        volume:0.6, loop:false, mutableByUser:true,  autoplayPolicy:"user_gesture_required", description:"Someone went live" },
  cypher_battle_start:  { id:"cypher_battle_start",  src:"/audio/ambience/cypher-beat.mp3",   volume:0.5, loop:false, mutableByUser:true,  autoplayPolicy:"user_gesture_required", description:"Cypher battle starts" },
  scene_bridge:         { id:"scene_bridge",         src:"/audio/ui/transition-whoosh.mp3",   volume:0.3, loop:false, mutableByUser:true,  autoplayPolicy:"allow",                 description:"Scene transition" },
  cta_popup:            { id:"cta_popup",            src:"/audio/ui/notification.mp3",        volume:0.2, loop:false, mutableByUser:true,  autoplayPolicy:"allow",                 description:"CTA message appears" },
  room_join:            { id:"room_join",            src:"/audio/ui/success.mp3",             volume:0.4, loop:false, mutableByUser:true,  autoplayPolicy:"user_gesture_required", description:"Room joined" },
  tip_sent:             { id:"tip_sent",             src:"/audio/ui/purchase.mp3",            volume:0.5, loop:false, mutableByUser:true,  autoplayPolicy:"user_gesture_required", description:"Tip sent" },
  reward_unlock:        { id:"reward_unlock",        src:"/audio/ui/reward-unlock.mp3",       volume:0.6, loop:false, mutableByUser:true,  autoplayPolicy:"user_gesture_required", description:"Reward unlocked" },
  badge_unlock:         { id:"badge_unlock",         src:"/audio/ui/badge-unlock.mp3",        volume:0.6, loop:false, mutableByUser:true,  autoplayPolicy:"user_gesture_required", description:"Badge unlocked" },
  rank_up:              { id:"rank_up",              src:"/audio/ui/level-up.mp3",            volume:0.5, loop:false, mutableByUser:true,  autoplayPolicy:"user_gesture_required", description:"Rank improved" },
  rank_down:            { id:"rank_down",            src:"/audio/ui/error.mp3",               volume:0.2, loop:false, mutableByUser:true,  autoplayPolicy:"user_gesture_required", description:"Rank dropped" },
  sponsor_stinger:      { id:"sponsor_stinger",      src:"/audio/sponsor/sponsor-sting.mp3",  volume:0.4, loop:false, mutableByUser:true,  autoplayPolicy:"allow",                 description:"Sponsor card appears" },
  lobby_ambience:       { id:"lobby_ambience",       src:"/audio/ambience/lobby.mp3",         volume:0.15,loop:true,  mutableByUser:true,  autoplayPolicy:"allow",                 description:"Lobby background" },
  editorial_ambience:   { id:"editorial_ambience",   src:"/audio/music/editorial-chill.mp3",  volume:0.15,loop:true,  mutableByUser:true,  autoplayPolicy:"allow",                 description:"Editorial background" },
  stage_ambience:       { id:"stage_ambience",       src:"/audio/ambience/stage.mp3",         volume:0.15,loop:true,  mutableByUser:true,  autoplayPolicy:"allow",                 description:"Stage background" },
  game_round_start:     { id:"game_round_start",     src:"/audio/game/round-start.mp3",       volume:0.7, loop:false, mutableByUser:true,  autoplayPolicy:"user_gesture_required", description:"Game round starts" },
  buzz_in:              { id:"buzz_in",              src:"/audio/game/buzz-in.mp3",           volume:0.8, loop:false, mutableByUser:true,  autoplayPolicy:"user_gesture_required", description:"Player buzzes in" },
  applause:             { id:"applause",             src:"/audio/game/applause.mp3",          volume:0.5, loop:false, mutableByUser:true,  autoplayPolicy:"user_gesture_required", description:"Crowd applause" },
  countdown_tick:       { id:"countdown_tick",       src:"/audio/game/countdown.mp3",         volume:0.4, loop:false, mutableByUser:true,  autoplayPolicy:"user_gesture_required", description:"Countdown tick" },
  notification_soft:    { id:"notification_soft",    src:"/audio/ui/notification.mp3",        volume:0.3, loop:false, mutableByUser:true,  autoplayPolicy:"allow",                 description:"Soft notification" },
};

// ── SCENE → AUDIO PROFILE MAP ────────────────────────────────────
export const SCENE_AUDIO_MAP = {
  genre_cluster:      ["genre_switch", "lobby_ambience"],
  crown_top10:        ["crown_pulse"],
  magazine_insert:    ["magazine_open", "editorial_ambience"],
  show_game_interrupt:["game_show_stinger"],
  bridge_transition:  ["scene_bridge"],
  live_event_urgent:  ["live_alert", "stage_ambience"],
  cypher_arena:       ["cypher_battle_start"],
  winner_reveal:      ["winner_fanfare"],
} as const;
