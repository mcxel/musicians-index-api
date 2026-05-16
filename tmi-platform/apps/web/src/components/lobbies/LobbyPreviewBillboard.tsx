"use client";

type LobbyPreviewBillboardProps = {
  roomHeat: number;
  occupancyPercent: number;
  queueDepth: number;
  reactionCount: number;
  tipTotal: number;
};

export default function LobbyPreviewBillboard({
  roomHeat,
  occupancyPercent,
  queueDepth,
  reactionCount,
  tipTotal,
}: LobbyPreviewBillboardProps) {
  return (
    <section
      style={{
        borderRadius: 14,
        border: "1px solid #6e4ea1",
        background: "linear-gradient(160deg, #1a1130 0%, #0f0a1a 100%)",
        padding: 12,
      }}
    >
      <div style={{ color: "#9f7dd6", fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase" }}>
        Mini Billboard Preview
      </div>
      <div style={{ color: "#d7c9ef", fontSize: 11, marginTop: 4 }}>Live only surface. Not ranking.</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(74px, 1fr))", gap: 8, marginTop: 10 }}>
        <Metric label="Room Heat" value={roomHeat.toFixed(1)} />
        <Metric label="Occupancy" value={`${occupancyPercent}%`} />
        <Metric label="Queue" value={String(queueDepth)} />
        <Metric label="Reactions" value={String(reactionCount)} />
        <Metric label="Tips" value={`$${tipTotal}`} />
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ borderRadius: 10, border: "1px solid #5e4586", background: "#170d27", padding: 8 }}>
      <div style={{ color: "#a58dc9", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</div>
      <div style={{ color: "#f3e9ff", fontSize: 15, fontWeight: 800, marginTop: 4 }}>{value}</div>
    </div>
  );
}
