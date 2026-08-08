/**
 * TMIAdaptiveExperienceRuntime — single platform layer for presentation-cost governance.
 * Does not mutate registries, seats, rewards, or authoritative live truth (Rule 22).
 */

import type { AwrQualityContractId } from "./types";
import { profileDeviceCapability, resetDeviceCapabilityCache } from "./DeviceCapabilityProfiler";
import {
  startFrameBudgetScheduler,
  stopFrameBudgetScheduler,
  clearFrameBudgetSamples,
} from "./FrameBudgetScheduler";
import { resetQualityAdaptation } from "./QualityAdaptationEngine";
import {
  registerAwrConsumer,
  unregisterAwrConsumer,
  getRenderHealthSnapshot,
} from "./RuntimeTelemetry";
import { experienceOptimizationEngine } from "@/lib/learning/ExperienceOptimizationEngine";

const consumerRefCount = new Map<AwrQualityContractId, number>();

function addConsumer(id: AwrQualityContractId): void {
  const n = (consumerRefCount.get(id) ?? 0) + 1;
  consumerRefCount.set(id, n);
  if (n === 1) registerAwrConsumer(id);
  startFrameBudgetScheduler();
  profileDeviceCapability(true);
}

function removeConsumer(id: AwrQualityContractId): void {
  const n = (consumerRefCount.get(id) ?? 0) - 1;
  if (n <= 0) {
    consumerRefCount.delete(id);
    unregisterAwrConsumer(id);
  } else {
    consumerRefCount.set(id, n);
  }
  if (consumerRefCount.size === 0) {
    stopFrameBudgetScheduler();
  }
}

export class TMIAdaptiveExperienceRuntime {
  /** Mount a quality-contract consumer (e.g. LIVE_LOBBY_WALL grid). */
  attachConsumer(contractId: AwrQualityContractId): () => void {
    addConsumer(contractId);
    return () => removeConsumer(contractId);
  }

  resetSession(): void {
    resetDeviceCapabilityCache();
    clearFrameBudgetSamples();
    resetQualityAdaptation();
  }

  /** Observatory / admin — recommendations only; never auto-applied. */
  getOptimizationDirectives() {
    return experienceOptimizationEngine.generateDirectives();
  }

  getRenderHealth(contractId?: AwrQualityContractId) {
    return getRenderHealthSnapshot(contractId);
  }
}

let runtime: TMIAdaptiveExperienceRuntime | null = null;

export function getAdaptiveWorldRuntime(): TMIAdaptiveExperienceRuntime {
  if (!runtime) runtime = new TMIAdaptiveExperienceRuntime();
  return runtime;
}

/** Alias for module map convergence. */
export const getTMIAdaptiveExperienceRuntime = getAdaptiveWorldRuntime;
