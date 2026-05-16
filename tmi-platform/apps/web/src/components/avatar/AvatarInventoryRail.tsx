"use client";

import { type AvatarInventoryItem } from "@/lib/avatar/avatarInventoryEngine";

interface AvatarInventoryRailProps {
  owned: AvatarInventoryItem[];
  equipped: AvatarInventoryItem[];
  onEquip: (itemId: string) => void;
}

export default function AvatarInventoryRail({ owned, equipped, onEquip }: AvatarInventoryRailProps) {
  const equipped_ids = new Set(equipped.map((item) => item.id ?? item.itemId));

  return (
    <div
      style={{
        borderRadius: 16,
        border: "2px solid #6a4b96",
        background: "#0f0818",
        padding: 16,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{`
        @keyframes carouselShimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
      `}</style>

      <div style={{ color: "#9f7dd6", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>
        Inventory Wall
      </div>
      <h3 style={{ margin: "0 0 12px", color: "#f3eaff", fontSize: 16, fontWeight: 700 }}>
        Cosmetics Carousel
      </h3>

      {owned.length === 0 ? (
        <div style={{ color: "#c8b5e5", fontSize: 12, padding: 12, textAlign: "center" }}>
          No items in inventory
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
            gap: 8,
            flex: 1,
          }}
        >
          {owned.map((item) => {
            const is_equipped = equipped_ids.has(item.id ?? item.itemId);
            const color_map: Record<string, string> = {
              epic: "#ff6b9d",
              rare: "#a878d4",
              common: "#6a4b96",
            };
            const rarity_color = color_map[item.rarity ?? "common"] || "#6a4b96";

            return (
              <button
                key={item.id ?? item.itemId}
                onClick={() => onEquip(item.id ?? item.itemId ?? "")}
                style={{
                  borderRadius: 10,
                  border: `2px solid ${is_equipped ? "#ffb347" : rarity_color}`,
                  background: is_equipped ? "#5a4316" : "#1a1029",
                  padding: 8,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 100,
                }}
                title={item.name}
              >
                <div style={{ fontSize: 24, marginBottom: 4 }}>
                  {item.rarity === "epic" ? "⭐" : item.rarity === "rare" ? "✨" : "●"}

                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: is_equipped ? "#ffedbc" : "#c8b5e5",
                    fontWeight: 600,
                    textAlign: "center",
                  }}
                >
                  {item.name.split(" ").pop()}
                </div>
                {is_equipped && (
                  <div style={{ fontSize: 9, color: "#ffb347", marginTop: 2, fontWeight: 700 }}>
                    EQUIPPED
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #6a4b96", color: "#9f7dd6", fontSize: 11 }}>
        Items: {owned.length} owned | {equipped.length} equipped
      </div>
    </div>
  );
}
