// apps/web/src/lib/shows/monday-night/booMeter.engine.ts
// The crowd pressure system for Marcel's Monday Night Stage.
// Performer hears boos getting louder as pressure rises.
// 3 stages: warning → danger → elimination

export type BooStage = "clear" | "mild_warning" | "danger" | "elimination";

export interface BooMeterState {
  pressure: number;          // 0-100 (0=clear, 100=elimination)
  stage: BooStage;
  booIntensity: number;      // audio volume multiplier 0-1
  audienceVolume: number;    // crowd audio level 0-1
  warningsFired: number;
  recoveryWindowOpen: boolean;
  recoveryTimeRemainingMs: number;
  performerCanHearBoos: boolean;  // true when pressure > 30
  kirasNextAction: "none" | "warn" | "urgent_warn" | "call_bebo";
}

// Thresholds
export const BOO_THRESHOLDS = {
  MILD_WARNING:  30,   // Kira gives soft warning
  DANGER:        60,   // Kira urgent warning, red lighting
  ELIMINATION:   85,   // Bebo enters
  RECOVERY_WINDOW_MS: 20000,  // 20 second recovery window before threshold locks
} as const;

export function calculateBooStage(pressure: number): BooStage {
  if (pressure >= BOO_THRESHOLDS.ELIMINATION) return "elimination";
  if (pressure >= BOO_THRESHOLDS.DANGER) return "danger";
  if (pressure >= BOO_THRESHOLDS.MILD_WARNING) return "mild_warning";
  return "clear";
}

export function updateBooMeter(current: BooMeterState, crowdVotes: { boo: number; cheer: number }): BooMeterState {
  // Boos push pressure up, cheers bring it down
  const booPressure = (crowdVotes.boo / Math.max(1, crowdVotes.boo + crowdVotes.cheer)) * 100;
  const delta = (booPressure - 50) * 0.3;  // gradual change
  const newPressure = Math.max(0, Math.min(100, current.pressure + delta));
  const stage = calculateBooStage(newPressure);

  const performerCanHearBoos = newPressure > 30;
  const booIntensity = Math.min(1, newPressure / 100);
  const audienceVolume = 0.3 + (newPressure / 100) * 0.7;

  let kirasNextAction: BooMeterState["kirasNextAction"] = "none";
  if (stage === "elimination" && !current.recoveryWindowOpen) kirasNextAction = "call_bebo";
  else if (stage === "danger") kirasNextAction = "urgent_warn";
  else if (stage === "mild_warning") kirasNextAction = "warn";

  return {
    ...current,
    pressure: newPressure,
    stage,
    booIntensity,
    audienceVolume,
    performerCanHearBoos,
    kirasNextAction,
    recoveryWindowOpen: stage === "danger" && !current.recoveryWindowOpen,
  };
}
