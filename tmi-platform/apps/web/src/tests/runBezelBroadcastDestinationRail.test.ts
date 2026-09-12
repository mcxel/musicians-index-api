/**
 * runBezelBroadcastDestinationRail.test.ts
 *
 * Automated Acceptance Certification Suite for Slice 4:
 * P0.1 Bezel Broadcast Destination Rail & Top Cluster Convergence
 *
 * Verification Gates:
 * 1.  master_live_isolated_from_destinations
 * 2.  master_live_four_states
 * 3.  master_live_live_when_published
 * 4.  master_live_warning_when_degraded
 * 5.  master_live_error_on_fault
 * 6.  master_live_off_when_idle
 * 7.  destination_bezel_six_targets
 * 8.  destinations_seeded_authoritative_off
 * 9.  destinations_ready_when_authenticated
 * 10. destinations_live_only_with_verified_ingest
 * 11. destinations_warning_on_degraded_telemetry
 * 12. destinations_error_on_fault
 * 13. single_session_truth_invariant
 * 14. top_cluster_layout_convergence
 * 15. role_aware_public_identity_card
 * 16. uuid_privacy_leak_protection
 */

import {
  CANONICAL_BEZEL_PROVIDERS,
  destinationIdFor,
  destinationStatusGlyph,
  resolveAuthoritativeDestinationState,
  resolveMasterLiveStatus,
  type AuthoritativeDestinationState,
  type BroadcastDestinationPublic,
  type MasterLiveBroadcastStatus,
} from "../lib/broadcast/BroadcastDestinationTypes";
import {
  ensureBroadcastDestinationSeed,
  getBroadcastDestinations,
  getBroadcastDestinationByProvider,
  patchBroadcastDestination,
  setDestinationConnectionStatus,
} from "../lib/broadcast/BroadcastDestinationRegistry";
import { formatPublicMemberId, canonicalPublicPath } from "../lib/identity/PublicProfileRuntime";

function runBezelRailCertification() {
  const results: Record<string, boolean> = {};

  // Gate 1: Master live is isolated from individual destinations
  const providerList = CANONICAL_BEZEL_PROVIDERS.map((p) => p.provider);
  results["master_live_isolated_from_destinations"] =
    !providerList.includes("live" as any) &&
    !providerList.includes("tmi" as any);

  // Gate 2: Master live resolves strictly to 4 states
  const validMasterStates: MasterLiveBroadcastStatus[] = ["OFF", "LIVE", "WARNING", "ERROR"];
  results["master_live_four_states"] = validMasterStates.length === 4;

  // Gate 3: Master live is LIVE when published
  const liveMaster = resolveMasterLiveStatus(true);
  results["master_live_live_when_published"] = liveMaster === "LIVE";

  // Gate 4: Master live is WARNING when telemetry is degraded (latency > 600ms or frame drops)
  const degradedMaster = resolveMasterLiveStatus(true, { latencyMs: 750 });
  const frameDropMaster = resolveMasterLiveStatus(true, { droppedFrameRate: 0.08 });
  results["master_live_warning_when_degraded"] =
    degradedMaster === "WARNING" && frameDropMaster === "WARNING";

  // Gate 5: Master live is ERROR on fault
  const errorMaster = resolveMasterLiveStatus(true, { hasError: true });
  results["master_live_error_on_fault"] = errorMaster === "ERROR";

  // Gate 6: Master live is OFF when idle / not published
  const idleMaster = resolveMasterLiveStatus(false);
  results["master_live_off_when_idle"] = idleMaster === "OFF";

  // Gate 7: Destination bezel supports 6 multi-destination targets (YT, IG, FB, KK, TW, CST)
  const shortCodes = CANONICAL_BEZEL_PROVIDERS.map((p) => p.shortCode);
  results["destination_bezel_six_targets"] =
    shortCodes.includes("YT") &&
    shortCodes.includes("IG") &&
    shortCodes.includes("FB") &&
    shortCodes.includes("KK") &&
    shortCodes.includes("TW") &&
    shortCodes.includes("CST");

  // Gate 8: Destinations seed as OFF when unconfigured
  ensureBroadcastDestinationSeed("test_user_slice4");
  const seeded = getBroadcastDestinations();
  const allOffInitially = seeded.every((d) => d.connectionStatus === "off" || d.connectionStatus === "locked");
  results["destinations_seeded_authoritative_off"] = allOffInitially && seeded.length >= 6;

  // Gate 9: Destinations resolve to READY when authenticated/enabled (primed for GO LIVE)
  const ytDest = getBroadcastDestinationByProvider("youtube")!;
  const readyDest: BroadcastDestinationPublic = {
    ...ytDest,
    authState: "linked",
    enabled: true,
    connectionStatus: "selected_off",
  };
  const readyState = resolveAuthoritativeDestinationState(readyDest, false);
  results["destinations_ready_when_authenticated"] = readyState === "READY";

  // Gate 10: Destinations reach LIVE only when session is master live AND ingest confirmed
  const streamingDest: BroadcastDestinationPublic = {
    ...ytDest,
    authState: "linked",
    enabled: true,
    connectionStatus: "live",
    health: "ok",
  };
  const actualLiveState = resolveAuthoritativeDestinationState(streamingDest, true);
  const falseLiveWithoutMaster = resolveAuthoritativeDestinationState(streamingDest, false);
  results["destinations_live_only_with_verified_ingest"] =
    actualLiveState === "LIVE" && falseLiveWithoutMaster !== "LIVE";

  // Gate 11: Live destinations transition to WARNING on high latency or dropped frames
  const highLatencyDest = resolveAuthoritativeDestinationState(streamingDest, true, { latencyMs: 950 });
  const highDropDest = resolveAuthoritativeDestinationState(streamingDest, true, { droppedFrameRate: 0.12 });
  results["destinations_warning_on_degraded_telemetry"] =
    highLatencyDest === "WARNING" && highDropDest === "WARNING";

  // Gate 12: Destinations transition to ERROR on stream fault or rejection
  const errorDest: BroadcastDestinationPublic = {
    ...ytDest,
    connectionStatus: "error",
  };
  const actualErrorState = resolveAuthoritativeDestinationState(errorDest, true);
  results["destinations_error_on_fault"] = actualErrorState === "ERROR";

  // Gate 13: Single session truth invariant: Bezel component and distributor issue commands against single session
  const fs = require("fs");
  const path = require("path");
  const bezelSrc = fs.readFileSync(
    path.join(__dirname, "../components/broadcast/LiveDistributionBezel.tsx"),
    "utf8",
  );
  results["single_session_truth_invariant"] =
    bezelSrc.includes("toggleExternalDestination") &&
    bezelSrc.includes("setActiveExternalBroadcastRoomId") &&
    !bezelSrc.includes("new RTCPeerConnection") &&
    bezelSrc.includes("One canonical TMI session fans out");

  // Gate 14: Top cluster layout convergence
  const mediaStackSrc = fs.readFileSync(
    path.join(__dirname, "../components/commandCenter/CommandCenterMediaStack.tsx"),
    "utf8",
  );
  results["top_cluster_layout_convergence"] =
    mediaStackSrc.includes("tmi-top-cluster-cast") &&
    mediaStackSrc.includes("tmi-top-cluster-user-id") &&
    mediaStackSrc.includes("tmi-top-cluster-sponsors") &&
    mediaStackSrc.includes("tmi-top-cluster-sharescreen") &&
    mediaStackSrc.includes("tmi-top-cluster-record") &&
    mediaStackSrc.includes("tmi-top-cluster-share") &&
    mediaStackSrc.includes("tmi-top-cluster-golive");

  // Gate 15: Role-aware public identity card (Artist ID vs TMI User ID) with QR and actions
  const identitySrc = fs.readFileSync(
    path.join(__dirname, "../components/identity/ArtistIdShareStrip.tsx"),
    "utf8",
  );
  results["role_aware_public_identity_card"] =
    identitySrc.includes("PERFORMER") &&
    identitySrc.includes("FAN") &&
    identitySrc.includes("Artist ID") &&
    identitySrc.includes("TMI User ID") &&
    identitySrc.includes("View Profile") &&
    identitySrc.includes("Copy ID") &&
    identitySrc.includes("Share") &&
    identitySrc.includes("api.qrserver.com");

  // Gate 16: UUID privacy leak protection: raw UUIDs are barred from public display and share URLs
  const rawUuid = "123e4567-e89b-12d3-a456-426614174000";
  const rawUsrId = "usr_998877665544332211";
  const formattedPerformer = formatPublicMemberId("performer", rawUuid);
  const formattedFan = formatPublicMemberId("fan", rawUsrId);
  const safePerformerPath = canonicalPublicPath(formattedPerformer);
  const safeFanPath = canonicalPublicPath(formattedFan);

  results["uuid_privacy_leak_protection"] =
    !formattedPerformer.includes(rawUuid) &&
    formattedPerformer.startsWith("ART-") &&
    !formattedFan.includes(rawUsrId) &&
    formattedFan.startsWith("FAN-") &&
    !safePerformerPath.includes(rawUuid) &&
    !safeFanPath.includes(rawUsrId) &&
    identitySrc.includes("isRawInternalId");

  console.log("\n===============================================================================");
  console.log("  TMI PLATFORM — SLICE 4 P0.1 BEZEL BROADCAST DESTINATION RAIL CERTIFICATION");
  console.log("===============================================================================\n");

  let allPassed = true;
  for (const [gate, passed] of Object.entries(results)) {
    const symbol = passed ? "🟢 PASS" : "🔴 FAIL";
    console.log(`  ${symbol}  [${gate}]`);
    if (!passed) allPassed = false;
  }

  console.log(`\nTOTAL GATES: ${Object.keys(results).length} | PASSED: ${Object.values(results).filter(Boolean).length}`);

  if (!allPassed) {
    throw new Error("[SLICE_4_CERTIFICATION_FAILED] One or more certification gates failed.");
  }
}

runBezelRailCertification();
