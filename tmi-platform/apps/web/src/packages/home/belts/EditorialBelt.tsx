import BeltShell from "./BeltShell";
import CardFrame from "./CardFrame";

const fallbackEditorial = [
  { title: "Neon Cover Story", badge: "FEATURE", shape: "angled" as const, glow: "cyan" as const },
  { title: "Interview Wire", badge: "Q&A", shape: "ribbon" as const, glow: "magenta" as const },
  { title: "Issue Strip", badge: "VOL 88", shape: "angled" as const, glow: "green" as const },
];

export default function EditorialBelt() {
  return (
    <BeltShell id="editorial" title="Editorial Belt" tone="editorial" kicker="HEADLINES">
      <div className="homev2-grid homev2-grid--editorial">
        {fallbackEditorial.map((item) => (
          <CardFrame key={item.title} title={item.title} badge={item.badge} shape={item.shape} glow={item.glow}>
            <p className="homev2-copy">
              Broadcast-grade editorial artifact with layered frame and high-contrast strip labels.
            </p>
          </CardFrame>
        ))}
      </div>
    </BeltShell>
  );
}
