/**
 * Registers mixer / glue / fidelity function health into FunctionHealthRegistry.
 * DEFAULT_ONLY ≠ ON. Called once from ChannelMixerDirector bind or HUD mount.
 */

import {
  registerFunctionHealth,
  type FunctionHealthRecord,
  type PowerState,
} from "@/registries/shell/FunctionHealthRegistry";
import { ChannelMixerDirector } from "./ChannelMixerDirector";
import { CanonicalPerformanceGlueDirector } from "./CanonicalPerformanceGlueDirector";
import { FidelityIntelligenceDirector } from "./FidelityIntelligenceDirector";
import type { SystemPowerState } from "./MixerErrorCodes";

let registered = false;

function toRegistryPower(state: SystemPowerState | "DEFAULT_ONLY"): PowerState {
  if (state === "DEFAULT_ONLY") return "OFF";
  if (state === "ON" || state === "OFF" || state === "DEGRADED" || state === "IMPLEMENTED_NOT_INTEGRATED") {
    return state;
  }
  return "OFF";
}

export function ensureMixerHealthRegistered(): void {
  if (registered) return;
  registered = true;

  const systems = ChannelMixerDirector.getSystemHealth();
  const glue = CanonicalPerformanceGlueDirector.getSnapshot();
  const fidelity = FidelityIntelligenceDirector.getHealth();

  const base = (
    partial: Omit<
      FunctionHealthRecord,
      "callerCount" | "callerTypes" | "surfaceIds" | "systemTriggerIds" | "dependencies"
    > &
      Partial<FunctionHealthRecord>,
  ): FunctionHealthRecord => ({
    callerCount: partial.callerCount ?? 1,
    callerTypes: partial.callerTypes ?? ["panel-opener"],
    surfaceIds: partial.surfaceIds ?? ["venue-hud-audio", "in-room-mixer-panel"],
    systemTriggerIds: partial.systemTriggerIds ?? [],
    dependencies: partial.dependencies ?? ["ChannelMixerDirector"],
    owner: partial.owner,
    sourceFile: partial.sourceFile,
    expectedOutcome: partial.expectedOutcome,
    powerState: partial.powerState,
    detailState: partial.detailState ?? "ACTIVE+CANONICAL",
    functionId: partial.functionId,
    commandId: partial.commandId,
    requiredCapability: partial.requiredCapability,
  });

  for (const s of systems) {
    registerFunctionHealth(
      base({
        functionId: `mixer.system.${s.systemId}`,
        owner: "ChannelMixerDirector",
        sourceFile: "lib/audio/mixer/ChannelMixerDirector.ts",
        expectedOutcome: s.detail,
        powerState: toRegistryPower(s.powerState),
        detailState: s.powerState === "DEFAULT_ONLY" ? "UNKNOWN" : "ACTIVE+CANONICAL",
      }),
    );
  }

  registerFunctionHealth(
    base({
      functionId: "mixer.channelMixerDirector",
      owner: "ChannelMixerDirector",
      sourceFile: "lib/audio/mixer/ChannelMixerDirector.ts",
      expectedOutcome: "PERSONAL/PROGRAM faders → optional AudioOwner (TMIAudioSafetyMixer)",
      powerState: ChannelMixerDirector.getAudioOwnerBound() ? "ON" : "IMPLEMENTED_NOT_INTEGRATED",
      detailState: "ACTIVE+CANONICAL",
      dependencies: ["TMIAudioSafetyMixer"],
    }),
  );

  registerFunctionHealth(
    base({
      functionId: "mixer.performanceGlue",
      owner: "CanonicalPerformanceGlueDirector",
      sourceFile: "lib/audio/mixer/CanonicalPerformanceGlueDirector.ts",
      expectedOutcome: glue.notes,
      powerState: toRegistryPower(glue.powerState),
      detailState: "ACTIVE+CANONICAL",
    }),
  );

  registerFunctionHealth(
    base({
      functionId: "mixer.fidelityIntelligence",
      owner: "FidelityIntelligenceDirector",
      sourceFile: "lib/audio/mixer/FidelityIntelligenceDirector.ts",
      expectedOutcome: fidelity.notes,
      powerState: toRegistryPower(fidelity.powerState),
      detailState: "ACTIVE+CANONICAL",
    }),
  );
}
