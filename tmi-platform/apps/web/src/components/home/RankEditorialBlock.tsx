import { ImageSlotWrapper } from '@/components/visual-enforcement';
import type { SpreadRankEntry } from "@/engines/home/SpreadRankAuthorityEngine";

type RankEditorialBlockProps = {
  entry: SpreadRankEntry;
  accentColor: string;
  category: string;
};

export default function RankEditorialBlock({ entry, accentColor, category }: RankEditorialBlockProps) {
  const battleScore = Math.round(entry.score * 0.37);
  const crownHistory = `${Math.max(1, entry.streak)}wk hold`;

  return (
    <article
      style={{
        borderRadius: 14,
        border: `1px solid ${accentColor}44`,
        background: "linear-gradient(180deg, rgba(255,255,255,0.62), rgba(238,227,205,0.92))",
        boxShadow: "inset 0 10px 16px rgba(255,255,255,0.45)",
        padding: 12,
        display: "grid",
        gap: 8,
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "64px minmax(0,1fr)", gap: 10, alignItems: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: 10, overflow: "hidden", border: `2px solid ${accentColor}66` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <ImageSlotWrapper imageId="img-qwh07f" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", color: accentColor, textTransform: "uppercase" }}>Top Artist Block</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#1f160f" }}>{entry.name}</div>
          <div style={{ fontSize: 11, color: "#4a3726", fontWeight: 700 }}>"Dominating {category} with crowd pressure."</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 8 }}>
        <Metric label="Perf" value={entry.score.toLocaleString()} />
        <Metric label="Crown" value={crownHistory} />
        <Metric label="Battle" value={battleScore.toLocaleString()} />
        <Metric label="Genre" value={category.slice(0, 6)} />
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.45)", padding: "6px 7px" }}>
      <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6e5a45" }}>{label}</div>
      <div style={{ fontSize: 11, fontWeight: 800, color: "#1f160f", marginTop: 2 }}>{value}</div>
    </div>
  );
}
