import BeltShell from "./BeltShell";
import CardFrame from "./CardFrame";

const fallbackLive = [
  { title: "Main Lobby Preview", badge: "LIVE", shape: "badge" as const, glow: "red" as const },
  { title: "Room Join Gateway", badge: "JOIN", shape: "angled" as const, glow: "magenta" as const },
  { title: "Premiere Countdown", badge: "T-09:45", shape: "ribbon" as const, glow: "gold" as const },
];

export default function LiveWorldBelt() {
  return (
    <BeltShell id="live-world" title="Live World Belt" tone="live" kicker="NOW STREAMING">
      <div className="homev2-grid homev2-grid--live">
        {fallbackLive.map((item) => (
          <CardFrame key={item.title} title={item.title} badge={item.badge} shape={item.shape} glow={item.glow}>
            <p className="homev2-copy">
              Interactive live artifact surface ready for room previews, queue signals, and world-entry actions.
            </p>
          </CardFrame>
        ))}
      </div>
    </BeltShell>
  );
}
