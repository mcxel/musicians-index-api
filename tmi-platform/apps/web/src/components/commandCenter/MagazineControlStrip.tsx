"use client";

/**
 * MagazineControlStrip — locked labels: MAGAZINE, ARTIST ID, LOBBIES, VIDEO SHUFFLE, SNIPS.
 * All actions are in-place modes or compact panels — no route takeover for LOBBIES/STAGE.
 */

import React from "react";
import { useRouter } from "next/navigation";
import { useCompactQuickPanelStore } from "@/lib/hud/compactQuickPanelStore";
import {
  startVideoShuffle,
  exitVideoShuffle,
  isVideoShuffleActive,
  shuffleNextVideo,
} from "@/lib/shuffle/VideoShuffleModeRuntime";

export interface MagazineControlStripProps {
  role: "fan" | "performer";
  onArtistId?: () => void;
}

function StripBtn({
  label,
  onClick,
  active,
  accent = "#fff",
}: {
  label: string;
  onClick?: () => void;
  active?: boolean;
  accent?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flexShrink: 0,
        padding: "5px 10px",
        borderRadius: 8,
        background: active ? `${accent}22` : "rgba(255,255,255,0.04)",
        border: `1px solid ${active ? accent : "rgba(255,255,255,0.12)"}`,
        color: active ? accent : "rgba(255,255,255,0.85)",
        fontSize: 8,
        fontWeight: 900,
        letterSpacing: "0.06em",
        cursor: onClick ? "pointer" : "default",
        fontFamily: "inherit",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

export default function MagazineControlStrip({ role, onArtistId }: MagazineControlStripProps) {
  const router = useRouter();
  const { activePanel, togglePanel, openPanel, closePanel } = useCompactQuickPanelStore();
  const isPerformer = role === "performer";

  const openMagazine = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("tmi_magazine_origin", window.location.pathname + window.location.search);
    }
    router.push("/magazine/issue/current");
  };

  const toggleLobbies = () => togglePanel("lobbies", "bottom-left");

  const toggleVideoShuffle = () => {
    if (isVideoShuffleActive()) {
      exitVideoShuffle();
    } else {
      void startVideoShuffle();
    }
  };

  const toggleSnips = () => {
    if (activePanel === "snips") {
      closePanel();
    } else {
      openPanel("snips", "bottom-right");
    }
  };

  const skipShuffle = () => {
    if (isVideoShuffleActive()) void shuffleNextVideo();
    else void startVideoShuffle();
  };

  return (
    <div
      data-magazine-control-strip
      style={{
        display: "flex",
        gap: 6,
        overflowX: "auto",
        padding: "6px 10px",
        scrollbarWidth: "none" as const,
        borderTop: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(3,3,14,0.85)",
      }}
    >
      <StripBtn label="📰 MAGAZINE" onClick={openMagazine} accent="#FF2DAA" />
      <StripBtn
        label={isPerformer ? "👤 ARTIST ID" : "👤 FAN ID"}
        onClick={onArtistId}
        accent="#FFD700"
      />
      <StripBtn
        label="🏟️ LOBBIES"
        onClick={toggleLobbies}
        active={activePanel === "lobbies"}
        accent="#00FFFF"
      />
      <StripBtn
        label="🔀 VIDEO SHUFFLE"
        onClick={toggleVideoShuffle}
        active={isVideoShuffleActive()}
        accent="#AA2DFF"
      />
      {isVideoShuffleActive() ? (
        <StripBtn label="⏭ SKIP" onClick={skipShuffle} accent="#AA2DFF" />
      ) : null}
      <StripBtn
        label="📱 SNIPS"
        onClick={toggleSnips}
        active={activePanel === "snips"}
        accent="#FFD700"
      />
    </div>
  );
}
