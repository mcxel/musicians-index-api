"use client";

/**
 * ConcertPresentationShell — production stage presentation for Concert / World Concert (Phase 1).
 *
 * Center of gravity = stage headliner + setlist + audience presence — NOT Battle VS,
 * NOT Cypher circle combat. Never invents headliner, attendance, tips, or scores.
 * surfaceKind = production (green/debug cannot certify experienceCert).
 */

import {
  PROGRAM_CONCERT_STAGE,
  type ConcertProgramComposition,
} from "@/lib/experiencePresentation/composeConcertProgram";

export type ConcertPresentationShellProps = {
  composition: ConcertProgramComposition | null;
  programSourceId?: string;
};

export default function ConcertPresentationShell({
  composition,
  programSourceId,
}: ConcertPresentationShellProps) {
  const layout = composition?.composition ?? "STAGE_WIDE";
  const badge = composition?.worldMiniBadge ?? "⭐ MINI";
  const headliner = composition?.headliner ?? null;
  const nowPlaying = composition?.nowPlaying ?? null;
  const setlist = composition?.setlist ?? [];
  const resolvedProgram =
    programSourceId ?? composition?.programSourceId ?? PROGRAM_CONCERT_STAGE;
  const packId = composition?.packId ?? "Concert";

  return (
    <div
      data-concert-presentation="production"
      data-experience-pack={packId}
      data-concert-scope={composition?.scope ?? "MINI"}
      data-presentation-composition={layout}
      data-program-source={resolvedProgram}
      data-surface-kind="production"
      data-vs-layout="false"
      data-allows-winner-finale="false"
      data-lifecycle-phase={composition?.lifecyclePhase ?? "VENUE_PREP"}
      data-winner-id=""
      style={{
        position: "relative",
        width: "100%",
        minHeight: 280,
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
          minHeight: 280,
          padding: 16,
          background:
            "linear-gradient(180deg, rgba(5,5,16,0.3) 0%, rgba(20,6,24,0.96) 100%)",
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
            CONCERT · STAGE + AUDIENCE
          </div>
          <span
            data-world-mini-badge={composition?.scope ?? "MINI"}
            style={{
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.08em",
              padding: "2px 8px",
              borderRadius: 4,
              border:
                composition?.scope === "WORLD"
                  ? "1px solid rgba(0,255,255,0.45)"
                  : "1px solid rgba(255,215,0,0.45)",
              color: composition?.scope === "WORLD" ? "#00FFFF" : "#FFD700",
              background:
                composition?.scope === "WORLD"
                  ? "rgba(0,255,255,0.08)"
                  : "rgba(255,215,0,0.08)",
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
            textShadow: "0 0 18px rgba(255,45,170,0.35)",
            lineHeight: 1.25,
          }}
        >
          {headliner
            ? `ON STAGE · ${headliner.displayName}`
            : "Waiting for headliner — no invented performer"}
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
            {nowPlaying?.title ?? "— no track yet"}
          </div>
          <div style={{ color: "rgba(255,255,255,0.65)" }}>
            <span style={{ color: "rgba(0,255,255,0.75)", fontSize: 9, fontWeight: 800 }}>
              SETLIST{" "}
            </span>
            {setlist.length > 0
              ? `${setlist.length} real track${setlist.length === 1 ? "" : "s"}`
              : "empty — no invented songs"}
          </div>
        </div>

        {setlist.length > 0 ? (
          <div
            data-primitive="QueueRail"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              fontSize: 11,
              color: "rgba(255,255,255,0.7)",
            }}
          >
            {setlist.map((t) => {
              const isLive = nowPlaying?.trackId === t.trackId;
              return (
                <span
                  key={t.trackId}
                  style={{
                    padding: "3px 8px",
                    borderRadius: 4,
                    border: isLive
                      ? "1px solid rgba(255,45,170,0.55)"
                      : "1px solid rgba(255,255,255,0.15)",
                    background: isLive
                      ? "rgba(255,45,170,0.12)"
                      : "rgba(255,255,255,0.04)",
                    color: isLive ? "#FF2DAA" : "rgba(255,255,255,0.7)",
                  }}
                >
                  {isLive ? "▶ " : ""}
                  {t.title}
                  {t.isEncoreTrack ? " · ENCORE" : ""}
                </span>
              );
            })}
          </div>
        ) : null}

        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
          Stage focus + audience presence — not Battle VS, not Cypher combat circle.
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
