"use client";

/**
 * ReleasePresentationShell — production premiere presentation for World / Mini Release (Phase 1).
 *
 * Center of gravity = artist + release media + countdown + real merch CTAs —
 * NOT Battle VS, NOT Cypher circle combat. Never invents streams, preorders, or attendance.
 * surfaceKind = production (green/debug cannot certify experienceCert).
 */

import {
  PROGRAM_RELEASE_PREMIERE,
  type ReleaseProgramComposition,
} from "@/lib/experiencePresentation/composeReleaseProgram";

export type ReleasePresentationShellProps = {
  composition: ReleaseProgramComposition | null;
  programSourceId?: string;
};

export default function ReleasePresentationShell({
  composition,
  programSourceId,
}: ReleasePresentationShellProps) {
  const layout = composition?.composition ?? "STAGE_WIDE";
  const badge = composition?.worldMiniBadge ?? "⭐ MINI";
  const artist = composition?.artist ?? null;
  const release = composition?.release ?? null;
  const countdown = composition?.countdownRemainingSec ?? null;
  const merch = composition?.merchCtas ?? [];
  const resolvedProgram =
    programSourceId ?? composition?.programSourceId ?? PROGRAM_RELEASE_PREMIERE;
  const packId = composition?.packId ?? "WorldRelease";

  return (
    <div
      data-release-presentation="production"
      data-experience-pack={packId}
      data-release-scope={composition?.scope ?? "MINI"}
      data-presentation-composition={layout}
      data-program-source={resolvedProgram}
      data-surface-kind="production"
      data-vs-layout="false"
      data-allows-winner-finale="false"
      data-lifecycle-phase={composition?.lifecyclePhase ?? "PRESHOW"}
      data-winner-id=""
      style={{
        position: "relative",
        width: "100%",
        minHeight: 280,
        overflow: "hidden",
        background: "#050510",
        border: "1px solid rgba(255,140,0,0.45)",
        borderRadius: 4,
        boxShadow: "inset 0 0 36px rgba(255,140,0,0.12)",
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
            release?.artworkUrl
              ? `linear-gradient(180deg, rgba(5,5,16,0.45) 0%, rgba(20,10,4,0.96) 100%), url(${release.artworkUrl}) center/cover`
              : "linear-gradient(180deg, rgba(5,5,16,0.3) 0%, rgba(20,10,4,0.96) 100%)",
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
              color: "#FF8C00",
            }}
          >
            RELEASE PARTY · PREMIERE
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
          {countdown != null && countdown > 0 ? (
            <span
              data-primitive="TimerRing"
              style={{
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: "0.08em",
                padding: "2px 10px",
                borderRadius: 4,
                border: "1px solid rgba(255,140,0,0.55)",
                color: "#FF8C00",
                background: "rgba(255,140,0,0.12)",
              }}
            >
              DROP IN {countdown}s
            </span>
          ) : null}
        </div>

        <div
          data-primitive="IdentityPanel"
          style={{
            fontSize: 20,
            fontWeight: 900,
            color: "#fff",
            textShadow: "0 0 18px rgba(255,140,0,0.35)",
            lineHeight: 1.25,
          }}
        >
          {release
            ? release.title
            : "Waiting for release — no invented drop"}
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
            <span style={{ color: "rgba(255,140,0,0.85)", fontSize: 9, fontWeight: 800 }}>
              ARTIST{" "}
            </span>
            {artist?.displayName ?? "— no artist yet"}
          </div>
          <div style={{ color: "rgba(255,255,255,0.65)" }}>
            <span style={{ color: "rgba(0,255,255,0.75)", fontSize: 9, fontWeight: 800 }}>
              MERCH{" "}
            </span>
            {merch.length > 0
              ? `${merch.length} real CTA${merch.length === 1 ? "" : "s"}`
              : "none — no invented preorders"}
          </div>
        </div>

        {merch.length > 0 ? (
          <div
            data-primitive="QueueRail"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              fontSize: 11,
            }}
          >
            {merch.map((m) => (
              <a
                key={m.productId}
                href={m.href}
                style={{
                  padding: "3px 8px",
                  borderRadius: 4,
                  border: "1px solid rgba(255,140,0,0.45)",
                  background: "rgba(255,140,0,0.1)",
                  color: "#FF8C00",
                  textDecoration: "none",
                  fontWeight: 700,
                }}
              >
                {m.title}
                {m.priceLabel ? ` · ${m.priceLabel}` : ""}
              </a>
            ))}
          </div>
        ) : null}

        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
          Premiere focus + listening energy — not Battle VS, not Cypher combat circle.
        </div>

        {composition?.programSourceId ? (
          <div
            style={{
              marginTop: 4,
              fontSize: 9,
              fontFamily: "monospace",
              color: "rgba(255,140,0,0.65)",
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
