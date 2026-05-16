type CypherHeatMeterProps = {
  value: number;
};

export default function CypherHeatMeter({ value }: CypherHeatMeterProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div style={{ borderRadius: 12, border: "1px solid rgba(0,255,255,0.32)", padding: 12, background: "rgba(6,15,22,0.82)", display: "grid", gap: 6 }}>
      <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#67e8f9", fontWeight: 900 }}>Cypher Heat</div>
      <div style={{ height: 10, borderRadius: 999, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
        <div style={{ width: `${clamped}%`, height: "100%", background: "linear-gradient(90deg,#06b6d4,#ff2daa)" }} />
      </div>
      <div style={{ fontSize: 18, color: "#fff", fontWeight: 900 }}>{clamped}%</div>
    </div>
  );
}
