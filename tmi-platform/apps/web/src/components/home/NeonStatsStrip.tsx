type Stat = { label: string; value: string };

type NeonStatsStripProps = {
  stats: Stat[];
};

export default function NeonStatsStrip({ stats }: NeonStatsStripProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${stats.length}, minmax(0,1fr))`, gap: 8 }}>
      {stats.map((stat) => (
        <div key={stat.label} style={{ borderRadius: 11, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(15,10,24,0.82)", padding: 10 }}>
          <div style={{ fontSize: 9, color: "#c4b5fd", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 900 }}>{stat.label}</div>
          <div style={{ marginTop: 4, color: "#fff", fontSize: 18, fontWeight: 900 }}>{stat.value}</div>
        </div>
      ))}
    </div>
  );
}
