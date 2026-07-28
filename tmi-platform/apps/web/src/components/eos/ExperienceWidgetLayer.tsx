"use client";

import type { WidgetDefinition } from "@/core/eos/types";
import PerformanceVotePanel from "@/components/arena/PerformanceVotePanel";
import CompetitionScoreboard from "@/components/competition/presentation/CompetitionScoreboard";
import CompetitionCrowdMeter from "@/components/competition/presentation/CompetitionCrowdMeter";
import CompetitionTimer from "@/components/competition/presentation/CompetitionTimer";
import CompetitionVSOverlay from "@/components/competition/presentation/CompetitionVSOverlay";
import CompetitionRoundBanner from "@/components/competition/presentation/CompetitionRoundBanner";
import CompetitionResultsOverlay from "@/components/competition/presentation/CompetitionResultsOverlay";
import CompetitionHUD from "@/components/competition/presentation/CompetitionHUD";
import DiscoveryRail from "@/components/discovery/DiscoveryRail";
import UnifiedAdSlot from "@/components/ads/UnifiedAdSlot";
import AudienceReactionBar from "@/components/live/AudienceReactionBar";
import CypherQueuePanel from "@/components/eos/widgets/CypherQueuePanel";
import CypherMicControl from "@/components/eos/widgets/CypherMicControl";
import CypherBeatPlayer from "@/components/eos/widgets/CypherBeatPlayer";
import CypherStatusHUD from "@/components/eos/widgets/CypherStatusHUD";
import CypherRoundTimer from "@/components/eos/widgets/CypherRoundTimer";
import type { CompetitionFormat } from "@/lib/competition/ThemeRegistry";

export interface ExperienceWidgetLayerProps {
  widgets: WidgetDefinition[];
  roomId: string;
  format?: CompetitionFormat;
  accentColor?: string;
}

const LAYER_Z: Record<WidgetDefinition["layer"], number> = {
  ambient: 10,
  panel: 20,
  hud: 25,
  overlay: 30,
};

function competitionFormatFromCategory(category: string): CompetitionFormat {
  if (category === "CYPHER") return "CYPHER";
  if (category === "CHALLENGE") return "CHALLENGE";
  return "BATTLE";
}

function groupWidgetsByLayer(widgets: WidgetDefinition[]) {
  return widgets.reduce<Record<WidgetDefinition["layer"], WidgetDefinition[]>>(
    (acc, widget) => {
      acc[widget.layer] = acc[widget.layer] ?? [];
      acc[widget.layer]!.push(widget);
      return acc;
    },
    { ambient: [], panel: [], hud: [], overlay: [] }
  );
}

function renderWidget(
  widget: WidgetDefinition,
  roomId: string,
  format: CompetitionFormat,
  accentColor: string
) {
  switch (widget.id) {
    case "voting_panel":
      return (
        <PerformanceVotePanel
          battleId={roomId}
          artistALabel="Challenger"
          artistBLabel="Defender"
          accentA="#00FFFF"
          accentB="#FF2DAA"
          autoOpenVoting
        />
      );
    case "leaderboard":
      return (
        <CompetitionScoreboard
          format={format}
          leftParticipant={null}
          rightParticipant={null}
        />
      );
    case "crowd_meter":
    case "boo_meter":
      return <CompetitionCrowdMeter format={format} crowdEnergy={null} />;
    case "round_timer":
      return format === "CYPHER" ? (
        <CypherRoundTimer />
      ) : (
        <CompetitionTimer format={format} remainingSeconds={null} />
      );
    case "vs_overlay":
      return (
        <CompetitionVSOverlay
          format={format}
          leftParticipant={null}
          rightParticipant={null}
        />
      );
    case "round_banner":
      return <CompetitionRoundBanner format={format} phase="WAITING" roundLabel={null} />;
    case "results_overlay":
      return (
        <CompetitionResultsOverlay
          format={format}
          phase="WAITING"
          leftParticipant={null}
          rightParticipant={null}
          winnerParticipantId={null}
        />
      );
    case "battle_status":
      return <CompetitionHUD format={format} roomId={roomId} roundLabel={null} />;
    case "cypher_status":
      return <CypherStatusHUD roomId={roomId} />;
    case "queue_system":
      return <CypherQueuePanel />;
    case "mic_control":
      return <CypherMicControl />;
    case "beat_player":
      return <CypherBeatPlayer />;
    case "discovery_rail":
      return (
        <DiscoveryRail
          type="performers"
          limit={4}
          label="Related Performers"
          accentColor={accentColor}
        />
      );
    case "sponsor_rail":
      return (
        <UnifiedAdSlot
          venue="battle-live"
          slotKey="roomLeaderboard"
          format="horizontal"
          label="Sponsor"
          accentColor={accentColor}
        />
      );
    case "audience_reaction_bar":
      return <AudienceReactionBar roomId={roomId} />;
    case "broadcast_controls":
      return (
        <div
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid rgba(255,215,0,0.35)",
            background: "rgba(5,5,16,0.92)",
          }}
        >
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.15em", color: "#FFD700", marginBottom: 8 }}>
            BROADCAST CONTROLS
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
            Camera · Stream · Lower-third — host tools active when producer joins.
          </div>
        </div>
      );
    case "stream_status":
      return (
        <div
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid rgba(0,255,136,0.35)",
            background: "rgba(0,255,136,0.08)",
            fontSize: 10,
            fontWeight: 800,
            color: "#00FF88",
            letterSpacing: "0.12em",
          }}
        >
          ● STREAM LIVE · {roomId}
        </div>
      );
    case "show_title":
    case "live_badge":
      return (
        <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.2em", color: "#FFD700" }}>
          {widget.id === "live_badge" ? "🔴 LIVE" : "MONDAY NIGHT STAGE"}
        </div>
      );
    case "prize_panel":
      return (
        <div
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid rgba(255,45,170,0.35)",
            background: "rgba(5,5,16,0.92)",
          }}
        >
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.15em", color: "#FF2DAA", marginBottom: 8 }}>
            PRIZE PANEL
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
            No prizes claimed yet. Win a round to unlock rewards.
          </div>
        </div>
      );
    case "door_picker":
      return (
        <div
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid rgba(0,255,255,0.35)",
            background: "rgba(5,5,16,0.92)",
          }}
        >
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.15em", color: "#00FFFF", marginBottom: 8 }}>
            DEAL DOORS
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                style={{
                  flex: 1,
                  padding: "14px 0",
                  textAlign: "center",
                  borderRadius: 8,
                  border: "1px solid rgba(255,215,0,0.3)",
                  color: "#FFD700",
                  fontWeight: 900,
                  fontSize: 12,
                }}
              >
                {n}
              </div>
            ))}
          </div>
        </div>
      );
    default:
      return (
        <div
          style={{
            fontSize: 10,
            color: "rgba(255,255,255,0.45)",
            padding: "8px 10px",
            border: "1px dashed rgba(255,255,255,0.15)",
            borderRadius: 8,
          }}
        >
          {widget.displayName} — slot registered
        </div>
      );
  }
}

/**
 * Manifest-driven widget composer — renders each registry layer into its region.
 */
export default function ExperienceWidgetLayer({
  widgets,
  roomId,
  format = "BATTLE",
  accentColor = "#00FFFF",
}: ExperienceWidgetLayerProps) {
  const layers = groupWidgetsByLayer(widgets);

  return (
    <>
      {layers.panel.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            bottom: 12,
            width: 300,
            zIndex: LAYER_Z.panel,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            pointerEvents: "auto",
            overflowY: "auto",
          }}
        >
          {layers.panel.map((widget) => (
            <div key={widget.id}>{renderWidget(widget, roomId, format, accentColor)}</div>
          ))}
        </div>
      )}

      {(layers.hud.length > 0 || layers.overlay.length > 0) && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: LAYER_Z.overlay,
            pointerEvents: "none",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 12,
          }}
        >
          {layers.hud.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {layers.hud.map((widget) => (
                <div key={widget.id}>{renderWidget(widget, roomId, format, accentColor)}</div>
              ))}
            </div>
          )}
          {layers.overlay.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              {layers.overlay.map((widget) => (
                <div key={widget.id} style={{ pointerEvents: "auto" }}>
                  {renderWidget(widget, roomId, format, accentColor)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {layers.ambient.length > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: LAYER_Z.ambient,
            pointerEvents: "none",
          }}
        >
          {layers.ambient.map((widget) => (
            <div key={widget.id}>{renderWidget(widget, roomId, format, accentColor)}</div>
          ))}
        </div>
      )}
    </>
  );
}

export { competitionFormatFromCategory };
