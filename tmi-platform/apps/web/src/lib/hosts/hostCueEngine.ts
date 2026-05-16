type CueEvent = {
  id: string;
  hostId: string;
  cue: string;
  timestamp: number;
};

const cueLog: CueEvent[] = [];
let cueCounter = 1;

export function fireHostCue(hostId: string, cue: string): CueEvent {
  const event: CueEvent = {
    id: `HCUE-${String(cueCounter++).padStart(5, "0")}`,
    hostId,
    cue,
    timestamp: Date.now(),
  };
  cueLog.push(event);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("tmi:host-cue", { detail: event }));
  }
  return event;
}

export function getHostCueLog(): CueEvent[] {
  return [...cueLog];
}
