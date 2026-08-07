"use client";

/**
 * useLobbyPreviewBind — tile hook for Continuous Live Lobby Wall.
 * Focused tile owns the single Daily receive-only bind; others use composed / URL preview.
 */

import { useEffect, useState } from "react";
import {
  bindLobbyPreviewRoom,
  getLobbyPreviewBindState,
  subscribeLobbyPreviewBind,
  type LobbyPreviewBindState,
} from "@/lib/lobby/LobbyPreviewBindRuntime";
import { getLobbyAudioFocus } from "@/lib/lobby/LobbyPreviewRuntime";

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
  },
): LobbyPreviewBindResult {
  const [bind, setBind] = useState<LobbyPreviewBindState>(() => getLobbyPreviewBindState());

  useEffect(() => subscribeLobbyPreviewBind(setBind), []);

  // Only the audio-focus (or explicitly focused) live+subscribed tile may bind Daily.
  useEffect(() => {
    if (!opts.isLive || !opts.subscribed) return;
    const focus = getLobbyAudioFocus();
    const shouldOwn = opts.focused || focus === roomId;
    if (!shouldOwn) return;

    void bindLobbyPreviewRoom(roomId);
    return () => {
      const current = getLobbyPreviewBindState();
      if (current.roomId === roomId) {
        void bindLobbyPreviewRoom(null);
      }
    };
  }, [roomId, opts.isLive, opts.subscribed, opts.focused]);

  const ownsBind = bind.roomId === roomId;
  return {
    mediaStream: ownsBind ? bind.mediaStream : null,
    bindStatus: ownsBind ? bind.status : "idle",
    bindReason: ownsBind ? bind.reason : null,
    ownsBind,
  };
}
