"use client";

import { type AvatarInventoryItem } from "@/lib/avatar/avatarInventoryEngine";

interface AvatarEquipmentRailProps {
  equipped: AvatarInventoryItem[];
  onUnequip: (itemId: string) => void;
}

export default function AvatarEquipmentRail({ equipped, onUnequip }: AvatarEquipmentRailProps) {
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
      <div style={{ color: "#9f7dd6", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>
        Equipment Grid
      </div>
      <h3 style={{ margin: "0 0 12px", color: "#f3eaff", fontSize: 16, fontWeight: 700 }}>
        Active Loadout
      </h3>

      {equipped.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#c8b5e5",
            fontSize: 12,
            minHeight: 200,
          }}
        >
          No items equipped
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
            gap: 10,
            flex: 1,
          }}
        >
          {equipped.map((item) => (
            <div
              key={item.id}
              style={{
                borderRadius: 12,
                border: "2px solid #ffb347",
                background: "#5a4316",
                padding: 10,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                minHeight: 120,
              }}
            >
              <div>
                <div style={{ fontSize: 28, marginBottom: 4 }}>
                  {item.rarity === "epic" ? "⭐" : "✨"}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#ffedbc",
                    fontWeight: 700,
                    textAlign: "center",
                  }}
                >
                  {item.name}
                </div>
              </div>
              <button
                onClick={() => onUnequip(item.id ?? item.itemId ?? "")}
                style={{
                  borderRadius: 6,
                  border: "1px solid #ffb347",
                  background: "transparent",
                  color: "#ffb347",
                  padding: "4px 8px",
                  fontSize: 9,
                  cursor: "pointer",
                  fontWeight: 600,
                  width: "100%",
                  marginTop: 6,
                }}
              >
                Unequip
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #6a4b96", color: "#9f7dd6", fontSize: 11 }}>
        Total Equipped: {equipped.length}
      </div>
    </div>
  );
}
