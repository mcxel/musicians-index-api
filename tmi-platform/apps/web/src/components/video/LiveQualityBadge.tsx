import { videoQualityEngine } from "@/lib/video-quality";
import type { RoomVideoContext } from "@/lib/video-quality";

interface LiveQualityBadgeProps {
  streamId: string;
  context: RoomVideoContext;
  compact?: boolean;
}

export default function LiveQualityBadge({ streamId, context, compact = false }: LiveQualityBadgeProps) {
  const snapshot = videoQualityEngine.ensureDemoStream(streamId, context);

  const tone =
    snapshot.badge === "4K LIVE"
      ? "#FFD700"
      : snapshot.badge === "1440P LIVE"
      ? "#00FFFF"
      : snapshot.badge === "1080P LIVE"
      ? "#00FF88"
      : "#8aa0b6";

  return (
    <div
      title={`Score ${snapshot.qualityScore}/100 · ${snapshot.deliveredResolution} · ${snapshot.bitrateMbps} Mbps · ${snapshot.fps} fps · ${snapshot.latencyMs} ms · ${snapshot.packetLossPct}% packet loss`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: compact ? "3px 7px" : "4px 9px",
        borderRadius: 999,
        border: `1px solid ${tone}55`,
        background: `${tone}16`,
        color: tone,
        fontSize: compact ? 8 : 9,
        fontWeight: 800,
        letterSpacing: "0.14em",
        lineHeight: 1,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      <span>●</span>
      <span>{snapshot.badge}</span>
      {!compact && <span style={{ opacity: 0.85 }}>Q{snapshot.qualityScore}</span>}
    </div>
  );
}
