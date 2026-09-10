/**
 * runLivingJumbotronMediaLawCertification.test.ts
 *
 * Level-1 (automated) certification for Living Jumbotron + Role Media Workspace scaffolding.
 * PHYSICAL sync / browser verification remains BLOCKED until artifacts exist.
 */

import {
  buildLivingJumbotronProgramFrame,
  buildSynchronizedShowFrame,
  resolveJumbotronPresentationBudget,
} from "../lib/jumbotron/LivingJumbotronProgramScheduler";
import {
  resolveAdEntitlement,
  resolvePersonalPlatformAdEntitlement,
  resolveVenueJumbotronAdEntitlement,
  membershipNeverStripsVenueJumbotron,
} from "../lib/commerce/AdEntitlementPolicy";
import {
  resolveRoleMediaWorkspace,
  resolveMinMonitorCount,
} from "../lib/monitors/RoleMediaWorkspaceAuthority";
import {
  resolvePlatformAdDrawerEntitlement,
  resolveDrawerGeometryPolicy,
} from "../lib/drawers/DrawerGeometryPolicy";
import {
  probeNativeMultiwindowSplit,
  resolveDetachedMonitorComposition,
} from "../lib/liveFabric/DetachedMonitorVoltronFallback";

export interface CertResult {
  passed: boolean;
  name: string;
  evidence: string;
}

export function runLivingJumbotronMediaLawCertification(): {
  allPassed: boolean;
  results: CertResult[];
  physicalCertification: "BLOCKED";
} {
  const results: CertResult[] = [];

  // 1. Shared program — membershipPersonalized always false; no invented ads
  {
    const empty = buildLivingJumbotronProgramFrame({
      venueSessionId: "sess-1",
      roomId: "room-1",
      nowMs: 1_000_000,
      eligibleAds: [],
      eligiblePeopleMoments: [],
      liveStageActive: false,
      performanceTier: "MEDIUM",
    });
    results.push({
      passed:
        empty.membershipPersonalized === false &&
        empty.fellBackToEntertainment === true &&
        empty.frame.faces.length === 4 &&
        empty.frame.faces.every((f) => f.mode === "INFORMATION"),
      name: "No inventory → entertainment/info (never invent ads)",
      evidence: `modes=${empty.frame.faces.map((f) => f.mode).join(",")}`,
    });
  }

  // 2. Real inventory → staggered AD + breather faces
  {
    const withAds = buildLivingJumbotronProgramFrame({
      venueSessionId: "sess-2",
      roomId: "room-2",
      nowMs: 2_000_000,
      eligibleAds: [
        {
          contentId: "cr-real-1",
          campaignId: "camp-1",
          presentation: "JUMBOTRON_SPONSOR",
          durationMs: 12000,
          fromRealInventory: true,
        },
      ],
      eligiblePeopleMoments: [],
      liveStageActive: false,
      performanceTier: "HIGH",
    });
    const modes = withAds.frame.faces.map((f) => f.mode);
    results.push({
      passed:
        withAds.usedAdInventory === true &&
        modes.includes("SPONSOR_AD") &&
        modes.includes("VISUAL_SHOW") &&
        withAds.membershipPersonalized === false,
      name: "Real inventory → staggered AD + VISUAL_SHOW breather",
      evidence: `modes=${modes.join(",")}`,
    });
  }

  // 3. Synchronized full-structure show
  {
    const sync = buildSynchronizedShowFrame({
      venueSessionId: "sess-3",
      roomId: "room-3",
      nowMs: 3_000_000,
      mode: "SPONSOR_AD",
      contentId: "cr-takeover",
      durationMs: 20000,
      synchronizedShowId: "show-1",
    });
    results.push({
      passed:
        sync.synchronizedShowId === "show-1" &&
        sync.faces.every((f) => f.mode === "SPONSOR_AD" && f.contentId === "cr-takeover"),
      name: "Synchronized show — all faces same content",
      evidence: `faces=${sync.faces.length} syncId=${sync.synchronizedShowId}`,
    });
  }

  // 4. Personal vs venue entitlement split
  {
    const personalLive = resolvePersonalPlatformAdEntitlement({
      pathname: "/live/rooms/abc",
      isLiveRoom: true,
      membershipTier: "DIAMOND",
    });
    const venueDiamond = resolveVenueJumbotronAdEntitlement({});
    const viaSurface = resolveAdEntitlement({
      pathname: "/live/rooms/abc",
      isLiveRoom: true,
      membershipTier: "DIAMOND",
      surfaceClass: "VENUE_JUMBOTRON",
    });
    results.push({
      passed:
        personalLive === "ADS_BLOCKED" &&
        venueDiamond === "ADS_ALLOWED" &&
        viaSurface === "ADS_ALLOWED" &&
        membershipNeverStripsVenueJumbotron() === true,
      name: "Diamond/live: personal blocked, venue Jumbotron allowed",
      evidence: `personal=${personalLive} venue=${venueDiamond} surface=${viaSurface}`,
    });
  }

  // 5. Drawer geometry — personal PLATFORM_AD axis only (Jumbotron separate).
  // Commerce CanonicalPricingRegistry: DIAMOND retains reduced personal load
  // (slots>0 / ~5%), never invents "ad-free everywhere"; venue Jumbotron tested above.
  {
    const diamond = resolvePlatformAdDrawerEntitlement("DIAMOND");
    const geo = resolveDrawerGeometryPolicy("DIAMOND", { viewportWidthPx: 1400 });
    const free = resolvePlatformAdDrawerEntitlement("FREE");
    results.push({
      passed:
        free.companionAdEligible === true &&
        free.personalAdSlotCount > diamond.personalAdSlotCount &&
        diamond.personalAdSlotCount >= 0 &&
        (diamond.companionAdEligible
          ? geo.showCompanionAdRail === true
          : geo.showCompanionAdRail === false),
      name: "DrawerGeometry personal axis (FREE > DIAMOND slots; Jumbotron separate)",
      evidence: `diamondSlots=${diamond.personalAdSlotCount} freeSlots=${free.personalAdSlotCount} rail=${geo.showCompanionAdRail}`,
    });
  }

  // 6. Role monitor counts
  {
    const fan = resolveRoleMediaWorkspace("FAN");
    const writer = resolveRoleMediaWorkspace("WRITER");
    const advertiser = resolveRoleMediaWorkspace("ADVERTISER");
    const sponsor = resolveRoleMediaWorkspace("SPONSOR");
    const promoter = resolveRoleMediaWorkspace("PROMOTER");
    results.push({
      passed:
        fan.monitorInstanceCount === 2 &&
        writer.monitorInstanceCount === 2 &&
        writer.writerInterviewDualPortal === true &&
        advertiser.monitorInstanceCount === 1 &&
        sponsor.businessSinglePortal === true &&
        promoter.monitorInstanceCount === 1 &&
        resolveMinMonitorCount("BAND") === 1,
      name: "Role monitor law — dual creative / single business",
      evidence: `fan=${fan.monitorInstanceCount} writer=${writer.monitorInstanceCount} adv=${advertiser.monitorInstanceCount}`,
    });
  }

  // 7. Voltron detach fallback — no native split invent
  {
    const nativeDefault = probeNativeMultiwindowSplit();
    const decision = resolveDetachedMonitorComposition({
      canNativeMultiwindowSplit: false,
      reducedMotion: false,
      maxLogicalFeeds: 8,
      sessionId: "s",
      generation: 1,
      mediaClockMs: 0,
    });
    results.push({
      passed:
        nativeDefault === false &&
        decision.mode === "VOLTRON_SINGLE_WINDOW" &&
        decision.remountWebRtc === false &&
        decision.duplicateAudio === false &&
        decision.logicalFeedSlots === 8,
      name: "Detach → Voltron single-window fallback (no WebRTC remount)",
      evidence: `mode=${decision.mode} slots=${decision.logicalFeedSlots}`,
    });
  }

  // 8. Performance tier — COIN_BURST decorative only
  {
    const high = resolveJumbotronPresentationBudget("HIGH");
    const reduced = resolveJumbotronPresentationBudget("REDUCED_MOTION");
    results.push({
      passed:
        high.coinBurstDecorativeOnly === true &&
        high.oneActiveAudio === true &&
        high.webrtcWinsOverViz === true &&
        reduced.particles === false &&
        reduced.audioReactiveViz === false,
      name: "Performance tier + reward/VFX decorative boundary",
      evidence: `high.particles=${high.particles} reduced.leds=${reduced.bezelLeds}`,
    });
  }

  return {
    allPassed: results.every((r) => r.passed),
    results,
    physicalCertification: "BLOCKED",
  };
}

if (typeof require !== "undefined" && require.main === module) {
  const report = runLivingJumbotronMediaLawCertification();
  for (const r of report.results) {
    // eslint-disable-next-line no-console
    console.log(`${r.passed ? "PASS" : "FAIL"} — ${r.name} :: ${r.evidence}`);
  }
  // eslint-disable-next-line no-console
  console.log(
    `\nallPassed=${report.allPassed} physical=${report.physicalCertification}`,
  );
  if (!report.allPassed) process.exitCode = 1;
}
