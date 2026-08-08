/**
 * WebRTCSubscriptionGovernor — wall tile subscribe / quality / bind policy (presentation only).
 *
 * **Adaptive bitrate gap (honest):** LobbyPreviewBindRuntime uses a Daily call-object in
 * receive-only mode. This repo does not set publisher simulcast layers on the room side, and
 * the wall client cannot reliably force remote bitrate without room/publisher cooperation.
 * Governed behavior today: focus → allowDailyBind + medium/low quality tier; demote → release
 * bind and fall back to composed-motion / thumb (see applyLobbyPreviewReceiveQuality).
 */

import type { PreviewQuality } from "@/lib/lobby/LobbyPreviewRuntime";
import { getPerformanceGovernorSnapshot, getDevicePresentationTier } from "./PerformanceGovernor";
import {
  LIVE_LOBBY_WALL_CONTRACT_ID,
  type LiveLobbyWallPreviewQuality,
} from "./qualityContracts/LIVE_LOBBY_WALL";
import type { AwrQualityContractId } from "./types";

export type WebRtcTileInput = {
  roomId: string;
  visible: boolean;
  focused: boolean;
  isLive: boolean;
  contract?: AwrQualityContractId;
};

export type WebRtcTilePolicy = {
  subscribed: boolean;
  quality: PreviewQuality;
  allowDailyBind: boolean;
  contractId: AwrQualityContractId;
};

function mapTierToPreviewQuality(
  focused: boolean,
  visible: boolean,
  isLive: boolean,
  presentationTier: ReturnType<typeof getPerformanceGovernorSnapshot>["presentationTier"],
): LiveLobbyWallPreviewQuality {
  if (!visible || !isLive) return visible ? "thumb" : "off";
  if (focused && presentationTier !== "minimal") {
    return presentationTier === "economy" ? "low" : "medium";
  }
  if (presentationTier === "minimal") return "thumb";
  if (presentationTier === "economy") return "thumb";
  return "low";
}

export class WebRTCSubscriptionGovernor {
  resolveTile(input: WebRtcTileInput): WebRtcTilePolicy {
    const contractId = input.contract ?? LIVE_LOBBY_WALL_CONTRACT_ID;
    const gov = getPerformanceGovernorSnapshot();
    const quality = mapTierToPreviewQuality(
      input.focused,
      input.visible,
      input.isLive,
      gov.presentationTier,
    );

    const subscribed = input.visible && input.isLive && quality !== "off";
    const allowDailyBind =
      subscribed &&
      input.focused &&
      (quality === "medium" || quality === "low");

    void getDevicePresentationTier();

    return {
      subscribed,
      quality,
      allowDailyBind,
      contractId,
    };
  }
}

let governor: WebRTCSubscriptionGovernor | null = null;

export function getWebRTCSubscriptionGovernor(): WebRTCSubscriptionGovernor {
  if (!governor) governor = new WebRTCSubscriptionGovernor();
  return governor;
}
