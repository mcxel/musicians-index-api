import BeltShell from "./BeltShell";
import CardFrame from "./CardFrame";
import RollingPagePanel from "../magazine/RollingPagePanel";

const fallbackDiscovery = [
  { title: "Genre Hex Cluster", badge: "DISCOVER", shape: "hex" as const, glow: "magenta" as const },
  { title: "Playlist Picks", badge: "PICKS", shape: "angled" as const, glow: "green" as const },
];

export default function DiscoveryBelt() {
  return (
    <BeltShell id="discovery" title="Discovery Belt" tone="discovery" kicker="TREND MAP">
      <div className="homev2-grid homev2-grid--discovery">
        {fallbackDiscovery.map((item) => (
          <CardFrame key={item.title} title={item.title} badge={item.badge} shape={item.shape} glow={item.glow}>
            <p className="homev2-copy">
              Dense discovery artifact with magazine framing and linked tags for genre and chart movement.
            </p>
          </CardFrame>
        ))}
      </div>
      <RollingPagePanel />
    </BeltShell>
  );
}
