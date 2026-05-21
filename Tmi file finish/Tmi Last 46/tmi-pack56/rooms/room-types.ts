// packages/room-types/src/room-types.ts
// Typed room architecture. Every room type has rules, permissions, interactions.

export type RoomType =
  | "LIVE_STAGE"           // artist performance, HLS stream
  | "AUDIENCE_ROOM"        // watching a performance
  | "PREMIUM_FRONT_ROW"    // VIP viewing area, requires ticket/tier
  | "WATCH_PARTY"          // co-watching any content
  | "BACKSTAGE"            // host-only + invited guests
  | "CYPHER_ARENA"         // battle room, voting active
  | "LIVE_CIPHER"          // free-form cypher room
  | "SPONSOR_LOUNGE"       // sponsor-funded room
  | "GAME_ROOM"            // Dirty Dozens, Deal or Feud, etc.
  | "WINNER_HALL"          // archive of crown winners
  | "PRIVATE_ROOM"         // invite-only, friends
  | "OVERFLOW_SHARD"       // auto-created when room hits capacity
  | "KARAOKE"              // queue-based karaoke
  | "COMEDY_STAGE"         // stand-up room
  | "DANCE_PARTY"          // DJ-focused dance floor
  | "OPEN_MIC"             // queue-based performance
  | "LISTEN_PARTY"         // album/playlist listening party
  | "AFTERPARTY"           // post-show hangout
  | "CREATOR_WORKSHOP";    // educational creator room

export interface RoomTypeConfig {
  type: RoomType;
  label: string;
  maxCapacity: number;
  requiresTicket: boolean;
  requiresTier?: string;       // min tier for PREMIUM_FRONT_ROW
  hasStage: boolean;
  hasQueue: boolean;          // queue for karaoke/open_mic
  hasVoting: boolean;         // cypher/crown voting
  hasGames: boolean;
  hasSponsors: boolean;
  canRecord: boolean;
  canOverflow: boolean;       // auto-create shard when full
  pointsMultiplier: number;   // how many points per 10 min in this room
  scene: string;
  audioProfile: string;
  interactions: string[];     // what actions users can take
}

export const ROOM_TYPE_REGISTRY: Record<RoomType, RoomTypeConfig> = {
  LIVE_STAGE:       { type:"LIVE_STAGE",       label:"Live Stage",          maxCapacity:10000, requiresTicket:false, hasStage:true,  hasQueue:false, hasVoting:false, hasGames:false, hasSponsors:true,  canRecord:true,  canOverflow:true,  pointsMultiplier:1.5, scene:"live-stage",        audioProfile:"stage_ambient",   interactions:["react","tip","chat","vote_hype"] },
  AUDIENCE_ROOM:    { type:"AUDIENCE_ROOM",    label:"Audience Room",        maxCapacity:500,   requiresTicket:false, hasStage:false, hasQueue:false, hasVoting:false, hasGames:false, hasSponsors:true,  canRecord:false, canOverflow:true,  pointsMultiplier:1.0, scene:"lobby",             audioProfile:"lobby_ambient",   interactions:["react","tip","chat"] },
  PREMIUM_FRONT_ROW:{ type:"PREMIUM_FRONT_ROW",label:"Premium Front Row",    maxCapacity:50,    requiresTicket:true,  hasStage:false, hasQueue:false, hasVoting:false, hasGames:false, hasSponsors:false, canRecord:false, canOverflow:false, pointsMultiplier:2.0, scene:"live-stage",        audioProfile:"stage_ambient",   interactions:["react","tip","chat","send_gift"], requiresTier:"GOLD" },
  WATCH_PARTY:      { type:"WATCH_PARTY",      label:"Watch Party",          maxCapacity:100,   requiresTicket:false, hasStage:false, hasQueue:false, hasVoting:false, hasGames:false, hasSponsors:false, canRecord:false, canOverflow:false, pointsMultiplier:1.0, scene:"lobby",             audioProfile:"lobby_ambient",   interactions:["react","chat","sync_vote"] },
  BACKSTAGE:        { type:"BACKSTAGE",        label:"Backstage",            maxCapacity:20,    requiresTicket:true,  hasStage:false, hasQueue:false, hasVoting:false, hasGames:false, hasSponsors:false, canRecord:false, canOverflow:false, pointsMultiplier:2.5, scene:"backstage",         audioProfile:"backstage",       interactions:["chat","react","send_gift"] },
  CYPHER_ARENA:     { type:"CYPHER_ARENA",     label:"Cypher Arena",         maxCapacity:200,   requiresTicket:false, hasStage:true,  hasQueue:false, hasVoting:true,  hasGames:false, hasSponsors:true,  canRecord:true,  canOverflow:true,  pointsMultiplier:2.0, scene:"underground-cypher",audioProfile:"cypher_beat",     interactions:["vote","react","tip","chat","cheer"] },
  LIVE_CIPHER:      { type:"LIVE_CIPHER",      label:"Live Cipher",          maxCapacity:50,    requiresTicket:false, hasStage:false, hasQueue:true,  hasVoting:true,  hasGames:false, hasSponsors:false, canRecord:false, canOverflow:false, pointsMultiplier:1.5, scene:"underground-cypher",audioProfile:"cypher_beat",     interactions:["vote","react","chat","queue_join"] },
  SPONSOR_LOUNGE:   { type:"SPONSOR_LOUNGE",   label:"Sponsor Lounge",       maxCapacity:100,   requiresTicket:false, hasStage:false, hasQueue:false, hasVoting:false, hasGames:false, hasSponsors:true,  canRecord:false, canOverflow:false, pointsMultiplier:1.0, scene:"sponsor-showcase",  audioProfile:"sponsor_neutral", interactions:["react","chat","claim_offer"] },
  GAME_ROOM:        { type:"GAME_ROOM",        label:"Game Room",            maxCapacity:150,   requiresTicket:false, hasStage:true,  hasQueue:false, hasVoting:true,  hasGames:true,  hasSponsors:true,  canRecord:true,  canOverflow:false, pointsMultiplier:2.5, scene:"game-night",        audioProfile:"game_show",       interactions:["vote","buzz_in","chat","react","claim_reward"] },
  WINNER_HALL:      { type:"WINNER_HALL",      label:"Winner's Hall",        maxCapacity:50,    requiresTicket:false, hasStage:false, hasQueue:false, hasVoting:false, hasGames:false, hasSponsors:false, canRecord:false, canOverflow:false, pointsMultiplier:0.5, scene:"hall-of-fame",      audioProfile:"triumphant",      interactions:["react","view_replay"] },
  PRIVATE_ROOM:     { type:"PRIVATE_ROOM",     label:"Private Room",         maxCapacity:20,    requiresTicket:false, hasStage:false, hasQueue:false, hasVoting:false, hasGames:false, hasSponsors:false, canRecord:false, canOverflow:false, pointsMultiplier:0.5, scene:"backstage",         audioProfile:"backstage",       interactions:["chat","react","tip"] },
  OVERFLOW_SHARD:   { type:"OVERFLOW_SHARD",   label:"Overflow Room",        maxCapacity:10000, requiresTicket:false, hasStage:false, hasQueue:false, hasVoting:false, hasGames:false, hasSponsors:true,  canRecord:true,  canOverflow:false, pointsMultiplier:1.0, scene:"live-stage",        audioProfile:"stage_ambient",   interactions:["react","tip","chat"] },
  KARAOKE:          { type:"KARAOKE",          label:"Karaoke Room",         maxCapacity:30,    requiresTicket:false, hasStage:true,  hasQueue:true,  hasVoting:false, hasGames:false, hasSponsors:false, canRecord:false, canOverflow:false, pointsMultiplier:1.5, scene:"lobby",             audioProfile:"lobby_ambient",   interactions:["queue_join","react","chat","tip"] },
  COMEDY_STAGE:     { type:"COMEDY_STAGE",     label:"Comedy Stage",         maxCapacity:80,    requiresTicket:false, hasStage:true,  hasQueue:false, hasVoting:false, hasGames:false, hasSponsors:true,  canRecord:true,  canOverflow:false, pointsMultiplier:1.0, scene:"live-stage",        audioProfile:"stage_ambient",   interactions:["react","tip","chat"] },
  DANCE_PARTY:      { type:"DANCE_PARTY",      label:"Dance Party",          maxCapacity:200,   requiresTicket:false, hasStage:false, hasQueue:false, hasVoting:false, hasGames:false, hasSponsors:true,  canRecord:false, canOverflow:true,  pointsMultiplier:1.0, scene:"neon-club",         audioProfile:"afterparty",      interactions:["react","tip","emote","chat"] },
  OPEN_MIC:         { type:"OPEN_MIC",         label:"Open Mic",             maxCapacity:100,   requiresTicket:false, hasStage:true,  hasQueue:true,  hasVoting:true,  hasGames:false, hasSponsors:false, canRecord:true,  canOverflow:false, pointsMultiplier:1.5, scene:"live-stage",        audioProfile:"stage_ambient",   interactions:["queue_join","vote","react","tip","chat"] },
  LISTEN_PARTY:     { type:"LISTEN_PARTY",     label:"Listen Party",         maxCapacity:50,    requiresTicket:false, hasStage:false, hasQueue:false, hasVoting:false, hasGames:false, hasSponsors:false, canRecord:false, canOverflow:false, pointsMultiplier:1.0, scene:"lobby",             audioProfile:"editorial",       interactions:["react","chat","sync_vote"] },
  AFTERPARTY:       { type:"AFTERPARTY",       label:"Afterparty",           maxCapacity:200,   requiresTicket:false, hasStage:false, hasQueue:false, hasVoting:false, hasGames:false, hasSponsors:true,  canRecord:false, canOverflow:false, pointsMultiplier:0.5, scene:"neon-club",         audioProfile:"afterparty",      interactions:["react","tip","emote","chat"] },
  CREATOR_WORKSHOP: { type:"CREATOR_WORKSHOP", label:"Creator Workshop",     maxCapacity:30,    requiresTicket:false, hasStage:false, hasQueue:false, hasVoting:false, hasGames:false, hasSponsors:false, canRecord:false, canOverflow:false, pointsMultiplier:1.0, scene:"studio",            audioProfile:"studio_silence",  interactions:["chat","react","ask_question"] },
};
