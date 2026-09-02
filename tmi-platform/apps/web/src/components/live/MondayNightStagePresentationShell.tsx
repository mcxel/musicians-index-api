"use client";

/**
 * MondayNightStagePresentationShell — production show presentation for Monday Night Stage (Phase 1).
 *
 * Center of gravity = host + featured performer + Who's Next — NOT Battle VS,
 * NOT Cypher combat, NOT Regular GO LIVE. Never invents winners, attendance, or scores.
 * surfaceKind = production (green/debug cannot certify experienceCert).
 */

import {
  PROGRAM_MNS_SHOW,
  type MondayNightStageProgramComposition,
} from "@/lib/experiencePresentation/composeMondayNightStageProgram";

export type MondayNightStagePresentationShellProps = {
  composition: MondayNightStageProgramComposition | null;
  programSourceId?: string;
};

export default function MondayNightStagePresentationShell({
  composition,
  programSourceId,
}: MondayNightStagePresentationShellProps) {
  const layout = composition?.composition ?? "STAGE_WIDE";
  const badge = composition?.worldMiniBadge ?? "🌍 WORLD";
  const mainHost = composition?.mainHost ?? null;
  const coHosts = composition?.coHosts ?? [];
  const featured = composition?.featured ?? null;
  const whosNext = composition?.whosNext ?? null;
  const audienceCount = composition?.audiencePresenceCount ?? null;
  const sponsorId = composition?.sponsorId ?? null;
  const resolvedProgram =
    programSourceId ?? composition?.programSourceId ?? PROGRAM_MNS_SHOW;

  return (
    <div
      data-mns-presentation="production"
      data-experience-pack="MondayNightStage"
      data-mns-scope="WORLD"
      data-presentation-composition={layout}
      data-program-source={resolvedProgram}
      data-surface-kind="production"
      data-vs-layout="false"
      data-allows-winner-finale="false"
      data-is-regular-go-live="false"
      data-lifecycle-phase={composition?.lifecyclePhase ?? "PRESHOW"}
      data-winner-id=""
      style={{
        position: "relative",
        width: "100%",
        minHeight: 200,
        overflow: "hidden",
        background: "#050510",
        border: "1px solid rgba(0,255,255,0.4)",
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
          gap: 10,
          minHeight: 200,
          padding: 16,
          background:
            "linear-gradient(180deg, rgba(5,5,16,0.3) 0%, rgba(8,6,40,0.96) 100%)",
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
            MONDAY NIGHT STAGE · SHOW PACKAGE
          </div>
          <span
            data-world-mini-badge="WORLD"
            style={{
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.08em",
              padding: "2px 8px",
              borderRadius: 4,
              border: "1px solid rgba(0,255,255,0.45)",
              color: "#00FFFF",
              background: "rgba(0,255,255,0.08)",
            }}
          >
            {badge}
          </span>
          <span
            style={{
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.1em",
              color: "rgba(255,215,0,0.75)",
            }}
          >
            ≠ GO LIVE
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
          {featured
            ? `NOW ON STAGE · ${featured.displayName}`
            : mainHost
              ? `HOST · ${mainHost.displayName}${mainHost.isBot ? " · [BOT]" : ""}`
              : "Waiting for show — no invented act"}
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
            <span style={{ color: "rgba(0,255,255,0.85)", fontSize: 9, fontWeight: 800 }}>
              HOST{" "}
            </span>
            {mainHost
              ? `${mainHost.displayName}${mainHost.isBot ? " [BOT]" : ""}`
              : "—"}
            {coHosts.length > 0
              ? ` · ${coHosts.map((h) => h.displayName).join(", ")}`
              : ""}
          </div>
          <div
            data-primitive="QueueRail"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            <span style={{ color: "rgba(255,215,0,0.85)", fontSize: 9, fontWeight: 800 }}>
              WHO&apos;S NEXT{" "}
            </span>
            {whosNext ? whosNext.displayName : "— queue empty"}
          </div>
          <div style={{ color: "rgba(255,255,255,0.65)" }}>
            <span style={{ color: "rgba(255,45,170,0.85)", fontSize: 9, fontWeight: 800 }}>
              AUDIENCE{" "}
            </span>
            {audienceCount !== null
              ? `${audienceCount} real presence`
              : "presence unknown — no invented count"}
          </div>
          {sponsorId ? (
            <div style={{ color: "rgba(255,255,255,0.65)" }}>
              <span style={{ color: "rgba(170,45,255,0.85)", fontSize: 9, fontWeight: 800 }}>
                SPONSOR{" "}
              </span>
              {sponsorId}
            </div>
          ) : null}
        </div>

        <div
          data-primitive="ReactionEmitter"
          style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}
        >
          Official show package — not Battle VS, not Cypher circle, not Regular GO LIVE.
        </div>

        {composition?.programSourceId ? (
          <div
            style={{
              marginTop: 4,
              fontSize: 9,
              fontFamily: "monospace",
              color: "rgba(0,255,255,0.65)",
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
