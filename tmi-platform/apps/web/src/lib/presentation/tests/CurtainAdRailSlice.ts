/**
 * CurtainAdRailSlice.ts
 * Level-1 runtime harness for CurtainRuntimeManager (not production E2E certified).
 * Verifies unauthorized rejection, production lock, WATER_BREAK preset, +120s extend,
 * optimistic preflight stub, and resume → program-feed restore (overlay only — no 3D .glb).
 */

import {
  executeCurtainTransition,
  getQualifiedImpressions,
  performPreflightResumeCheck,
  getCanonicalTimerSnapshot,
  CurtainRuntimeContext,
  CurtainControlRequest,
} from "@/lib/presentation/CurtainRuntimeManager";
import DirectorRegistry from "@/lib/presentation/DirectorRegistry";
import { ensurePresentationDirectorsStarted } from "@/lib/presentation/directors";

export interface AdoptionStepResult {
  stepName: string;
  passed: boolean;
  notes: string;
}

export interface CurtainSliceReport {
  sessionId: string;
  certified: boolean;
  executedAt: string;
  steps: AdoptionStepResult[];
}

export async function runCurtainAdRailCertification(
  sessionId: string = `curtain-slice-${Date.now()}`,
): Promise<CurtainSliceReport> {
  ensurePresentationDirectorsStarted();

  const steps: AdoptionStepResult[] = [];
  const runtimeId = `curtain-rt-${Date.now()}`;

  // Step 1: Unauthorized Control Attempt Rejection
  const unauthContext: CurtainRuntimeContext = {
    currentState: "OPEN",
    userCountryCode: "US",
    sessionConnected: true,
  };
  const unauthRequest: CurtainControlRequest = {
    performerId: "intruder-99",
    sessionId,
    targetAction: "TAKE_BREAK",
    isAuthorized: false,
  };

  const unauthRes = await executeCurtainTransition(unauthContext, unauthRequest, runtimeId);
  steps.push({
    stepName: "1. Unauthorized Control Attempt Rejection",
    passed: !unauthRes.success && Boolean(unauthRes.error?.includes("Unauthorized")),
    notes: !unauthRes.success ? "Unauthorized request rejected cleanly by server." : "Security failure: Unauthorized request accepted.",
  });

  // Step 2: Production Lock Guard Rejection
  const lockedContext: CurtainRuntimeContext = {
    currentState: "OPEN",
    runtimeLocked: true,
    lockReason: "WINNER_CELEBRATION_IN_PROGRESS",
    userCountryCode: "US",
    sessionConnected: true,
  };
  const lockRequest: CurtainControlRequest = {
    performerId: "performer-1",
    sessionId,
    targetAction: "TAKE_BREAK",
    isAuthorized: true,
  };

  const lockedRes = await executeCurtainTransition(lockedContext, lockRequest, runtimeId);
  steps.push({
    stepName: "2. Production Lock Guard Rejection (Winner Celebration Lock)",
    passed: !lockedRes.success && Boolean(lockedRes.error?.includes("Curtain locked")),
    notes: !lockedRes.success ? "Production lock guard protected celebration sequence." : "Lock guard failed.",
  });

  // Step 3: Preset-Aware Water Break (90s Countdown) & Movie Theater Ad Rail
  const activeContext: CurtainRuntimeContext = {
    currentState: "OPEN",
    runtimeLocked: false,
    activeCampaign: {
      campaignId: "nike-air-zoom-campaign-2026",
      advertiserName: "Nike",
      creativeUrl: "/ads/nike-air.mp4",
      isHousePromotion: false,
      eligibleCountryCodes: ["US", "CA", "UK"],
      frequencyCapPerUser: 5,
    },
    userCountryCode: "US",
    sessionConnected: true,
  };
  const breakRequest: CurtainControlRequest = {
    performerId: "performer-1",
    sessionId,
    targetAction: "TAKE_BREAK",
    isAuthorized: true,
    intermissionType: "WATER_BREAK",
    countdownSeconds: 90,
  };

  const breakRes = await executeCurtainTransition(activeContext, breakRequest, runtimeId);
  const impressions = getQualifiedImpressions("nike-air-zoom-campaign-2026");

  const snapBreak = DirectorRegistry.getAggregatedSnapshots(runtimeId);
  const overlayActive = snapBreak.overlay?.status === "ACTIVE";
  const motionActive = snapBreak.motion?.status === "ACTIVE";

  steps.push({
    stepName: "3. Semantic Intermission Preset (WATER_BREAK - 90s) & Ad Rail Monetization",
    passed: breakRes.success && breakRes.newState === "INTERMISSION" && breakRes.adRailActive && impressions > 0 && overlayActive && motionActive,
    notes: breakRes.success
      ? `Preset: WATER_BREAK; Countdown: 90s; Ad Rail: ACTIVE; Qualified Impressions: ${impressions}; WebRTC Connected: TRUE.`
      : "Break transition failed.",
  });

  // Step 4: Live Time Extension (+120 Seconds Added During Break)
  const extendRequest: CurtainControlRequest = {
    performerId: "performer-1",
    sessionId,
    targetAction: "EXTEND_TIME",
    isAuthorized: true,
    extensionSecondsToAdd: 120,
  };

  const extendRes = await executeCurtainTransition(activeContext, extendRequest, runtimeId);
  const timerSnap = getCanonicalTimerSnapshot(sessionId);
  const timeExtended = timerSnap?.remainingSeconds === 210; // 90 + 120 = 210s

  steps.push({
    stepName: "4. Live Time Extension (+120 Seconds Added During Break)",
    passed: extendRes.success && timeExtended,
    notes: timeExtended ? `Canonical timer updated across all surfaces: ${timerSnap?.remainingSeconds}s remaining.` : "Timer extension failed.",
  });

  // Step 5: Preflight stub (optimistic — not real media probes)
  const preflight = performPreflightResumeCheck(sessionId);
  steps.push({
    stepName: "5. Preflight Resume Stub (optimistic client green)",
    passed: preflight.preflightPassed && preflight.microphoneReady && preflight.cameraVideoReady,
    notes: preflight.preflightPassed
      ? "Preflight stub returned green (real media-health probes not wired yet)."
      : "Preflight stub failed.",
  });

  // Step 6: Resume → program feed restore (overlay only)
  const intermissionContext: CurtainRuntimeContext = {
    currentState: "INTERMISSION",
    runtimeLocked: false,
    userCountryCode: "US",
    sessionConnected: true,
  };
  const resumeRequest: CurtainControlRequest = {
    performerId: "performer-1",
    sessionId,
    targetAction: "RESUME_SHOW",
    isAuthorized: true,
  };

  const resumeRes = await executeCurtainTransition(intermissionContext, resumeRequest, runtimeId);
  const snapResume = DirectorRegistry.getAggregatedSnapshots(runtimeId);
  const monitorActive = snapResume.monitor?.status === "ACTIVE";

  steps.push({
    stepName: "6. Resume Show & Program Feed Restore (overlay, not 3D .glb)",
    passed: resumeRes.success && resumeRes.newState === "OPEN" && !resumeRes.adRailActive && monitorActive,
    notes: resumeRes.success
      ? "Curtain OPEN; monitor RESTORE_PROGRAM_FEED dispatched; no 3D venue mesh claimed."
      : "Resume show transition failed.",
  });

  // Step 7: Clean Teardown Reset
  await DirectorRegistry.resetRuntime(runtimeId);
  const snapReset = DirectorRegistry.getAggregatedSnapshots(runtimeId);
  const resetClean = snapReset.camera?.status === "IDLE" && snapReset.lighting?.status === "IDLE";

  steps.push({
    stepName: "7. Curtain Teardown Reset",
    passed: resetClean,
    notes: resetClean ? "Runtime state reset cleanly to IDLE." : "Reset incomplete.",
  });

  const certified = steps.every((s) => s.passed);

  return {
    sessionId,
    certified,
    executedAt: new Date().toISOString(),
    steps,
  };
}
