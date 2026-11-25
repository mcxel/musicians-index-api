"use client";

import type { ArtistParticipationSnapshot } from "@/lib/economy/StreamAndWinEngine";

/**
 * Drawer/mosaic strip that renders StreamAndWinEngine.getArtistParticipation
 * only. Thresholds and copy are never recalculated here (§8298–8300).
 */
export default function StreamWinParticipationStrip({
  participation,
  playlistPublicName,
  skipsRemaining,
  skipControlEnabled,
}: {
  participation: ArtistParticipationSnapshot | null;
  playlistPublicName?: string | null;
  skipsRemaining?: number | null;
  skipControlEnabled?: boolean | null;
}) {
  if (!participation) {
    return (
      <div
        style={{
          border: "1px solid rgba(255,215,0,0.18)",
          background: "rgba(255,215,0,0.04)",
          padding: "10px 12px",
          marginBottom: 12,
        }}
      >
        <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.22em", color: "#FFD700" }}>
          STREAM &amp; WIN PARTICIPATION
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>
          Sign in to load your server-authoritative 7-day rotation state.
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        border: participation.rotation.atRisk
          ? "1px solid rgba(255,64,64,0.45)"
          : "1px solid rgba(255,215,0,0.22)",
        background: participation.rotation.atRisk
          ? "rgba(255,64,64,0.08)"
          : "rgba(255,215,0,0.05)",
        padding: "10px 12px",
        marginBottom: 12,
      }}
    >
      <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.22em", color: "#FFD700" }}>
        STREAM &amp; WIN PARTICIPATION
      </div>
      <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", marginTop: 6, letterSpacing: "0.04em" }}>
        {participation.progressCopy}
      </div>
      {playlistPublicName ? (
        <div style={{ fontSize: 11, fontWeight: 800, color: "#00FFFF", marginTop: 6 }}>
          {playlistPublicName}
        </div>
      ) : null}
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
        Active songs: {participation.activeSongIds.length}
        {typeof skipsRemaining === "number"
          ? ` · Skips left: ${skipsRemaining}${skipControlEnabled === false ? " · skip closed" : ""}`
          : ""}
      </div>
      {participation.graceWarning ? (
        <div style={{ fontSize: 9, color: "#FF8080", fontWeight: 700, marginTop: 8, lineHeight: 1.4 }}>
          {participation.graceWarning}
        </div>
      ) : null}
    </div>
  );
}
