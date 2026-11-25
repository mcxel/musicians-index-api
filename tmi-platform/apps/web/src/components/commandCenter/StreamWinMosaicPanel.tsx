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
import StreamWinParticipationStrip from "@/components/stream-win/StreamWinParticipationStrip";
import type { ArtistParticipationSnapshot } from "@/lib/economy/StreamAndWinEngine";
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
  const [participation, setParticipation] = useState<ArtistParticipationSnapshot | null>(null);
  const [playlistPublicName, setPlaylistPublicName] = useState<string | null>(null);

  useEffect(() => {
    return subscribeStreamWinState(({ state, item }) => {
      setCasting(state === "active" ? item : null);
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    fetch("/api/stream-win/songs", { cache: "no-store", credentials: "include" })
      .then((r) => (r.ok ? r.json() : { participation: null }))
      .then((d: { participation?: ArtistParticipationSnapshot | null; playlist?: { publicName?: string | null } }) => {
        if (!cancelled) {
          setParticipation(d.participation ?? null);
          setPlaylistPublicName(d.playlist?.publicName ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) setParticipation(null);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

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
        <StreamWinParticipationStrip participation={participation} playlistPublicName={playlistPublicName} />

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

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <Link
            href="/submit?target=stream-and-win"
            data-testid="stream-win-submit-cta"
            style={{
              display: "block",
              textAlign: "center",
              padding: "9px 10px",
              borderRadius: 8,
              border: "1px solid rgba(0,255,255,0.45)",
              background: "rgba(0,255,255,0.12)",
              color: "#00FFFF",
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: "0.08em",
              textDecoration: "none",
            }}
          >
            + SUBMIT TRACK TO RADIO
          </Link>
          <a
            href="/api/stripe/checkout?type=discovery_boost&tier=entry_299&target=stream_win_radio&mode=payment"
            data-testid="stream-win-boost-299-cta"
            title="Promote your submitted track in Stream & Win Radio discovery for 4 hours ($2.99)."
            style={{
              display: "block",
              textAlign: "center",
              padding: "9px 10px",
              borderRadius: 8,
              border: "1px solid rgba(255,215,0,0.55)",
              background: "linear-gradient(90deg, rgba(255,215,0,0.2), rgba(255,45,170,0.2))",
              color: GOLD,
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: "0.08em",
              textDecoration: "none",
            }}
          >
            🚀 BOOST ROTATION ($2.99 · 4H)
          </a>
        </div>

        <PlaylistLoungeCanister accentColor="#00FF88" maxLounges={4} />
      </div>
    </MobileQuickPanelShell>
  );
}
