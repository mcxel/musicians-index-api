"use client";

/**
 * DancePartyPresentationShell — production DJ + floor presentation for World Dance Party (Phase 1).
 *
 * Center of gravity = DJ + dance floor / group energy — NOT Battle VS, NOT Cypher combat.
 * Never invents DJ, tracks, dancer counts, tips, or scores.
 * surfaceKind = production (green/debug cannot certify experienceCert).
 */

import {
  PROGRAM_WDP_COMPOSITE,
  type DancePartyProgramComposition,
} from "@/lib/experiencePresentation/composeDancePartyProgram";

export type DancePartyPresentationShellProps = {
  composition: DancePartyProgramComposition | null;
  programSourceId?: string;
};

export default function DancePartyPresentationShell({
  composition,
  programSourceId,
}: DancePartyPresentationShellProps) {
  const layout = composition?.composition ?? "FLOOR_WIDE";
  const badge = composition?.worldMiniBadge ?? "🌍 WORLD";
  const dj = composition?.dj ?? null;
  const nowPlaying = composition?.nowPlaying ?? null;
  const floorCount = composition?.floorPresenceCount ?? null;
  const resolvedProgram =
    programSourceId ?? composition?.programSourceId ?? PROGRAM_WDP_COMPOSITE;

  return (
    <div
      data-dance-party-presentation="production"
      data-experience-pack="DanceParty"
      data-dance-party-scope={composition?.scope ?? "WORLD"}
      data-presentation-composition={layout}
      data-program-source={resolvedProgram}
      data-surface-kind="production"
      data-vs-layout="false"
      data-allows-winner-finale="false"
      data-lifecycle-phase={composition?.lifecyclePhase ?? "VENUE_OPENING"}
      data-winner-id=""
      style={{
        position: "relative",
        width: "100%",
        minHeight: 200,
        overflow: "hidden",
        background: "#050510",
        border: "1px solid rgba(255,45,170,0.45)",
        borderRadius: 4,
        boxShadow: "inset 0 0 36px rgba(255,45,170,0.12)",
      }}
    >
      <div
        data-primitive="LiveVideoPanel"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          gap: 10,
          minHeight: 200,
          padding: 16,
          background:
            "linear-gradient(180deg, rgba(5,5,16,0.3) 0%, rgba(20,6,40,0.96) 100%)",
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
              color: "#FF2DAA",
            }}
          >
            DANCE PARTY · DJ + FLOOR
          </div>
          <span
            data-world-mini-badge={composition?.scope ?? "WORLD"}
            style={{
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.08em",
              padding: "2px 8px",
              borderRadius: 4,
              border:
                composition?.scope === "MINI"
                  ? "1px solid rgba(255,215,0,0.45)"
                  : "1px solid rgba(0,255,255,0.45)",
              color: composition?.scope === "MINI" ? "#FFD700" : "#00FFFF",
              background:
                composition?.scope === "MINI"
                  ? "rgba(255,215,0,0.08)"
                  : "rgba(0,255,255,0.08)",
            }}
          >
            {badge}
          </span>
        </div>

        <div
          data-primitive="IdentityPanel"
          style={{
            fontSize: 20,
            fontWeight: 900,
            color: "#fff",
            textShadow: "0 0 18px rgba(0,255,255,0.35)",
            lineHeight: 1.25,
          }}
        >
          {dj
            ? `DJ BOOTH · ${dj.displayName}${dj.isBot ? " · [BOT]" : ""}`
            : "Waiting for DJ — no invented host"}
        </div>

        <div
          data-primitive="LowerThird"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            fontSize: 12,
          }}
        >
          <div style={{ color: "rgba(255,255,255,0.85)" }}>
            <span style={{ color: "rgba(255,45,170,0.85)", fontSize: 9, fontWeight: 800 }}>
              NOW PLAYING{" "}
            </span>
            {nowPlaying
              ? `${nowPlaying.title} · ${nowPlaying.artistName}`
              : "— no track yet"}
          </div>
          <div
            data-primitive="AudioVisualizer"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            <span style={{ color: "rgba(0,255,255,0.75)", fontSize: 9, fontWeight: 800 }}>
              BPM{" "}
            </span>
            {typeof nowPlaying?.bpm === "number" ? nowPlaying.bpm : "—"}
          </div>
          <div style={{ color: "rgba(255,255,255,0.65)" }}>
            <span style={{ color: "rgba(170,45,255,0.85)", fontSize: 9, fontWeight: 800 }}>
              FLOOR{" "}
            </span>
            {floorCount !== null
              ? `${floorCount} real presence`
              : "presence unknown — no invented count"}
          </div>
        </div>

        <div
          data-primitive="ReactionEmitter"
          style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}
        >
          DJ + dance floor energy — not Battle VS, not Cypher combat circle.
        </div>

        {composition?.programSourceId ? (
          <div
            style={{
              marginTop: 4,
              fontSize: 9,
              fontFamily: "monospace",
              color: "rgba(255,45,170,0.65)",
              letterSpacing: "0.06em",
            }}
          >
            {composition.programSourceId} · {layout}
          </div>
        ) : null}
      </div>
    </div>
  );
}
