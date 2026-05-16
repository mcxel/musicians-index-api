type BeltCardProps = {
  title: string;
  badge: string;
  stats: string;
  accent: "cyan" | "pink" | "purple" | "gold";
  glow?: boolean;
};

export default function BeltCard({ title, badge, stats, accent, glow = false }: BeltCardProps) {
  const accentColor = accent === "gold" ? "#facc15" : accent === "pink" ? "#f472b6" : accent === "purple" ? "#a78bfa" : "#22d3ee";
  return (
    <article className="rounded-lg border border-white/10 bg-white/5 p-3" style={glow ? { boxShadow: `0 0 24px ${accentColor}22` } : undefined}>
      <p className="text-[10px] font-black uppercase tracking-[0.14em]" style={{ color: accentColor }}>{badge}</p>
      <p className="mt-1 text-sm font-bold text-white">{title}</p>
      <p className="text-xs text-zinc-300">{stats}</p>
    </article>
  );
}
