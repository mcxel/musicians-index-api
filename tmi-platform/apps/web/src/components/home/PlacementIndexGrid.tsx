import type { AdSlotState } from "@/components/home/NeonAdTile";
import NeonAdTile from "@/components/home/NeonAdTile";

type PlacementIndexGridProps = {
  slots: Array<{ slot: string; state: AdSlotState; title?: string; showStoreRotation?: boolean }>;
};

export default function PlacementIndexGrid({ slots }: PlacementIndexGridProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
      {slots.map((slot) => (
        <NeonAdTile
          key={slot.slot}
          slot={slot.slot}
          state={slot.state}
          title={slot.title}
          showStoreRotation={slot.showStoreRotation}
        />
      ))}
    </div>
  );
}
