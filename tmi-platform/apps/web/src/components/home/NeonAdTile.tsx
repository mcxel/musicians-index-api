import StoreShowcaseRotator from "@/components/store/StoreShowcaseRotator";

export type AdSlotState =
  | "ACTIVE_AD"
  | "HOUSE_AD"
  | "SPONSOR_PLACEHOLDER"
  | "AVAILABLE_FOR_PURCHASE"
  | "LOCKED_PENDING_APPROVAL";

type NeonAdTileProps = {
  slot: string;
  state: AdSlotState;
  title?: string;
  showStoreRotation?: boolean;
};

const stateStyles: Record<AdSlotState, { color: string; bg: string; text: string }> = {
  ACTIVE_AD: { color: "#00ff88", bg: "rgba(0,50,31,0.75)", text: "Campaign running" },
  HOUSE_AD: { color: "#67e8f9", bg: "rgba(8,38,48,0.75)", text: "Platform promo" },
  SPONSOR_PLACEHOLDER: { color: "#facc15", bg: "rgba(52,42,11,0.75)", text: "Sponsor slot staged" },
  AVAILABLE_FOR_PURCHASE: { color: "#c4b5fd", bg: "rgba(35,17,64,0.75)", text: "Available inventory" },
  LOCKED_PENDING_APPROVAL: { color: "#fb7185", bg: "rgba(52,10,24,0.75)", text: "Pending approval" },
};

export default function NeonAdTile({ slot, state, title, showStoreRotation = false }: NeonAdTileProps) {
  const style = stateStyles[state];
  return (
    <article style={{ borderRadius: 12, border: `1px solid ${style.color}66`, background: style.bg, padding: 12, display: "grid", gap: 5 }}>
      <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.14em", color: style.color, fontWeight: 900 }}>{slot}</div>
      <div style={{ fontSize: 13, color: "#fff", fontWeight: 800 }}>{title ?? (state as string).replace(/_/g, " ")}</div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.72)" }}>{style.text}</div>
      {showStoreRotation ? (
        <div style={{ marginTop: 4, borderTop: `1px solid ${style.color}22`, paddingTop: 8 }}>
          <StoreShowcaseRotator compact maxItems={1} />
        </div>
      ) : null}
    </article>
  );
}
