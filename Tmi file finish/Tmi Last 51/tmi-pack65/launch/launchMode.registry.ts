// apps/web/src/lib/engines/launchMode.registry.ts
// All go-live options for performers and fans.
// Gold+ required for mini battle/cypher creation.

export type LaunchModeId =
  | "go_live"
  | "world_concert"
  | "world_release"
  | "scheduled_release"
  | "scheduled_concert"
  | "start_concert"
  | "mini_cypher"       // Gold+ only
  | "mini_battle"       // Gold+ only
  | "private_rehearsal"
  | "test_stream"
  | "listening_party"   // fans
  | "watch_party"       // fans
  | "start_cover_session"
  | "open_jam";

export interface LaunchMode {
  id: LaunchModeId;
  label: string;
  description: string;
  icon: string;
  requiredTier: "FREE" | "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND";
  isPerformer: boolean;
  isFan: boolean;
  roomType: string;
  startsLive: boolean;
  needsSoundCheck: boolean;
  hasPreLobby: boolean;
  autoRestart: boolean;    // after session ends, restart available immediately
  maxParticipants: number;
  primaryColor: string;
}

export const LAUNCH_MODES: Record<LaunchModeId, LaunchMode> = {
  go_live:          { id:"go_live",          label:"Go Live",              description:"Start a live session right now",                   icon:"🔴", requiredTier:"FREE",    isPerformer:true,  isFan:false, roomType:"LIVE_STAGE",    startsLive:true,  needsSoundCheck:true,  hasPreLobby:false, autoRestart:true,  maxParticipants:1000,  primaryColor:"#FF2D78" },
  world_concert:    { id:"world_concert",    label:"World Concert",        description:"Full world-accessible concert event",               icon:"🌍", requiredTier:"SILVER",  isPerformer:true,  isFan:false, roomType:"LIVE_STAGE",    startsLive:true,  needsSoundCheck:true,  hasPreLobby:true,  autoRestart:false, maxParticipants:10000, primaryColor:"#FFB800" },
  world_release:    { id:"world_release",    label:"World Release",        description:"Release music to the entire platform simultaneously", icon:"📀", requiredTier:"GOLD",    isPerformer:true,  isFan:false, roomType:"LIVE_STAGE",    startsLive:true,  needsSoundCheck:false, hasPreLobby:false, autoRestart:false, maxParticipants:10000, primaryColor:"#00E5FF" },
  scheduled_release:{ id:"scheduled_release",label:"Scheduled Release",    description:"Set a date and time for your music release",         icon:"📅", requiredTier:"SILVER",  isPerformer:true,  isFan:false, roomType:"LIVE_STAGE",    startsLive:false, needsSoundCheck:false, hasPreLobby:false, autoRestart:false, maxParticipants:0,     primaryColor:"#7B2FBE" },
  scheduled_concert:{ id:"scheduled_concert",label:"Scheduled Concert",    description:"Plan and promote a future concert",                  icon:"🎫", requiredTier:"SILVER",  isPerformer:true,  isFan:false, roomType:"LIVE_STAGE",    startsLive:false, needsSoundCheck:true,  hasPreLobby:true,  autoRestart:false, maxParticipants:0,     primaryColor:"#FF8C00" },
  start_concert:    { id:"start_concert",    label:"Start Concert",        description:"Launch a concert session immediately",               icon:"🎤", requiredTier:"GOLD",    isPerformer:true,  isFan:false, roomType:"LIVE_STAGE",    startsLive:true,  needsSoundCheck:true,  hasPreLobby:true,  autoRestart:true,  maxParticipants:5000,  primaryColor:"#FFD700" },
  mini_cypher:      { id:"mini_cypher",      label:"Start Mini Cypher",    description:"Create a quick 1v1 or group cypher battle",          icon:"🎙️", requiredTier:"GOLD",    isPerformer:true,  isFan:false, roomType:"CYPHER_ARENA",  startsLive:true,  needsSoundCheck:false, hasPreLobby:true,  autoRestart:true,  maxParticipants:100,   primaryColor:"#FF2D78" },
  mini_battle:      { id:"mini_battle",      label:"Start Mini Battle",    description:"Create a quick performance battle",                  icon:"⚔️", requiredTier:"GOLD",    isPerformer:true,  isFan:false, roomType:"LIVE_STAGE",    startsLive:true,  needsSoundCheck:false, hasPreLobby:true,  autoRestart:true,  maxParticipants:100,   primaryColor:"#7B2FBE" },
  private_rehearsal:{ id:"private_rehearsal",label:"Private Rehearsal",    description:"Practice privately while stream is tested silently",  icon:"🎬", requiredTier:"FREE",    isPerformer:true,  isFan:false, roomType:"BACKSTAGE",     startsLive:false, needsSoundCheck:true,  hasPreLobby:false, autoRestart:false, maxParticipants:1,     primaryColor:"#00B8A9" },
  test_stream:      { id:"test_stream",      label:"Test Stream",          description:"Verify your stream quality before going live",        icon:"🔧", requiredTier:"FREE",    isPerformer:true,  isFan:false, roomType:"BACKSTAGE",     startsLive:false, needsSoundCheck:true,  hasPreLobby:false, autoRestart:false, maxParticipants:1,     primaryColor:"#C0C0C0" },
  listening_party:  { id:"listening_party",  label:"Listening Party",      description:"Host a listening party for fans",                    icon:"🎧", requiredTier:"FREE",    isPerformer:false, isFan:true,  roomType:"WATCH_PARTY",   startsLive:true,  needsSoundCheck:false, hasPreLobby:false, autoRestart:false, maxParticipants:200,   primaryColor:"#00E5FF" },
  watch_party:      { id:"watch_party",      label:"Watch Party",          description:"Watch a live event together with friends",           icon:"📺", requiredTier:"FREE",    isPerformer:false, isFan:true,  roomType:"WATCH_PARTY",   startsLive:false, needsSoundCheck:false, hasPreLobby:false, autoRestart:false, maxParticipants:200,   primaryColor:"#7B2FBE" },
  start_cover_session:{ id:"start_cover_session",label:"Cover Session",    description:"Perform covers of popular songs live",               icon:"🎵", requiredTier:"FREE",    isPerformer:true,  isFan:false, roomType:"LIVE_STAGE",    startsLive:true,  needsSoundCheck:true,  hasPreLobby:false, autoRestart:true,  maxParticipants:500,   primaryColor:"#00B8A9" },
  open_jam:         { id:"open_jam",         label:"Open Jam",             description:"Open jam session — anyone can join and play",        icon:"🎸", requiredTier:"BRONZE",  isPerformer:true,  isFan:true,  roomType:"LIVE_STAGE",    startsLive:true,  needsSoundCheck:false, hasPreLobby:false, autoRestart:true,  maxParticipants:20,    primaryColor:"#FF8C00" },
};

export function getAvailableModes(tier: string, isPerformer: boolean): LaunchMode[] {
  const tierOrder = ["FREE","BRONZE","SILVER","GOLD","PLATINUM","DIAMOND"];
  const tierIdx = tierOrder.indexOf(tier);
  return Object.values(LAUNCH_MODES).filter(mode => {
    const modeIdx = tierOrder.indexOf(mode.requiredTier);
    const roleMatch = isPerformer ? mode.isPerformer : mode.isFan;
    return modeIdx <= tierIdx && roleMatch;
  });
}
