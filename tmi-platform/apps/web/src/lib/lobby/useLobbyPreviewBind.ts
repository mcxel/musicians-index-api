"use client";

/**
 * useLobbyPreviewBind — tile hook for Continuous Live Lobby Wall.
 * Focused tile owns the single Daily receive-only bind; others use composed / URL preview.
 * Broadcaster self-view: when this room is the hub-published LiveSession, reuse the
 * same local previewStream (no second getUserMedia).
 */

import { useEffect, useState } from "react";
import {
  bindLobbyPreviewRoom,
  getLobbyPreviewBindState,
  subscribeLobbyPreviewBind,
  applyLobbyPreviewReceiveQuality,
  type LobbyPreviewBindState,
} from "@/lib/lobby/LobbyPreviewBindRuntime";
import { getLobbyAudioFocus } from "@/lib/lobby/LobbyPreviewRuntime";
import { getWebRTCSubscriptionGovernor } from "@/lib/adaptiveWorldRuntime/WebRTCSubscriptionGovernor";
import { LIVE_LOBBY_WALL_CONTRACT_ID } from "@/lib/adaptiveWorldRuntime/qualityContracts/LIVE_LOBBY_WALL";
import type { PreviewQuality } from "@/lib/lobby/LobbyPreviewRuntime";
import { useLivePrivacyState } from "@/lib/live/livePrivacyState";

export type LobbyPreviewBindResult = {
  mediaStream: MediaStream | null;
  bindStatus: LobbyPreviewBindState["status"];
  bindReason: string | null;
  /** True when this tile owns the singleton Daily preview bind. */
  ownsBind: boolean;
};

export function useLobbyPreviewBind(
  roomId: string,
  opts: {
    subscribed: boolean;
    focused: boolean;
    isLive: boolean;
    quality?: PreviewQuality;
  },
): LobbyPreviewBindResult {
  const [bind, setBind] = useState<LobbyPreviewBindState>(() => getLobbyPreviewBindState());
  const ownsBind = bind.roomId === roomId;
  const publishedRoomId = useLivePrivacyState((s) => s.publishedRoomId);
  const previewStream = useLivePrivacyState((s) => s.previewStream);
  const isSelfBroadcast = Boolean(
    publishedRoomId &&
      publishedRoomId === roomId &&
      previewStream &&
      previewStream.getVideoTracks().some((t) => t.readyState === "live"),
  );

  useEffect(() => subscribeLobbyPreviewBind(setBind), []);

  // Only the audio-focus (or explicitly focused) live+subscribed tile may bind Daily.
  // Skip Daily bind for self-broadcast — local previewStream is the moving panel source.
  useEffect(() => {
    if (isSelfBroadcast) return;
    if (!opts.isLive || !opts.subscribed) return;
    const focus = getLobbyAudioFocus();
    const shouldOwn = opts.focused || focus === roomId;
    const policy = getWebRTCSubscriptionGovernor().resolveTile({
      roomId,
      visible: opts.subscribed,
      focused: shouldOwn,
      isLive: opts.isLive,
      contract: LIVE_LOBBY_WALL_CONTRACT_ID,
    });
    if (!shouldOwn || !policy.allowDailyBind) return;

    void bindLobbyPreviewRoom(roomId);
    return () => {
      const current = getLobbyPreviewBindState();
      if (current.roomId === roomId) {
        void bindLobbyPreviewRoom(null);
      }
    };
  }, [roomId, opts.isLive, opts.subscribed, opts.focused, isSelfBroadcast]);

  useEffect(() => {
    if (!ownsBind || !opts.quality || isSelfBroadcast) return;
    void applyLobbyPreviewReceiveQuality(opts.quality);
  }, [ownsBind, opts.quality, roomId, isSelfBroadcast]);

  return {
    mediaStream: isSelfBroadcast ? previewStream : ownsBind ? bind.mediaStream : null,
    bindStatus: isSelfBroadcast ? "live" : ownsBind ? bind.status : "idle",
    bindReason: isSelfBroadcast ? "self_hub_preview" : ownsBind ? bind.reason : null,
    ownsBind: isSelfBroadcast || ownsBind,
  };
}
