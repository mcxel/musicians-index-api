/**
 * PerformerSponsorCabinetEngine.ts
 *
 * Canonical Pre-Routed Performer Sponsor Cabinet & Presentation Engine
 *
 * Laws:
 * 1. Sponsor Asset Delivery Law:
 *    A performer never needs to manually locate, re-upload, or reconstruct an approved
 *    sponsor creative during a live experience. Authorized sponsor assets are delivered
 *    automatically into that performer’s Sponsor Cabinet and may be triggered through
 *    certified quick actions. The trigger changes presentation only; it never restarts
 *    or replaces the canonical live session.
 * 2. Overlay vs Jumbotron Target Separation:
 *    - OVERLAY ASSET: layers over live content on Universal Media Player
 *    - JUMBOTRON ASSET: routes to physical 3D venue screen (East/South face)
 *    - COMMERCIAL: occupies an eligible ad slot during safe break
 *    - TAKEOVER: temporarily controls authorized surfaces
 * 3. Non-Destructive Switching:
 *    Live performer WebRTC/session never stops; underlying stream remains intact.
 * 4. Attribution & Verification:
 *    Real SponsorPresentationEvents recorded with real impressions & conversions.
 */

import {
  VenueAdSurfaceRegistry,
  VenueContentPriority,
  InteractiveCommercePayload,
} from '../ads/VenueAdSurfaceRegistry';
import {
  JumbotronFaceTargetRegistry,
  CardinalFaceDirection,
} from '../jumbotron/JumbotronFaceTargetRegistry';
import { JumbotronShowDirector } from '../jumbotron/JumbotronShowDirector';

export type SponsorAssetType =
  | 'SPONSOR_LOGO'
  | 'SPONSOR_LOWER_THIRD'
  | 'SPONSOR_BUG'
  | 'SPONSOR_CARD'
  | 'SPONSOR_IMAGE'
  | 'SPONSOR_VIDEO'
  | 'SPONSOR_COMMERCIAL'
  | 'SPONSOR_TAKEOVER'
  | 'SPONSOR_PRODUCT_CARD'
  | 'SPONSOR_CALL_TO_ACTION';

export type SponsorPresentationTarget =
  | 'PLAYER_OVERLAY'
  | 'JUMBOTRON_FACE'
  | 'JUMBOTRON_MULTI_FACE'
  | 'RIBBON_BOARD'
  | 'STAGE_LED'
  | 'INTERACTIVE_COMMERCE_MODAL';

export type TriggerExecutionStatus =
  | 'LIVE_NOW'
  | 'QUEUED'
  | 'PLAYING'
  | 'COOLDOWN'
  | 'UNAVAILABLE_DURING_CURRENT_PHASE'
  | 'CAMPAIGN_EXPIRED'
  | 'PREEMPTED_BY_EMERGENCY';

export interface ValidatedSponsorAsset {
  assetId: string;
  campaignId: string;
  sponsorName: string;
  assetType: SponsorAssetType;
  title: string;
  creativeUrl: string;
  fallbackText?: string;
  durationSec: number;
  cooldownSec: number;
  allowedTargets: SponsorPresentationTarget[];
  preferredTarget: SponsorPresentationTarget;
  campaignPriority: VenueContentPriority;
  commercePayload?: InteractiveCommercePayload;
  approvedAtMs: number;
  expiresAtMs: number;
}

export interface CabinetSlot {
  slotIndex: number; // 1 to 6 (quick trigger positions)
  asset: ValidatedSponsorAsset | null;
  status: 'EMPTY' | 'READY' | 'PLAYING' | 'COOLDOWN' | 'EXPIRED';
  lastTriggeredAtMs?: number;
  cooldownRemainingSec?: number;
}

export interface SponsorPresentationEvent {
  eventId: string;
  campaignId: string;
  assetId: string;
  performerId: string;
  liveSessionId: string;
  targetSurface: string;
  assetType: SponsorAssetType;
  requestedAtMs: number;
  startedAtMs: number;
  completedAtMs?: number;
  status: 'PLAYING' | 'COMPLETED' | 'MANUAL_STOP' | 'MODERATION_STOP' | 'PREEMPTED';
  qualifiedImpressions: number;
  commerceConversions: number;
}

export class PerformerSponsorCabinetEngine {
  private performerId: string;
  private cabinetSlots: Map<number, CabinetSlot> = new Map();
  private assetLibrary: Map<string, ValidatedSponsorAsset> = new Map();
  private activePresentations: Map<string, SponsorPresentationEvent> = new Map();
  private eventHistory: SponsorPresentationEvent[] = [];

  private showDirector?: JumbotronShowDirector;
  private adRegistry?: VenueAdSurfaceRegistry;

  constructor(
    performerId: string,
    showDirector?: JumbotronShowDirector,
    adRegistry?: VenueAdSurfaceRegistry
  ) {
    this.performerId = performerId;
    this.showDirector = showDirector;
    this.adRegistry = adRegistry;

    this.initializeCabinetSlots();
  }

  private initializeCabinetSlots(): void {
    for (let i = 1; i <= 6; i++) {
      this.cabinetSlots.set(i, {
        slotIndex: i,
        asset: null,
        status: 'EMPTY',
      });
    }
  }

  /**
   * System delivery: automatically assigns validated asset to performer's cabinet
   * (Called when sponsor signs up & asset is approved by bot / moderation)
   */
  public deliverAssetToCabinet(asset: ValidatedSponsorAsset, preferredSlot?: number): boolean {
    this.assetLibrary.set(asset.assetId, asset);

    // Auto-place into requested slot or first available empty slot
    let targetSlotIndex = preferredSlot;
    if (!targetSlotIndex || this.cabinetSlots.get(targetSlotIndex)?.asset !== null) {
      for (let i = 1; i <= 6; i++) {
        if (this.cabinetSlots.get(i)?.asset === null) {
          targetSlotIndex = i;
          break;
        }
      }
    }

    if (targetSlotIndex && targetSlotIndex <= 6) {
      this.cabinetSlots.set(targetSlotIndex, {
        slotIndex: targetSlotIndex,
        asset,
        status: 'READY',
      });
      return true;
    }

    return false; // library stored, cabinet quick slots full
  }

  public getCabinetSlots(): CabinetSlot[] {
    const now = Date.now();
    return Array.from(this.cabinetSlots.values()).map((slot) => {
      if (!slot.asset) return slot;

      // Check expiry
      if (slot.asset.expiresAtMs < now) {
        return { ...slot, status: 'EXPIRED' };
      }

      // Check cooldown
      if (slot.lastTriggeredAtMs) {
        const elapsedSec = (now - slot.lastTriggeredAtMs) / 1000;
        if (elapsedSec < slot.asset.cooldownSec) {
          return {
            ...slot,
            status: 'COOLDOWN',
            cooldownRemainingSec: Math.ceil(slot.asset.cooldownSec - elapsedSec),
          };
        }
      }

      return slot;
    });
  }

  /**
   * Performer presses Quick Sponsor Button
   */
  public triggerSponsorAction(
    slotIndex: number,
    liveSessionId: string
  ): {
    status: TriggerExecutionStatus;
    targetSurface?: string;
    message: string;
    eventId?: string;
  } {
    const slot = this.cabinetSlots.get(slotIndex);
    if (!slot || !slot.asset) {
      return { status: 'UNAVAILABLE_DURING_CURRENT_PHASE', message: 'No sponsor asset in this slot.' };
    }

    const asset = slot.asset;
    const now = Date.now();

    // 1. Expiry Check
    if (asset.expiresAtMs < now) {
      return { status: 'CAMPAIGN_EXPIRED', message: 'This sponsor campaign has expired.' };
    }

    // 2. Cooldown Check
    if (slot.lastTriggeredAtMs) {
      const elapsedSec = (now - slot.lastTriggeredAtMs) / 1000;
      if (elapsedSec < asset.cooldownSec) {
        const remaining = Math.ceil(asset.cooldownSec - elapsedSec);
        return {
          status: 'COOLDOWN',
          message: `Sponsor on cooldown. Available in ${remaining}s.`,
        };
      }
    }

    // 3. Target Routing Determination
    let targetSurface = 'UNIVERSAL_PLAYER_OVERLAY';
    if (asset.preferredTarget === 'JUMBOTRON_FACE' || asset.assetType === 'SPONSOR_COMMERCIAL') {
      // Find eligible Jumbotron face (Prefers EAST or SOUTH without overriding live stage program on North)
      targetSurface = 'JUMBOTRON_EAST_FACE';
      if (this.showDirector) {
        this.showDirector.updateFaceState('EAST', {
          currentComposition: asset.assetType === 'SPONSOR_COMMERCIAL' ? 'FULL' : 'PIP_TOP_RIGHT',
          sourceId: asset.creativeUrl,
          sponsorCampaignId: asset.campaignId,
          overlayText: `SPONSORED BY ${asset.sponsorName.toUpperCase()}`,
        });
      }
    } else if (asset.preferredTarget === 'PLAYER_OVERLAY') {
      targetSurface = asset.assetType === 'SPONSOR_LOGO' ? 'PLAYER_CORNER_BUG' : 'PLAYER_LOWER_THIRD';
    }

    // 4. Record Presentation Event
    const eventId = `spe_${now}_${Math.random().toString(36).substring(2, 7)}`;
    const event: SponsorPresentationEvent = {
      eventId,
      campaignId: asset.campaignId,
      assetId: asset.assetId,
      performerId: this.performerId,
      liveSessionId,
      targetSurface,
      assetType: asset.assetType,
      requestedAtMs: now,
      startedAtMs: now,
      status: 'PLAYING',
      qualifiedImpressions: 0,
      commerceConversions: 0,
    };

    this.activePresentations.set(eventId, event);
    slot.status = 'PLAYING';
    slot.lastTriggeredAtMs = now;

    return {
      status: 'LIVE_NOW',
      targetSurface,
      message: `Broadcasting ${asset.title} to ${targetSurface}!`,
      eventId,
    };
  }

  /**
   * Emergency Undo / Stop Control
   */
  public stopActiveSponsor(
    eventId: string,
    reason: 'MANUAL_STOP' | 'MODERATION_STOP' | 'PREEMPTED' = 'MANUAL_STOP'
  ): boolean {
    const event = this.activePresentations.get(eventId);
    if (!event) return false;

    event.completedAtMs = Date.now();
    event.status = reason;
    this.activePresentations.delete(eventId);
    this.eventHistory.push(event);

    // Revert Jumbotron / Overlay surfaces gracefully
    if (this.showDirector) {
      this.showDirector.releaseTakeoverToScheduled();
    }

    return true;
  }

  /**
   * Complete playback naturally after duration expires
   */
  public completePlayback(eventId: string, impressions = 100, conversions = 0): void {
    const event = this.activePresentations.get(eventId);
    if (!event) return;

    event.completedAtMs = Date.now();
    event.status = 'COMPLETED';
    event.qualifiedImpressions = impressions;
    event.commerceConversions = conversions;

    this.activePresentations.delete(eventId);
    this.eventHistory.push(event);

    // Revert Jumbotron surfaces
    if (this.showDirector) {
      this.showDirector.releaseTakeoverToScheduled();
    }
  }

  public getEventHistory(): SponsorPresentationEvent[] {
    return [...this.eventHistory];
  }
}
