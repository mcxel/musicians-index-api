/**
 * Host Motion Profile Engine
 * Defines stage movement, zone pathing, gesture packs, and entry/exit animations per host.
 */

export type StageZone =
  | 'center'
  | 'left-wing'
  | 'right-wing'
  | 'audience-walk'
  | 'judge-desk'
  | 'prize-podium'
  | 'backstage';

export interface HostMotionProfile {
  hostId: string;
  walkStyle: 'strut' | 'bounce' | 'glide' | 'stomp' | 'shuffle' | 'prowl';
  stageZones: StageZone[];
  gesturePack: string[];
  idleLoop: string;
  entryAnimation: string;
  exitAnimation: string;
}

export const HOST_MOTION_PROFILES: Record<string, HostMotionProfile> = {
  'big-ace': {
    hostId: 'big-ace',
    walkStyle: 'prowl',
    stageZones: ['center', 'left-wing', 'right-wing', 'backstage'],
    gesturePack: ['gesture-point-down', 'gesture-arms-cross', 'gesture-slow-nod', 'gesture-throne-lean'],
    idleLoop: 'idle-overseer-scan',
    entryAnimation: 'entry-throne-descend',
    exitAnimation: 'exit-fade-authority',
  },

  'bobby-stanley': {
    hostId: 'bobby-stanley',
    walkStyle: 'strut',
    stageZones: ['center', 'left-wing', 'right-wing', 'audience-walk'],
    gesturePack: ['gesture-mic-pump', 'gesture-crowd-scan', 'gesture-point-crowd', 'gesture-hold-mic-high', 'gesture-wink-forward'],
    idleLoop: 'idle-mic-swing',
    entryAnimation: 'entry-stage-walk-confident',
    exitAnimation: 'exit-crowd-salute',
  },

  'kira': {
    hostId: 'kira',
    walkStyle: 'glide',
    stageZones: ['left-wing', 'right-wing', 'audience-walk', 'center'],
    gesturePack: ['gesture-roving-mic', 'gesture-lean-in', 'gesture-crowd-wave', 'gesture-contestant-point', 'gesture-hype-clap'],
    idleLoop: 'idle-walkaround-scan',
    entryAnimation: 'entry-side-entrance-wave',
    exitAnimation: 'exit-crowd-walk-out',
  },

  'bebo': {
    hostId: 'bebo',
    walkStyle: 'bounce',
    stageZones: ['left-wing', 'right-wing', 'center', 'backstage'],
    gesturePack: ['gesture-cane-raise', 'gesture-cane-hook', 'gesture-cane-flourish', 'gesture-double-take', 'gesture-crowd-boo-react'],
    idleLoop: 'idle-cane-twirl',
    entryAnimation: 'entry-cane-tap-entrance',
    exitAnimation: 'exit-cane-walk-offstage',
  },

  'jack-obrien': {
    hostId: 'jack-obrien',
    walkStyle: 'strut',
    stageZones: ['judge-desk', 'center'],
    gesturePack: ['gesture-notepad-tap', 'gesture-finger-point-dismiss', 'gesture-arms-fold', 'gesture-chin-stroke'],
    idleLoop: 'idle-judge-lean-back',
    entryAnimation: 'entry-judge-desk-sit',
    exitAnimation: 'exit-judge-stand-walk',
  },

  'hector-lvanos': {
    hostId: 'hector-lvanos',
    walkStyle: 'prowl',
    stageZones: ['judge-desk', 'center'],
    gesturePack: ['gesture-reading-glasses-remove', 'gesture-slow-clap', 'gesture-pen-point', 'gesture-history-gesture'],
    idleLoop: 'idle-judge-contemplative',
    entryAnimation: 'entry-judge-solemn-walk',
    exitAnimation: 'exit-judge-deliberate',
  },

  'mindy-jean-long': {
    hostId: 'mindy-jean-long',
    walkStyle: 'glide',
    stageZones: ['prize-podium', 'center', 'right-wing'],
    gesturePack: ['gesture-prize-reveal-sweep', 'gesture-crowd-arms-open', 'gesture-confetti-pump', 'gesture-winner-point', 'gesture-joy-bounce'],
    idleLoop: 'idle-podium-ready',
    entryAnimation: 'entry-prize-podium-arrive',
    exitAnimation: 'exit-confetti-walk',
  },

  'julius': {
    hostId: 'julius',
    walkStyle: 'shuffle',
    stageZones: ['center', 'left-wing', 'right-wing', 'audience-walk', 'judge-desk'],
    gesturePack: ['gesture-wild-card-spin', 'gesture-sneaky-point', 'gesture-crowd-troll', 'gesture-chaos-wave', 'gesture-ref-whistle-fake'],
    idleLoop: 'idle-julius-chaotic-sway',
    entryAnimation: 'entry-julius-surprise-appear',
    exitAnimation: 'exit-julius-vanish-sidestep',
  },

  'gregory-marcel': {
    hostId: 'gregory-marcel',
    walkStyle: 'strut',
    stageZones: ['center', 'audience-walk', 'left-wing'],
    gesturePack: ['gesture-two-step-point', 'gesture-crowd-rally', 'gesture-prize-pump', 'gesture-story-lean'],
    idleLoop: 'idle-gregory-smooth-sway',
    entryAnimation: 'entry-gregory-southern-strut',
    exitAnimation: 'exit-gregory-crowd-wave',
  },

  'record-ralph': {
    hostId: 'record-ralph',
    walkStyle: 'bounce',
    stageZones: ['left-wing', 'right-wing', 'audience-walk'],
    gesturePack: ['gesture-dj-scratch', 'gesture-headphone-adjust', 'gesture-drop-signal', 'gesture-crowd-pump'],
    idleLoop: 'idle-dj-groove',
    entryAnimation: 'entry-dj-booth-walk',
    exitAnimation: 'exit-dj-fade-out',
  },

  'nova-mc': {
    hostId: 'nova-mc',
    walkStyle: 'strut',
    stageZones: ['center', 'left-wing', 'right-wing'],
    gesturePack: ['gesture-ref-stop-hand', 'gesture-round-start-point', 'gesture-foul-signal', 'gesture-winner-announce-arm'],
    idleLoop: 'idle-ref-ready-stance',
    entryAnimation: 'entry-ref-center-walk',
    exitAnimation: 'exit-ref-clear-stage',
  },

  'aura-pa': {
    hostId: 'aura-pa',
    walkStyle: 'glide',
    stageZones: ['backstage'],
    gesturePack: ['gesture-pa-mic-hold', 'gesture-pa-broadcast-pose'],
    idleLoop: 'idle-pa-standing-broadcast',
    entryAnimation: 'entry-pa-step-to-mic',
    exitAnimation: 'exit-pa-step-back',
  },
};

export function getMotionProfile(hostId: string): HostMotionProfile | undefined {
  return HOST_MOTION_PROFILES[hostId];
}
