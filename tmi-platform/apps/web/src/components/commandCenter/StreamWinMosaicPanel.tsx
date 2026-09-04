"use client";

/**
 * Stream & Win — radio listening lounge quick panel (NOT LiveLobbyWallHost mosaic).
 * Pipeline: /api/stream-win/songs → StreamWinModeRuntime cast → lounge side-room join.
 */

import React, { useEffect, useState } from "react";
import Link from "next/link";
import MobileQuickPanelShell from "@/components/hud/MobileQuickPanelShell";
import StreamAndWinRadioPlayer from "@/components/radio/StreamAndWinRadioPlayer";
import PlaylistLoungeCanister from "@/components/canisters/PlaylistLoungeCanister";
import {
  subscribeStreamWinState,
  type StreamWinTrackItem,
} from "@/lib/radio/StreamWinModeRuntime";
import {
  loungeSideRoomEntryHref,
  SYSTEM_OPERATED_PLAYLIST_LOUNGE_ROOM_ID,
} from "@/lib/live/canonicalWorldViewport";

const GOLD = "#FFD700";

export interface StreamWinMosaicPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StreamWinMosaicPanel({ isOpen, onClose }: StreamWinMosaicPanelProps) {
  const [casting, setCasting] = useState<StreamWinTrackItem | null>(null);

  useEffect(() => {
    return subscribeStreamWinState(({ state, item }) => {
      setCasting(state === "active" ? item : null);
    });
  }, []);

  const loungeHref = loungeSideRoomEntryHref(SYSTEM_OPERATED_PLAYLIST_LOUNGE_ROOM_ID, {
    from: "stream-win-panel",
  });

  return (
    <MobileQuickPanelShell
      isOpen={isOpen}
      title="📻 STREAM & WIN · LOUNGE"
      accentColor={GOLD}
      onClose={onClose}
    >
      <div
        style={{
          padding: "8px 10px 16px",
          minHeight: 200,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {casting ? (
          <div
            style={{
              fontSize: 9,
              color: GOLD,
              fontWeight: 800,
              letterSpacing: "0.08em",
              padding: "6px 10px",
              borderRadius: 8,
              border: `1px solid ${GOLD}44`,
              background: `${GOLD}10`,
            }}
          >
            ▶ Casting to Command Center monitors: {casting.title}
            {casting.artist ? ` · ${casting.artist}` : ""}
          </div>
        ) : null}

        <StreamAndWinRadioPlayer />

        <Link
          href={loungeHref}
          style={{
            display: "block",
            textAlign: "center",
            padding: "10px 16px",
            borderRadius: 10,
            border: `1px solid ${GOLD}`,
            background: `${GOLD}18`,
            color: GOLD,
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: "0.08em",
            textDecoration: "none",
          }}
        >
          JOIN LISTENING LOUNGE →
        </Link>

        <PlaylistLoungeCanister accentColor="#00FF88" maxLounges={4} />
      </div>
    </MobileQuickPanelShell>
  );
}
