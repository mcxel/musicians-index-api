/**
 * Live venue skin owner.
 * VenueSkinCommerce resolves a userId. It does not say whether that user
 * is the room creator, the event, or the performer currently on stage.
 * OWNER_PREFERENCE_APPLIED_NO_PRIOR_POLICY:
 * a regular room uses the creator/room skin; an organized event uses the
 * event skin; a rotating performer does not repaint the theater.
 */

import { resolveBaseVenueSkin } from "@/lib/venues/TierBaseVenueSkin";
import { getVenueSkinsByCertification, VENUE_SKINS, type VenueSkin } from "@/lib/venue/venueSkinEngine";

export const SKIN_SELECTION_OWNER_POLICY = "OWNER_PREFERENCE_APPLIED_NO_PRIOR_POLICY" as const;

export type LiveVenueSkinKind = "REGULAR_ROOM" | "ORGANIZED_EVENT";

export interface LiveVenueSkinBinding {
  policy: typeof SKIN_SELECTION_OWNER_POLICY;
  kind: LiveVenueSkinKind;
  skinId: string;
  source: "equipped" | "tier_base";
  environmentId: string;
  roomId: string;
  rejectedRotatingPerformerSkin: boolean;
  /** Cosmetic only. Callers must not tear down the live session when this is false. */
  cosmeticFailure: false;
}

export function certifiedPurchasableSkinIds(): string[] {
  return [
    ...getVenueSkinsByCertification("CERTIFIED"),
    ...getVenueSkinsByCertification("PRODUCTION"),
  ].map((skin) => skin.id);
}

export function isPurchasedVenueSkinId(
  skinId: string | null | undefined,
  catalog: Record<string, Pick<VenueSkin, "certificationStatus">> = VENUE_SKINS,
): boolean {
  if (!skinId) return false;
  return Object.prototype.hasOwnProperty.call(catalog, skinId);
}

function skinIsLiveCertified(
  skinId: string,
  catalog: Record<string, Pick<VenueSkin, "certificationStatus">>,
): boolean {
  const status = catalog[skinId]?.certificationStatus ?? "DRAFT";
  return status === "CERTIFIED" || status === "PRODUCTION";
}

export function resolveLiveVenueSkinBinding(input: {
  kind: LiveVenueSkinKind;
  roomId: string;
  environmentId: string;
  /** Skin equipped by the room creator or the event. Never the rotating performer. */
  roomOrEventEquippedSkinId?: string | null;
  equippedSkinOwnedByAuthority: boolean;
  authorityTier?: string | null;
  rotatingPerformerSkinId?: string | null;
  /** Defaults to the real catalog. Tests may pass a certified fixture. */
  catalog?: Record<string, Pick<VenueSkin, "certificationStatus">>;
}): LiveVenueSkinBinding {
  const catalog = input.catalog ?? VENUE_SKINS;
  const environmentId = input.environmentId;
  const rotating = input.rotatingPerformerSkinId?.trim() || null;
  const equipped = input.roomOrEventEquippedSkinId?.trim() || null;
  const rejectedRotatingPerformerSkin = Boolean(rotating && rotating !== equipped);
  const tierBase = resolveBaseVenueSkin(input.authorityTier ?? "FREE");

  if (
    equipped &&
    input.equippedSkinOwnedByAuthority &&
    isPurchasedVenueSkinId(equipped, catalog) &&
    skinIsLiveCertified(equipped, catalog)
  ) {
    return {
      policy: SKIN_SELECTION_OWNER_POLICY,
      kind: input.kind,
      skinId: equipped,
      source: "equipped",
      environmentId,
      roomId: input.roomId,
      rejectedRotatingPerformerSkin,
      cosmeticFailure: false,
    };
  }

  return {
    policy: SKIN_SELECTION_OWNER_POLICY,
    kind: input.kind,
    skinId: tierBase.id,
    source: "tier_base",
    environmentId,
    roomId: input.roomId,
    rejectedRotatingPerformerSkin,
    cosmeticFailure: false,
  };
}
