/**
 * RuntimeTelemetry — honest render health (Rule 20: null until measured).
 */

import type { AwrQualityContractId, RenderHealthSnapshot } from "./types";
import { getPerformanceGovernorSnapshot } from "./PerformanceGovernor";
import { getDevicePresentationTier } from "./PerformanceGovernor";
import { getFrameBudgetSamples } from "./FrameBudgetScheduler";
import { LIVE_LOBBY_WALL_CONTRACT_ID } from "./qualityContracts/LIVE_LOBBY_WALL";

let activeConsumers = new Set<AwrQualityContractId>();

export function registerAwrConsumer(contractId: AwrQualityContractId): void {
  activeConsumers.add(contractId);
}

export function unregisterAwrConsumer(contractId: AwrQualityContractId): void {
  activeConsumers.delete(contractId);
}

export function getActiveAwrConsumers(): readonly AwrQualityContractId[] {
  return [...activeConsumers];
}

export function getRenderHealthSnapshot(
  contractId: AwrQualityContractId = LIVE_LOBBY_WALL_CONTRACT_ID,
): RenderHealthSnapshot {
  const gov = getPerformanceGovernorSnapshot();
  const samples = getFrameBudgetSamples().length;
  const telemetryState =
    activeConsumers.size === 0
      ? "idle"
      : samples < 8
        ? "collecting"
        : "ready";

  return {
    contractId,
    telemetryState,
    estimatedFps: gov.estimatedFps,
    averageFrameMs: gov.averageFrameMs,
    presentationTier: gov.presentationTier,
    deviceTier: getDevicePresentationTier(),
    notes:
      telemetryState === "ready"
        ? "Frame budget from requestAnimationFrame deltas."
        : telemetryState === "collecting"
          ? "Collecting frame samples…"
          : "No AWR consumer mounted.",
  };
}
