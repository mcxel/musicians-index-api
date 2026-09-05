"use client";

/**
 * FanLobbyPresentationShell — production social hangout presentation (Phase 1).
 *
 * Center of gravity = fan avatars + lobby wall + invite/hangout —
 * NOT Battle VS, NOT Cypher combat, NOT Game Show board, NOT Lounge panels-only.
 * Never invents occupancy or friend lists (Rule 20). Rule 26: FAN avatars OK.
 * surfaceKind = production (green/debug cannot certify experienceCert).
 */

import {
  PROGRAM_FAN_LOBBY,
  type FanLobbyProgramComposition,
} from "@/lib/experiencePresentation/composeFanLobbyProgram";

export type FanLobbyPresentationShellProps = {
  composition: FanLobbyProgramComposition | null;
  programSourceId?: string;
};

export default function FanLobbyPresentationShell({
  composition,
  programSourceId,
}: FanLobbyPresentationShellProps) {
  const layout = composition?.composition ?? "HOST_CLOSE";
  const badge = composition?.worldMiniBadge ?? "⭐ FAN";
  const skinLabel = composition?.skinLabel ?? null;
  const presenceCount = composition?.presenceCount ?? null;
  const resolvedProgram =
    programSourceId ?? composition?.programSourceId ?? PROGRAM_FAN_LOBBY;

  return (
    <div
      data-fan-lobby-presentation="production"
      data-experience-pack="FanLive"
      data-presentation-composition={layout}
      data-program-source={resolvedProgram}
      data-surface-kind="production"
      data-presence-model="FAN_AVATARS"
      data-vs-layout="false"
      data-allows-winner-finale="false"
      data-lifecycle-phase={composition?.lifecyclePhase ?? "HANGOUT"}
      data-winner-id=""
      style={{
        position: "relative",
        width: "100%",
        minHeight: 160,
        overflow: "hidden",
        background: "#050510",
        border: "1px solid rgba(0,255,255,0.45)",
        borderRadius: 4,
        boxShadow: "inset 0 0 36px rgba(0,255,255,0.1)",
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
            "linear-gradient(180deg, rgba(5,5,16,0.3) 0%, rgba(6,20,40,0.96) 100%)",
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
              color: "#00FFFF",
            }}
          >
            FAN LOBBY · SOCIAL HANGOUT
          </div>
          <span
            data-world-mini-badge="FAN"
            style={{
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.08em",
              padding: "2px 8px",
              borderRadius: 4,
              border: "1px solid rgba(255,215,0,0.45)",
              color: "#FFD700",
              background: "rgba(255,215,0,0.08)",
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
            textShadow: "0 0 18px rgba(0,255,255,0.35)",
            lineHeight: 1.25,
          }}
        >
          {skinLabel ? skinLabel : "Fan Lobby"}
        </div>

        <div
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.65)",
            letterSpacing: "0.04em",
          }}
        >
          {presenceCount != null
            ? `Presence · ${presenceCount}`
            : "Presence · waiting for lobby sync"}
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
            data-primitive="ReactionEmitter"
            style={{
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.1em",
              color: "rgba(0,255,255,0.7)",
              border: "1px solid rgba(0,255,255,0.25)",
              padding: "2px 6px",
              borderRadius: 3,
            }}
          >
            AVATARS OK · RULE 26 FAN
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
            ≠ BATTLE VS · ≠ CYPHER · ≠ GAME SHOW
          </span>
        </div>
      </div>
    </div>
  );
}
