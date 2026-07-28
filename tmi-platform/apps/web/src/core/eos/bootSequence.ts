/**
 * EOS boot sequence — pure lifecycle orchestration (no React).
 */

import type { EosLifecycleState, EosValidationResult, RuntimeManifest } from "./types";
import { validateAllExperiences } from "./RuntimeValidator";
import { resolveRuntimeManifest } from "@/registries/eos/resolveRuntimeManifest";
import { assertAvatarRegistryIntegrity } from "@/registries/eos/AvatarRegistry";

export interface BootSequenceResult {
  finalState: EosLifecycleState;
  validation: EosValidationResult;
  testManifest?: RuntimeManifest;
  error?: string;
}

/** Runs registry validation and resolves the certification test experience. */
export function runEosBootSequence(testExperienceId = "test"): BootSequenceResult {
  let state: EosLifecycleState = "BOOT";

  try {
    state = "LOAD_REGISTRIES";
    // Phase 5A: register AvatarRegistry contracts in boot (catalogs + Rule 26 only — no mesh runtime).
    const avatarIntegrity = assertAvatarRegistryIntegrity();
    if (!avatarIntegrity.ok) {
      return {
        finalState: "CRITICAL_FAILURE",
        validation: { valid: false, errors: avatarIntegrity.errors, warnings: [] },
        error: avatarIntegrity.errors.join("; "),
      };
    }

    state = "VALIDATE";
    const validation = validateAllExperiences();
    if (!validation.valid) {
      return {
        finalState: "CRITICAL_FAILURE",
        validation,
        error: validation.errors.join("; "),
      };
    }

    state = "LOAD_ASSETS";
    state = "INITIALIZE_SERVICES";
    state = "INITIALIZE_RUNTIME";

    const testManifest = resolveRuntimeManifest(testExperienceId, "fan");

    state = "READY";
    return { finalState: "READY", validation, testManifest };
  } catch (err) {
    return {
      finalState: "CRITICAL_FAILURE",
      validation: { valid: false, errors: [String(err)], warnings: [] },
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export const EOS_LIFECYCLE_ORDER: EosLifecycleState[] = [
  "BOOT",
  "LOAD_REGISTRIES",
  "VALIDATE",
  "LOAD_ASSETS",
  "INITIALIZE_SERVICES",
  "INITIALIZE_RUNTIME",
  "READY",
  "RUNNING",
];
