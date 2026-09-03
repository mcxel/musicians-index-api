/**
 * VenueAdSurfaceRegistry.ts
 *
 * Physical ad surface inventory + priority takeover + qualified impressions.
 * Inventory IDs: venue:{id}:jumbotron:north etc.
 */

import type { DisplayTargetClass } from "../monitors/DisplayTargetDirector";
import {
  type SellablePackageId,
  SELLABLE_AD_PACKAGES,
  type JumbotronCardinalFace,
  VenueAdPriority,
} from "../jumbotron/JumbotronAdContracts";

export enum VenueContentPriority {
  P0_EMERGENCY_SAFETY = 0,
  P1_CRITICAL_LIVE_SHOW = 1,
  P2_RESULT_TIMER_SCORE = 2,
  P3_CONTRACTED_SPONSOR = 3,
  P4_DIRECT_AD_CAMPAIGN = 4,
  P5_HOUSE_PROMO = 5,
  P6_AMBIENT = 6,
}

export type SurfaceCategory = "JUMBOTRON" | "STAGE" | "ARENA" | "CONCOURSE" | "LOBBY";

export type SurfaceStatus =
  | "IDLE"
  | "ACTIVE"
  | "HELD"
  | "EMERGENCY_OVERRIDE"
  | "CONTRACTED";

export interface SurfaceCommercePayload {
  interactionType: "ADD_TO_CART" | "OPEN_URL" | "TIP" | "NONE";
  productId?: string;
  clickThroughUrl?: string;
}

export type InteractiveCommercePayload = SurfaceCommercePayload;

export interface VenueAdSurface {
  surfaceId: string;
  inventoryId: string;
  venueId: string;
  category: SurfaceCategory;
  displayTargetId: DisplayTargetClass;
  faceOrientation?: JumbotronCardinalFace;
  sellable: boolean;
  packageIds: SellablePackageId[];
  currentCreativeId: string | null;
  currentCampaignId: string | null;
  priority: VenueContentPriority;
  status: SurfaceStatus;
  sharedRoomTruthKey: string;
  commercePayload?: SurfaceCommercePayload;
}

export interface QualifiedImpressionInput {
  campaignId: string;
  creativeId: string;
  inventoryId: string;
  surfaceId: string;
  sessionId: string;
  viewerSessionId: string;
  impressionClass: "AUDIENCE_IMPRESSION" | "PERFORMER_IMPRESSION" | "HOST_IMPRESSION";
  visibleDurationSec: number;
  viewabilityPercent: number;
  deviceTier: "DESKTOP" | "MOBILE" | "TV";
  isBackface?: boolean;
  isOffscreen?: boolean;
  isBackgroundTab?: boolean;
  isBot?: boolean;
  isQaHarness?: boolean;
}

export interface QualifiedImpressionRecord {
  impressionId: string;
  billingStatus: "QUALIFIED" | "REJECTED";
  rejectReason?: string;
  input: QualifiedImpressionInput;
}

const VIEW_MIN_SEC = 3.0;
const VIEW_MIN_PCT = 30;

function sharedKey(venueId: string, invId: string): string {
  return `${venueId}::${invId}`;
}

export class VenueAdSurfaceRegistry {
  private surfaces = new Map<string, VenueAdSurface>();
  private impressions: QualifiedImpressionRecord[] = [];
  private seq = 0;
  public readonly roomId: string;

  constructor(
    public readonly venueId: string,
    roomId?: string
  ) {
    this.roomId = roomId ?? `room:${venueId}`;
    this.seedDefaults();
  }

  private seedDefaults(): void {
    const faces: JumbotronCardinalFace[] = ["NORTH", "EAST", "SOUTH", "WEST"];
    const faceTargets: Record<JumbotronCardinalFace, DisplayTargetClass> = {
      NORTH: "JUMBOTRON_NORTH",
      EAST: "JUMBOTRON_EAST",
      SOUTH: "JUMBOTRON_SOUTH",
      WEST: "JUMBOTRON_WEST",
    };
    const facePackages: SellablePackageId[] = [
      "FAN_CAM_PRESENTED_BY",
      "TWO_FACE_SPLIT_SPONSOR",
      "FOUR_FACE_EVENT_TAKEOVER",
      "INTERMISSION_TAKEOVER",
      "MERCH_DROP_BURST",
      "LOWER_THIRD_HOUSE",
      "GROUP_FRIEND_SPOTLIGHT",
    ];

    for (const face of faces) {
      const surfaceId = `jumbotron:${face.toLowerCase()}`;
      const inventoryId = `venue:${this.venueId}:jumbotron:${face.toLowerCase()}`;
      this.surfaces.set(surfaceId, {
        surfaceId,
        inventoryId,
        venueId: this.venueId,
        category: "JUMBOTRON",
        displayTargetId: faceTargets[face],
        faceOrientation: face,
        sellable: true,
        packageIds: facePackages,
        currentCreativeId: null,
        currentCampaignId: null,
        priority: VenueContentPriority.P6_AMBIENT,
        status: "IDLE",
        sharedRoomTruthKey: sharedKey(this.venueId, inventoryId),
        commercePayload:
          face === "NORTH"
            ? {
                interactionType: "ADD_TO_CART",
                productId: "prod-hoodie-tour-2026",
                clickThroughUrl: "/store/hoodie-tour-2026",
              }
            : undefined,
      });
    }

    const extras: Array<{
      surfaceId: string;
      category: SurfaceCategory;
      slug: string;
      target: DisplayTargetClass;
      packages: SellablePackageId[];
      priority: VenueContentPriority;
      status: SurfaceStatus;
    }> = [
      {
        surfaceId: "stage:backdrop",
        category: "STAGE",
        slug: "stage-led",
        target: "STAGE_RAIL",
        packages: ["ROUND_TIMER_FRAME", "LOWER_THIRD_HOUSE"],
        priority: VenueContentPriority.P1_CRITICAL_LIVE_SHOW,
        status: "ACTIVE",
      },
      {
        surfaceId: "arena:scoreboard",
        category: "ARENA",
        slug: "scoreboard",
        target: "JUMBOTRON_BOTTOM_RING",
        packages: ["SCOREBOARD_RIBBON", "WINNER_SPOTLIGHT"],
        priority: VenueContentPriority.P2_RESULT_TIMER_SCORE,
        status: "ACTIVE",
      },
      {
        surfaceId: "arena:ribbon",
        category: "ARENA",
        slug: "ribbon",
        target: "JUMBOTRON_UPPER_RIBBON",
        packages: ["SCOREBOARD_RIBBON"],
        priority: VenueContentPriority.P3_CONTRACTED_SPONSOR,
        status: "IDLE",
      },
      {
        surfaceId: "concourse:wall-a",
        category: "CONCOURSE",
        slug: "concourse",
        target: "VENUE_WALL",
        packages: ["INTERMISSION_TAKEOVER", "MERCH_DROP_BURST"],
        priority: VenueContentPriority.P5_HOUSE_PROMO,
        status: "IDLE",
      },
      {
        surfaceId: "lobby:mosaic",
        category: "LOBBY",
        slug: "lobby",
        target: "BILLBOARD",
        packages: ["LOWER_THIRD_HOUSE", "FOUR_FACE_EVENT_TAKEOVER"],
        priority: VenueContentPriority.P5_HOUSE_PROMO,
        status: "IDLE",
      },
    ];

    for (const e of extras) {
      const inventoryId = `venue:${this.venueId}:${e.slug}`;
      this.surfaces.set(e.surfaceId, {
        surfaceId: e.surfaceId,
        inventoryId,
        venueId: this.venueId,
        category: e.category,
        displayTargetId: e.target,
        sellable: true,
        packageIds: e.packages,
        currentCreativeId: null,
        currentCampaignId: null,
        priority: e.priority,
        status: e.status,
        sharedRoomTruthKey: sharedKey(this.venueId, inventoryId),
      });
    }
  }

  public list(): VenueAdSurface[] {
    return [...this.surfaces.values()];
  }

  public getSurfacesByCategory(category: SurfaceCategory): VenueAdSurface[] {
    return this.list().filter((s) => s.category === category);
  }

  public get(inventoryIdValue: string): VenueAdSurface | undefined {
    return this.list().find((s) => s.inventoryId === inventoryIdValue);
  }

  public getSurface(surfaceId: string): VenueAdSurface | undefined {
    return this.surfaces.get(surfaceId);
  }

  public getJumbotronFace(face: JumbotronCardinalFace): VenueAdSurface {
    return this.surfaces.get(`jumbotron:${face.toLowerCase()}`)!;
  }

  public assignCreative(
    inventoryIdValue: string,
    creativeId: string,
    campaignId: string
  ): VenueAdSurface {
    const s = this.get(inventoryIdValue) ?? this.surfaces.get(inventoryIdValue);
    if (!s) throw new Error(`Unknown ad surface: ${inventoryIdValue}`);
    const next = {
      ...s,
      currentCreativeId: creativeId,
      currentCampaignId: campaignId,
      status: "ACTIVE" as const,
    };
    this.surfaces.set(s.surfaceId, next);
    return next;
  }

  public getSharedCreative(inventoryIdValue: string): {
    creativeId: string | null;
    campaignId: string | null;
    sharedRoomTruthKey: string;
  } {
    const s = this.get(inventoryIdValue);
    if (!s) return { creativeId: null, campaignId: null, sharedRoomTruthKey: "" };
    return {
      creativeId: s.currentCreativeId,
      campaignId: s.currentCampaignId,
      sharedRoomTruthKey: s.sharedRoomTruthKey,
    };
  }

  /**
   * Lower numeric priority wins. Cannot take over with weaker (higher) priority.
   */
  public requestSurfaceTakeover(
    surfaceId: string,
    priority: VenueContentPriority,
    campaignId: string,
    creativeId: string
  ): boolean {
    const s = this.surfaces.get(surfaceId);
    if (!s) return false;
    if (priority > s.priority) {
      // Weaker than current — reject (Ad Safety)
      return false;
    }
    if (s.status === "EMERGENCY_OVERRIDE" && priority > VenueContentPriority.P0_EMERGENCY_SAFETY) {
      return false;
    }
    this.surfaces.set(surfaceId, {
      ...s,
      priority,
      currentCampaignId: campaignId,
      currentCreativeId: creativeId,
      status: priority <= VenueContentPriority.P1_CRITICAL_LIVE_SHOW ? "ACTIVE" : "CONTRACTED",
    });
    return true;
  }

  public preemptSurface(surfaceId: string, priority: VenueContentPriority): boolean {
    const s = this.surfaces.get(surfaceId);
    if (!s) return false;
    if (priority > s.priority && s.status !== "IDLE") {
      // Only allow preemption with equal-or-stronger priority
      if (priority > s.priority) return false;
    }
    const status: SurfaceStatus =
      priority === VenueContentPriority.P0_EMERGENCY_SAFETY
        ? "EMERGENCY_OVERRIDE"
        : "ACTIVE";
    this.surfaces.set(surfaceId, {
      ...s,
      priority,
      status,
      currentCampaignId: priority === VenueContentPriority.P0_EMERGENCY_SAFETY ? null : s.currentCampaignId,
      currentCreativeId:
        priority === VenueContentPriority.P0_EMERGENCY_SAFETY ? "EMERGENCY" : s.currentCreativeId,
    });
    return true;
  }

  public recordQualifiedImpression(
    input: QualifiedImpressionInput
  ): QualifiedImpressionRecord | null {
    if (input.isBackface || input.isOffscreen || input.isBackgroundTab || input.isBot || input.isQaHarness) {
      return null;
    }
    if (input.visibleDurationSec < VIEW_MIN_SEC || input.viewabilityPercent < VIEW_MIN_PCT) {
      return null;
    }
    const record: QualifiedImpressionRecord = {
      impressionId: `qimp-${++this.seq}`,
      billingStatus: "QUALIFIED",
      input,
    };
    this.impressions.push(record);
    return record;
  }

  public static packageCatalog() {
    return SELLABLE_AD_PACKAGES;
  }

  public static buildInventoryId(venueId: string, kind: string, face?: string): string {
    return face ? `venue:${venueId}:${kind}:${face}` : `venue:${venueId}:${kind}`;
  }

  /** Map VenueContentPriority ↔ VenueAdPriority */
  public static toVenueAdPriority(p: VenueContentPriority): VenueAdPriority {
    return p as unknown as VenueAdPriority;
  }
}
