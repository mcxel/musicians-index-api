// packages/venue-engine/src/performerStage.engine.ts
// Controls everything about a performer's active stage experience.

export type StageRole = "SOLO_PERFORMER" | "HOST" | "CO_HOST" | "FEATURED_GUEST" | "BATTLE_MC_A" | "BATTLE_MC_B" | "JUDGE" | "GAME_SHOW_HOST" | "AUDIENCE_CHALLENGER";

export interface PerformerOnStage {
  userId: string;
  stageName: string;
  role: StageRole;
  position: { x: number; y: number };   // 0-100 percentage of stage
  cameraMode: "FULL_FACE" | "HALF_SCREEN" | "SPLIT" | "PIP" | "HIDDEN" | "COMMENTARY";
  isLive: boolean;
  isMuted: boolean;
  spotlightActive: boolean;
  avatarEquipped?: string;         // Julius or custom avatar
  motionPreset?: string;
  currentSegment?: string;         // "performing" | "talking" | "judging" | "intro" | "outro"
}

export interface StageLayout {
  layoutId: string;
  name: string;
  description: string;
  slots: Array<{ slotId: string; role: StageRole; defaultPosition: { x: number; y: number }; isRequired: boolean }>;
  supportsCameraSwitch: boolean;
  supportsVideoPlayback: boolean;    // for artist music video shows
  sponsorOverlayZones: string[];
}

// Camera modes for the video+talk feature you designed
export const VIDEO_TALK_MODES = {
  FULL_VIDEO:    { hostVisible: false, videoFull: true,  pip: false,  description: "Video fills screen, host hidden" },
  SPLIT_SCREEN:  { hostVisible: true,  videoFull: false, pip: false,  description: "50/50 host + video side by side" },
  PIP:           { hostVisible: true,  videoFull: true,  pip: true,   description: "Video full, host as small overlay" },
  COMMENTARY:    { hostVisible: true,  videoFull: false, pip: false,  description: "Video paused, host speaks, then resumes" },
} as const;

export type VideoTalkMode = keyof typeof VIDEO_TALK_MODES;

export const STAGE_LAYOUTS: Record<string, StageLayout> = {
  solo_performer: {
    layoutId:"solo_performer", name:"Solo Performer", description:"One artist, centered stage",
    slots:[{ slotId:"center", role:"SOLO_PERFORMER", defaultPosition:{x:50,y:50}, isRequired:true }],
    supportsCameraSwitch:true, supportsVideoPlayback:true, sponsorOverlayZones:["lower_third","corner_badge"],
  },
  host_plus_guest: {
    layoutId:"host_plus_guest", name:"Host + Guest", description:"Interview or duo format",
    slots:[
      { slotId:"host",  role:"HOST",           defaultPosition:{x:25,y:50}, isRequired:true },
      { slotId:"guest", role:"FEATURED_GUEST",  defaultPosition:{x:75,y:50}, isRequired:false },
    ],
    supportsCameraSwitch:true, supportsVideoPlayback:false, sponsorOverlayZones:["lower_third","banner_top"],
  },
  cypher_battle: {
    layoutId:"cypher_battle", name:"Cypher Battle", description:"1v1 battle with host",
    slots:[
      { slotId:"mc_a",  role:"BATTLE_MC_A",    defaultPosition:{x:20,y:50}, isRequired:true },
      { slotId:"mc_b",  role:"BATTLE_MC_B",    defaultPosition:{x:80,y:50}, isRequired:true },
      { slotId:"host",  role:"HOST",           defaultPosition:{x:50,y:20}, isRequired:true },
    ],
    supportsCameraSwitch:true, supportsVideoPlayback:false, sponsorOverlayZones:["scoreboard","lower_third"],
  },
  game_show: {
    layoutId:"game_show", name:"Game Show", description:"Host + contestants for game shows",
    slots:[
      { slotId:"host",       role:"GAME_SHOW_HOST",     defaultPosition:{x:50,y:30}, isRequired:true },
      { slotId:"player_1",   role:"AUDIENCE_CHALLENGER", defaultPosition:{x:25,y:70}, isRequired:false },
      { slotId:"player_2",   role:"AUDIENCE_CHALLENGER", defaultPosition:{x:75,y:70}, isRequired:false },
    ],
    supportsCameraSwitch:true, supportsVideoPlayback:false, sponsorOverlayZones:["scoreboard","lower_third","corner_badge","sponsor_bug"],
  },
};

// Host control actions (17 locked from Pack 46)
export type HostControlAction =
  | "SWITCH_CAMERA_MODE" | "TOGGLE_VIDEO_PLAYBACK" | "SWITCH_VIDEO_TALK_MODE"
  | "SPOTLIGHT_ARTIST" | "MUTE_GUEST" | "UNMUTE_GUEST" | "ADD_LOWER_THIRD"
  | "TRIGGER_SPONSOR_MOMENT" | "LAUNCH_POLL" | "LAUNCH_GAME" | "TRIGGER_REWARD_DROP"
  | "OPEN_STAGE_QUEUE" | "CLOSE_STAGE_QUEUE" | "PROMOTE_TO_STAGE" | "REMOVE_FROM_STAGE"
  | "TRIGGER_WINNER_REVEAL" | "END_SHOW";
