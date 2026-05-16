// HostRuntimeEngine — host mic control, stage scripts, cue management

export type CueType = "intro" | "transition" | "outro" | "ad-break" | "announce-winner" | "banter" | "hype" | "emergency";

export type StageCue = {
  id: string;
  type: CueType;
  script: string;
  triggeredAt: number | null;
  completedAt: number | null;
};

export type HostState = {
  venueSlug: string;
  hostId: string;
  hostName: string;
  micActive: boolean;
  cameraActive: boolean;
  currentScript: string | null;
  cueQueue: StageCue[];
  completedCues: StageCue[];
  announcementLog: string[];
  emergencyMode: boolean;
};

const hostRegistry = new Map<string, HostState>();

function genCueId(): string {
  return `cue-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
}

export function registerHost(venueSlug: string, hostId: string, hostName: string): HostState {
  const state: HostState = {
    venueSlug,
    hostId,
    hostName,
    micActive: false,
    cameraActive: false,
    currentScript: null,
    cueQueue: [],
    completedCues: [],
    announcementLog: [],
    emergencyMode: false,
  };
  hostRegistry.set(venueSlug, state);
  return state;
}

export function getHostState(venueSlug: string): HostState | null {
  return hostRegistry.get(venueSlug) ?? null;
}

export function activateHostMic(venueSlug: string): HostState | null {
  const state = hostRegistry.get(venueSlug);
  if (!state) return null;
  state.micActive = true;
  state.cameraActive = true;
  return state;
}

export function deactivateHostMic(venueSlug: string): HostState | null {
  const state = hostRegistry.get(venueSlug);
  if (!state) return null;
  state.micActive = false;
  state.currentScript = null;
  return state;
}

export function queueCue(venueSlug: string, type: CueType, script: string): StageCue {
  const state = hostRegistry.get(venueSlug);
  const cue: StageCue = { id: genCueId(), type, script, triggeredAt: null, completedAt: null };
  if (state) state.cueQueue.push(cue);
  return cue;
}

export function triggerNextCue(venueSlug: string): StageCue | null {
  const state = hostRegistry.get(venueSlug);
  if (!state) return null;
  const cue = state.cueQueue.shift();
  if (!cue) return null;
  cue.triggeredAt = Date.now();
  state.currentScript = cue.script;
  state.micActive = true;
  return cue;
}

export function completeCue(venueSlug: string, cueId: string): void {
  const state = hostRegistry.get(venueSlug);
  if (!state) return;
  // Find in queue or mark current
  const inQueue = state.cueQueue.find((c) => c.id === cueId);
  const cue = inQueue ?? { id: cueId, type: "banter" as CueType, script: state.currentScript ?? "", triggeredAt: Date.now(), completedAt: null };
  cue.completedAt = Date.now();
  if (inQueue) state.cueQueue = state.cueQueue.filter((c) => c.id !== cueId);
  state.completedCues.push(cue);
}

export function makeAnnouncement(venueSlug: string, text: string): void {
  const state = hostRegistry.get(venueSlug);
  if (!state) return;
  state.announcementLog.push(`[${new Date().toISOString()}] ${text}`);
}

export function triggerEmergency(venueSlug: string): void {
  const state = hostRegistry.get(venueSlug);
  if (!state) return;
  state.emergencyMode = true;
  state.micActive = true;
  state.currentScript = "EMERGENCY: This event has been paused. Please standby.";
  state.announcementLog.push(`[${new Date().toISOString()}] EMERGENCY TRIGGERED`);
}
