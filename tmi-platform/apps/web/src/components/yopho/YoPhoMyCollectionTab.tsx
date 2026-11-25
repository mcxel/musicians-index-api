"use client";

import { getYoPhoSlotSnapshot, listMyYophos, type YoPhoCollectionItem } from "@/lib/yopho/YoPhoCollectionAuthority";

const GOLD = "#FFD700";
const CYAN = "#00FFFF";

export default function YoPhoMyCollectionTab({
  ownerKey,
  tierOrRole,
  onOpen,
}: {
  ownerKey: string;
  tierOrRole?: string | null;
  onOpen?: (item: YoPhoCollectionItem) => void;
}) {
  const items = listMyYophos(ownerKey);
  const slots = getYoPhoSlotSnapshot(ownerKey, tierOrRole);

  return (
    <div data-testid="yopho-my-collection" style={{ display: "flex", flexDirection: "column", gap: 12, fontFamily: "inherit" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.08em", color: GOLD }}>MY YOPHOS</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
            Collection only — create workspace stays on the Create tab.
          </div>
        </div>
        <div data-testid="yopho-slot-count" style={{ fontSize: 10, fontWeight: 800, color: slots.full ? "#FF2DAA" : CYAN }}>
          {slots.activeCount}/{slots.maxActive} active
        </div>
      </div>

      {slots.full ? (
        <a
          href={slots.upgradeHref}
          data-testid="yopho-slot-upgrade"
          style={{ fontSize: 11, color: GOLD, fontWeight: 800 }}
        >
          Slot full — upgrade to activate another YoPho. Retired editions stay retired.
        </a>
      ) : null}

      {items.length === 0 ? (
        <div
          data-testid="yopho-collection-empty"
          style={{ padding: 20, borderRadius: 10, border: "1px dashed rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.5)", fontSize: 12 }}
        >
          No saved YoPhos yet. Create one, then it appears here.
        </div>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                data-testid={`yopho-collection-item-${item.id}`}
                onClick={() => onOpen?.(item)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.04)",
                  color: "#fff",
                  cursor: onOpen ? "pointer" : "default",
                  fontFamily: "inherit",
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 800 }}>{item.title}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
                  {item.status}
                  {item.retired ? " · retired" : ""}
                  {item.editionNumber ? ` · ed. ${item.editionNumber}` : ""}
                  {" · "}
                  {item.kind}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
