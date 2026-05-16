type DealProgressBarsProps = {
  rows: Array<{ label: string; percent: number }>;
};

export default function DealProgressBars({ rows }: DealProgressBarsProps) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {rows.map((row) => (
        <div key={row.label} style={{ display: "grid", gap: 4 }}>
          <div style={{ fontSize: 10, color: "#f5d0fe", fontWeight: 800 }}>{row.label}</div>
          <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
            <div style={{ width: `${Math.max(0, Math.min(100, row.percent))}%`, height: "100%", background: "linear-gradient(90deg, #ff2daa, #facc15)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
