/**
 * runJumbotronAdAndShowDirectorCertification.test.ts
 *
 * Four-sided Jumbotron advertising + Show Director + People Spotlight gates.
 */

import { VenueAdDirector } from "../lib/ads/VenueAdDirector";
import { VenueAdImpressionLedger } from "../lib/ads/VenueAdImpressionLedger";
import {
  type VenueAdCampaign,
  type VenueAdCreative,
  VenueAdPriority,
  IN_WORLD_TEXTURE_FALLBACK_CHAIN,
  PRESENTATION_TEMPLATE_LIBRARY,
  SELLABLE_AD_PACKAGES,
} from "../lib/jumbotron/JumbotronAdContracts";
import { JumbotronFaceTargetRegistry } from "../lib/jumbotron/JumbotronFaceTargetRegistry";
import { JumbotronShowDirector } from "../lib/jumbotron/JumbotronShowDirector";
import { JumbotronSpotlightDirector } from "../lib/jumbotron/JumbotronSpotlightDirector";
import { JumbotronAdObservatoryControlRoom } from "../lib/jumbotron/JumbotronAdObservatoryControlRoom";
import { VenueAdSurfaceRegistry } from "../lib/ads/VenueAdSurfaceRegistry";

export interface CertResult {
  passed: boolean;
  name: string;
  evidence: string;
}

function creative(
  partial: Partial<VenueAdCreative> & Pick<VenueAdCreative, "creativeId" | "campaignId" | "sourceKind">
): VenueAdCreative {
  return {
    advertiserName: partial.advertiserName ?? "Test Adv",
    textureAssetUrl: partial.textureAssetUrl ?? "/textures/ad.webp",
    durationMs: partial.durationMs ?? 8000,
    priority: partial.priority ?? VenueAdPriority.P4_DIRECT_AD,
    allowedFaces: partial.allowedFaces ?? "ALL",
    campaignMode: partial.campaignMode ?? "SINGLE_FACE",
    compositionHint: partial.compositionHint ?? "FULL",
    frequencyCapPerHour: partial.frequencyCapPerHour ?? 60,
    isBlank: false,
    ...partial,
  };
}

function campaign(id: string, creatives: VenueAdCreative[], mode: VenueAdCampaign["mode"] = "SINGLE_FACE"): VenueAdCampaign {
  return {
    campaignId: id,
    name: id,
    mode,
    priority: VenueAdPriority.P4_DIRECT_AD,
    creatives,
  };
}

export function runJumbotronAdAndShowDirectorCertification(): {
  allPassed: boolean;
  results: CertResult[];
} {
  const results: CertResult[] = [];

  // 1. Four faces independent campaigns simultaneous
  {
    const dir = new VenueAdDirector({
      roomId: "room-1",
      venueId: "venue-arena",
      phase: "INTERMISSION",
    });
    const north = campaign("c-north", [
      creative({
        creativeId: "cr-n",
        campaignId: "c-north",
        sourceKind: "DIRECT_SPONSOR",
        allowedFaces: ["NORTH"],
      }),
    ]);
    const east = campaign("c-east", [
      creative({
        creativeId: "cr-e",
        campaignId: "c-east",
        sourceKind: "ARTIST_SPONSOR",
        allowedFaces: ["EAST"],
      }),
    ]);
    const south = campaign("c-south", [
      creative({
        creativeId: "cr-s",
        campaignId: "c-south",
        sourceKind: "HOUSE_AD",
        allowedFaces: ["SOUTH"],
      }),
    ]);
    const west = campaign("c-west", [
      creative({
        creativeId: "cr-w",
        campaignId: "c-west",
        sourceKind: "MERCH",
        allowedFaces: ["WEST"],
      }),
    ]);
    dir.assignCampaignToFaces({ campaign: north, faces: ["NORTH"] });
    dir.assignCampaignToFaces({ campaign: east, faces: ["EAST"] });
    dir.assignCampaignToFaces({ campaign: south, faces: ["SOUTH"] });
    dir.assignCampaignToFaces({ campaign: west, faces: ["WEST"] });
    const snap = dir.faces.sharedRoomTruthSnapshot();
    const ids = [snap.NORTH.creativeId, snap.EAST.creativeId, snap.SOUTH.creativeId, snap.WEST.creativeId];
    const unique = new Set(ids);
    results.push({
      passed: unique.size === 4 && ids.every(Boolean),
      name: "Four faces independent campaigns simultaneous",
      evidence: `creatives=${ids.join(",")}`,
    });
  }

  // 2. Synchronized takeover then return
  {
    const dir = new VenueAdDirector({
      roomId: "room-2",
      venueId: "venue-arena",
      phase: "INTERMISSION",
    });
    dir.assignCampaignToFaces({
      campaign: campaign("base-n", [
        creative({ creativeId: "base-cr-n", campaignId: "base-n", sourceKind: "HOUSE_AD", allowedFaces: ["NORTH"] }),
      ]),
      faces: ["NORTH"],
    });
    dir.assignCampaignToFaces({
      campaign: campaign("base-e", [
        creative({ creativeId: "base-cr-e", campaignId: "base-e", sourceKind: "HOUSE_AD", allowedFaces: ["EAST"] }),
      ]),
      faces: ["EAST"],
    });
    const before = dir.faces.sharedRoomTruthSnapshot();
    const takeover = campaign(
      "takeover",
      [
        creative({
          creativeId: "take-all",
          campaignId: "takeover",
          sourceKind: "EVENT_PROMO",
          campaignMode: "SYNCHRONIZED_TAKEOVER",
          priority: VenueAdPriority.P5_HOUSE,
        }),
      ],
      "SYNCHRONIZED_TAKEOVER"
    );
    takeover.priority = VenueAdPriority.P5_HOUSE;
    dir.beginSynchronizedTakeover(takeover);
    const mid = dir.faces.sharedRoomTruthSnapshot();
    const allTake =
      mid.NORTH.creativeId === "take-all" &&
      mid.EAST.creativeId === "take-all" &&
      mid.SOUTH.creativeId === "take-all" &&
      mid.WEST.creativeId === "take-all";
    dir.endSynchronizedTakeover();
    const after = dir.faces.sharedRoomTruthSnapshot();
    results.push({
      passed:
        allTake &&
        after.NORTH.creativeId === before.NORTH.creativeId &&
        after.EAST.creativeId === before.EAST.creativeId,
      name: "Synchronized takeover then return",
      evidence: `mid=${mid.NORTH.creativeId} restoredN=${after.NORTH.creativeId} restoredE=${after.EAST.creativeId}`,
    });
  }

  // 3. Priority preempts ad during Battle final countdown
  {
    const dir = new VenueAdDirector({
      roomId: "room-3",
      venueId: "venue-arena",
      phase: "INTERMISSION",
    });
    dir.assignCampaignToFaces({
      campaign: campaign("ad-pre", [
        creative({ creativeId: "ad-cr", campaignId: "ad-pre", sourceKind: "DIRECT_SPONSOR" }),
      ]),
      faces: JumbotronFaceTargetRegistry.cardinalFaces(),
    });
    const blocked = dir.assignCampaignToFaces({
      campaign: campaign("ad-during", [
        creative({ creativeId: "ad-blocked", campaignId: "ad-during", sourceKind: "DIRECT_SPONSOR" }),
      ]),
      faces: ["NORTH"],
    });
    // set phase first via preempt
    const pre = dir.preemptCommercialForCriticalLive("final-cd");
    const blockedAfter = dir.assignCampaignToFaces({
      campaign: campaign("ad-after-preempt", [
        creative({
          creativeId: "should-block",
          campaignId: "ad-after-preempt",
          sourceKind: "DIRECT_SPONSOR",
          priority: VenueAdPriority.P4_DIRECT_AD,
        }),
      ]),
      faces: ["NORTH"],
    });
    const snap = dir.faces.sharedRoomTruthSnapshot();
    results.push({
      passed:
        pre.ok &&
        !blockedAfter.ok &&
        snap.NORTH.creativeId === "final-cd" &&
        dir.faces.getFace("NORTH").priorityState === VenueAdPriority.P1_CRITICAL_LIVE,
      name: "Priority preempts ad during Battle final countdown",
      evidence: `blockedAfter=${blockedAfter.reason}; face=${snap.NORTH.creativeId}; priorOk=${blocked.ok}`,
    });
  }

  // 4. Shared room truth (two viewers same face same creative)
  {
    const dir = new VenueAdDirector({
      roomId: "room-4",
      venueId: "venue-arena",
      phase: "IDLE",
    });
    dir.assignCampaignToFaces({
      campaign: campaign("shared", [
        creative({ creativeId: "shared-cr", campaignId: "shared", sourceKind: "DIRECT_SPONSOR" }),
      ]),
      faces: ["NORTH"],
    });
    const truth = dir.sharedTruthForFace("NORTH");
    results.push({
      passed: truth.identical && truth.viewerA.creativeId === "shared-cr",
      name: "Shared room truth (two viewers same face same creative)",
      evidence: `identical=${truth.identical} a=${truth.viewerA.creativeId} b=${truth.viewerB.creativeId}`,
    });
  }

  // 5. Spotlight rejects without consent / invents no people
  {
    const spot = new JumbotronSpotlightDirector();
    const empty = spot.select({
      kind: "SINGLE",
      roomId: "room-5",
      allowRandomFromEligiblePool: true,
      preferFriendGroups: true,
    });
    spot.registerParticipant({
      participantId: "u1",
      displayName: "Pat",
      presenceType: "FAN_AVATAR",
      worldPosition: [0, 0, 0],
      publicVideoFeed: false,
      jumbotronParticipationConsent: false,
      cameraActive: false,
      moderationEligible: true,
    });
    const noConsent = spot.select({
      kind: "SINGLE",
      roomId: "room-5",
      requestedUserIds: ["u1"],
      allowRandomFromEligiblePool: false,
      preferFriendGroups: false,
    });
    spot.registerParticipant({
      participantId: "u2",
      displayName: "Alex",
      presenceType: "FAN_AVATAR",
      groupId: "fg1",
      worldPosition: [1, 0, 0],
      publicVideoFeed: false,
      jumbotronParticipationConsent: true,
      cameraActive: false,
      moderationEligible: true,
    });
    const ok = spot.select({
      kind: "SINGLE",
      roomId: "room-5",
      requestedUserIds: ["u2"],
      allowRandomFromEligiblePool: false,
      preferFriendGroups: true,
    });
    const invent = spot.select({
      kind: "SINGLE",
      roomId: "room-5",
      requestedUserIds: ["ghost-not-real"],
      allowRandomFromEligiblePool: false,
      preferFriendGroups: false,
    });
    results.push({
      passed:
        !empty.accepted &&
        !noConsent.accepted &&
        ok.accepted &&
        ok.renderMode === "AVATAR_ONLY" &&
        !invent.accepted,
      name: "Spotlight rejects without consent / invents no people",
      evidence: `empty=${empty.reason}; noConsent=${noConsent.reason}; ok=${ok.reason}; invent=${invent.reason}`,
    });
  }

  // 6. Impression not counted on assign alone
  {
    const ledger = new VenueAdImpressionLedger();
    const a = ledger.recordAssignment({
      roomId: "room-6",
      inventoryId: "venue:v:jumbotron:north",
      creativeId: "cr",
      campaignId: "c",
      viewerRole: "AUDIENCE_IMPRESSION",
    });
    const assignedOnly = ledger.countAssigned() === 1 && ledger.countViewed() === 0;
    ledger.evaluateViewability(a.assignmentId, {
      faceId: "north",
      viewerId: "v1",
      isFacingCamera: true,
      screenAreaPercent: 60,
      continuousVisibleMs: 1500,
      isOffscreen: false,
      isBackfaceCulled: false,
      isBackgroundTab: false,
      isBotViewer: false,
      isQaHarness: false,
    });
    const afterView = ledger.countViewed() === 1;
    const fraud = ledger.recordAssignment({
      roomId: "room-6",
      inventoryId: "venue:v:jumbotron:east",
      creativeId: "cr2",
      campaignId: "c",
      viewerRole: "HOST_IMPRESSION",
    });
    ledger.evaluateViewability(fraud.assignmentId, {
      faceId: "east",
      viewerId: "bot",
      isFacingCamera: true,
      screenAreaPercent: 90,
      continuousVisibleMs: 5000,
      isOffscreen: false,
      isBackfaceCulled: false,
      isBackgroundTab: false,
      isBotViewer: true,
      isQaHarness: false,
    });
    results.push({
      passed: assignedOnly && afterView && ledger.countViewed() === 1,
      name: "Impression not counted on assign alone",
      evidence: `assigned=${ledger.countAssigned()} viewed=${ledger.countViewed()} assignReject=${a.rejectReason}`,
    });
  }

  // 7. Fallback never blank
  {
    const dir = new VenueAdDirector({
      roomId: "room-7",
      venueId: "venue-arena",
      phase: "IDLE",
    });
    const emptyCampaign = campaign("empty", []);
    const r = dir.assignCampaignToFaces({ campaign: emptyCampaign, faces: ["NORTH"] });
    const face = dir.faces.getFace("NORTH");
    results.push({
      passed:
        r.ok &&
        r.usedFallback &&
        face.creativeId != null &&
        face.creativeId.length > 0 &&
        IN_WORLD_TEXTURE_FALLBACK_CHAIN.includes("AMBIENT_ART"),
      name: "Fallback never blank",
      evidence: `creative=${face.creativeId} source=${r.sourceKind}`,
    });
  }

  // 8. AdSense not used as default in-world texture path
  {
    const dir = new VenueAdDirector({
      roomId: "room-8",
      venueId: "venue-arena",
      phase: "IDLE",
    });
    const withAdSense = campaign("adsense-trap", [
      creative({
        creativeId: "adsense-1",
        campaignId: "adsense-trap",
        sourceKind: "ADSENSE_WEB_OVERLAY_OPT_IN",
      }),
      creative({
        creativeId: "house-1",
        campaignId: "adsense-trap",
        sourceKind: "HOUSE_AD",
      }),
    ]);
    const r = dir.assignCampaignToFaces({ campaign: withAdSense, faces: ["NORTH"] });
    results.push({
      passed:
        dir.usesAdSenseAsDefaultInWorldPath() === false &&
        r.sourceKind === "HOUSE_AD" &&
        r.creativeIds[0] === "house-1" &&
        !IN_WORLD_TEXTURE_FALLBACK_CHAIN.includes("ADSENSE_WEB_OVERLAY_OPT_IN"),
      name: "AdSense not used as default in-world texture path",
      evidence: `source=${r.sourceKind} creative=${r.creativeIds[0]}`,
    });
  }

  // Bonus: packages + templates + observatory scaffold
  {
    const packagesOk = Object.keys(SELLABLE_AD_PACKAGES).length >= 8;
    const templatesOk = Object.values(PRESENTATION_TEMPLATE_LIBRARY).every(
      (t) => t.inventsOutcomes === false
    );
    const faces = new JumbotronFaceTargetRegistry("room-obs", "venue-obs");
    const surfaces = new VenueAdSurfaceRegistry("venue-obs", "room-obs");
    const obs = new JumbotronAdObservatoryControlRoom("room-obs", "venue-obs", faces, surfaces);
    const preview = obs.preview();
    const afterHold = obs.command("NORTH", "HOLD", "op-1");
    const show = new JumbotronShowDirector(faces);
    const beat = show.handleBusEvent({ type: "TIP_SETTLED", tipId: "t1", amountCents: 500, recipientId: "u9" });
    results.push({
      passed:
        packagesOk &&
        templatesOk &&
        preview.faces.length === 4 &&
        afterHold.faces.find((f) => f.face === "NORTH")?.safetyHold === "REQUIRED_CUE" &&
        beat?.inventsOutcomes === false,
      name: "Packages, templates, observatory, show director scaffolds",
      evidence: `faces=${preview.faces.length} hold=${afterHold.lastCommand?.command} beat=${beat?.templateId}`,
    });
  }

  // Inventory ID shape
  {
    const inv = VenueAdSurfaceRegistry.buildInventoryId("arena-1", "jumbotron", "north");
    results.push({
      passed: inv === "venue:arena-1:jumbotron:north",
      name: "Venue ad inventory ID shape",
      evidence: inv,
    });
  }

  return {
    allPassed: results.every((r) => r.passed),
    results,
  };
}

describe("Jumbotron Ad + Show Director + Spotlight", () => {
  it("passes all certification gates", () => {
    const { allPassed, results } = runJumbotronAdAndShowDirectorCertification();
    const failed = results.filter((r) => !r.passed);
    if (failed.length) {
      // eslint-disable-next-line no-console
      console.error(failed);
    }
    expect(allPassed).toBe(true);
  });
});
