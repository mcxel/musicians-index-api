/**
 * CanonicalPerformanceGlueDirector — scaffold only.
 * Modes OFF | LIGHT | BALANCED | TIGHT; control AUTO | ASSIST | MANUAL.
 * Does NOT create a second AudioOwner. Marks unimplemented DSP as OFF / NOT INTEGRATED.
 */

import type { GlueErrorCode, MixerSystemHealth, SystemPowerState } from "./MixerErrorCodes";

export type PerformanceGlueMode = "OFF" | "LIGHT" | "BALANCED" | "TIGHT";
export type PerformanceGlueControl = "AUTO" | "ASSIST" | "MANUAL";

export type GlueDspFeatureId =
  | "SPECTRAL_MASKING"
  | "SONG_SCENES"
  | "CROSSFADE_SMART"
  | "DUCKING_GLUE"
  | "LATENCY_ALIGN";

export interface GlueDspFeatureState {
  featureId: GlueDspFeatureId;
  powerState: SystemPowerState;
  detail: string;
}

export interface PerformanceClockBinding {
  bound: boolean;
  source: "NONE" | "SESSION_TIMER" | "GAUNTLET_CLOCK" | "EXTERNAL";
  roomId: string | null;
  liveSessionId: string | null;
}

export interface PerformanceGlueSnapshot {
  mode: PerformanceGlueMode;
  control: PerformanceGlueControl;
  powerState: SystemPowerState;
  clock: PerformanceClockBinding;
  features: GlueDspFeatureState[];
  lastCode?: GlueErrorCode;
  notes: string;
}

const FEATURE_DEFAULTS: GlueDspFeatureState[] = [
  {
    featureId: "SPECTRAL_MASKING",
    powerState: "IMPLEMENTED_NOT_INTEGRATED",
    detail: "GLUE-003 — spectral masking not wired to AudioOwner",
  },
  {
    featureId: "SONG_SCENES",
    powerState: "IMPLEMENTED_NOT_INTEGRATED",
    detail: "GLUE-004 — song scenes not wired",
  },
  {
    featureId: "CROSSFADE_SMART",
    powerState: "OFF",
    detail: "Not built",
  },
  {
    featureId: "DUCKING_GLUE",
    powerState: "IMPLEMENTED_NOT_INTEGRATED",
    detail: "Rehearsal/Safety ducking math exists; glue layer not connected",
  },
  {
    featureId: "LATENCY_ALIGN",
    powerState: "OFF",
    detail: "Not built",
  },
];

class CanonicalPerformanceGlueDirectorImpl {
  private mode: PerformanceGlueMode = "OFF";
  private control: PerformanceGlueControl = "MANUAL";
  private clock: PerformanceClockBinding = {
    bound: false,
    source: "NONE",
    roomId: null,
    liveSessionId: null,
  };
  private lastCode: GlueErrorCode | undefined = "GLUE-001";

  setMode(mode: PerformanceGlueMode): PerformanceGlueMode {
    this.mode = mode;
    if (mode === "OFF") {
      this.lastCode = "GLUE-001";
    }
    return this.mode;
  }

  getMode(): PerformanceGlueMode {
    return this.mode;
  }

  setControl(control: PerformanceGlueControl): PerformanceGlueControl {
    // AUTO/ASSIST without live DSP stays honest scaffold
    this.control = control;
    if ((control === "AUTO" || control === "ASSIST") && this.mode !== "OFF") {
      this.lastCode = "GLUE-001";
    }
    return this.control;
  }

  getControl(): PerformanceGlueControl {
    return this.control;
  }

  bindSessionClock(input: {
    roomId: string;
    liveSessionId?: string | null;
    source?: PerformanceClockBinding["source"];
  }): PerformanceClockBinding {
    this.clock = {
      bound: true,
      source: input.source ?? "SESSION_TIMER",
      roomId: input.roomId,
      liveSessionId: input.liveSessionId ?? null,
    };
    this.lastCode = undefined;
    return { ...this.clock };
  }

  unbindClock(): void {
    this.clock = { bound: false, source: "NONE", roomId: null, liveSessionId: null };
    this.lastCode = "GLUE-002";
  }

  getSnapshot(): PerformanceGlueSnapshot {
    const active = this.mode !== "OFF";
    return {
      mode: this.mode,
      control: this.control,
      powerState: active ? "IMPLEMENTED_NOT_INTEGRATED" : "OFF",
      clock: { ...this.clock },
      features: FEATURE_DEFAULTS.map((f) => ({ ...f })),
      lastCode: this.lastCode ?? (active ? "GLUE-001" : undefined),
      notes: active
        ? "Scaffold ON (mode≠OFF) — DSP features remain IMPLEMENTED_NOT_INTEGRATED / OFF"
        : "Performance Glue OFF — no fake sync",
    };
  }

  getSystemHealth(): MixerSystemHealth[] {
    const snap = this.getSnapshot();
    return [
      {
        systemId: "PERFORMANCE_GLUE",
        powerState: snap.powerState,
        detail: snap.notes,
        lastCode: snap.lastCode,
      },
      {
        systemId: "PERFORMANCE_CLOCK",
        powerState: snap.clock.bound ? "ON" : "OFF",
        detail: snap.clock.bound
          ? `Bound source=${snap.clock.source} room=${snap.clock.roomId}`
          : "GLUE-002 — clock unbound",
        lastCode: snap.clock.bound ? undefined : "GLUE-002",
      },
    ];
  }

  reset(): void {
    this.mode = "OFF";
    this.control = "MANUAL";
    this.unbindClock();
    this.lastCode = "GLUE-001";
  }
}

export const CanonicalPerformanceGlueDirector = new CanonicalPerformanceGlueDirectorImpl();
