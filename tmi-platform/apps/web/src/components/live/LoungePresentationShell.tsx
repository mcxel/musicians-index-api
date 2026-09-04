"use client";

/**
 * LoungePresentationShell — production panel-social presentation (Phase 1).
 *
 * Center of gravity = WebRTC free-roam panels + proximity talk (+ playlist optional) —
 * NOT Fan Lobby avatar stadium, NOT Battle VS, NOT Cypher, NOT Game Show board.
 * Never invents panel counts or friends (Rule 20).
 * surfaceKind = production (green/debug cannot certify experienceCert).
 */

import {
  PROGRAM_LOUNGE,
  type LoungeProgramComposition,
} from "@/lib/experiencePresentation/composeLoungeProgram";

export type LoungePresentationShellProps = {
  composition: LoungeProgramComposition | null;
  programSourceId?: string;
};

export default function LoungePresentationShell({
  composition,
  programSourceId,
}: LoungePresentationShellProps) {
  const layout = composition?.composition ?? "HOST_CLOSE";
  const badge = composition?.worldMiniBadge ?? "⭐ LOUNGE";
  const loungeMode = composition?.loungeMode ?? "CHILL_LOUNGE";
  const playlistTitle = composition?.playlistTitle ?? null;
  const panelCount = composition?.panelPresenceCount ?? null;
  const resolvedProgram =
    programSourceId ?? composition?.programSourceId ?? PROGRAM_LOUNGE;

  return (
    <div
      data-lounge-presentation="production"
      data-experience-pack="Lounge"
      data-lounge-mode={loungeMode}
      data-presentation-composition={layout}
      data-program-source={resolvedProgram}
      data-surface-kind="production"
      data-presence-model="WEBRTC_PANELS"
      data-avatar-occupancy-allowed="false"
      data-vs-layout="false"
      data-allows-winner-finale="false"
      data-lifecycle-phase={composition?.lifecyclePhase ?? "ROAM"}
      data-winner-id=""
      style={{
        position: "relative",
        width: "100%",
        minHeight: 160,
        overflow: "hidden",
        background: "#050510",
        border: "1px solid rgba(170,45,255,0.45)",
        borderRadius: 4,
        boxShadow: "inset 0 0 36px rgba(170,45,255,0.12)",
      }}
    >
      <div
        data-primitive="LiveVideoPanel"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          gap: 8,
          minHeight: 160,
          padding: 14,
          background:
            "linear-gradient(180deg, rgba(5,5,16,0.3) 0%, rgba(24,6,40,0.96) 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: "0.16em",
              color: "#AA2DFF",
            }}
          >
            {loungeMode === "PLAYLIST_LOUNGE"
              ? "PLAYLIST LOUNGE · PANELS + PLAYLIST"
              : "LOUNGE · WEBRTC PANELS"}
          </div>
          <span
            data-world-mini-badge={loungeMode}
            style={{
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.08em",
              padding: "2px 8px",
              borderRadius: 4,
              border: "1px solid rgba(170,45,255,0.45)",
              color: "#E0B0FF",
              background: "rgba(170,45,255,0.1)",
            }}
          >
            {badge}
          </span>
        </div>

        <div
          data-primitive="IdentityPanel"
          style={{
            fontSize: 18,
            fontWeight: 900,
            color: "#fff",
            textShadow: "0 0 18px rgba(170,45,255,0.35)",
            lineHeight: 1.25,
          }}
        >
          {playlistTitle
            ? playlistTitle
            : loungeMode === "PLAYLIST_LOUNGE"
              ? "Playlist Lounge"
              : "VIP Lounge"}
        </div>

        <div
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.65)",
            letterSpacing: "0.04em",
          }}
        >
          {panelCount != null
            ? `Panels · ${panelCount}`
            : "Panels · waiting for real video presence"}
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            marginTop: 4,
          }}
        >
          <span
            data-primitive="AudioVisualizer"
            style={{
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.1em",
              color: "rgba(170,45,255,0.85)",
              border: "1px solid rgba(170,45,255,0.3)",
              padding: "2px 6px",
              borderRadius: 3,
            }}
          >
            NO AVATARS · PANELS ONLY
          </span>
          <span
            style={{
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.45)",
              border: "1px solid rgba(255,255,255,0.15)",
              padding: "2px 6px",
              borderRadius: 3,
            }}
          >
            ≠ FAN LOBBY STADIUM · ≠ BATTLE VS · ≠ CYPHER
          </span>
        </div>
      </div>
    </div>
  );
}
