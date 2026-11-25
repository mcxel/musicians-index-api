"use client";

/**
 * ACC Foundry Slot Grid — addressable EMPTY 3D preview slots.
 * Occupied slots show real GLB path identity; empty slots stay honestly empty.
 * No emoji placeholders. Shoes use sectionId SHOES (never folded into OUTFITS).
 */

import type { AccCatalogPlacement, AccSectionId, SubscriptionTierId } from "@/lib/foundry/avatar/AccCatalogSlotRuntime";
import { getAccDisplaySlots } from "@/lib/foundry/avatar/AccCatalogSlotRuntime";

type Props = {
  sectionId: AccSectionId;
  tierId?: SubscriptionTierId;
  selectedAssetId?: string | null;
  onSelectPlacement?: (placement: AccCatalogPlacement) => void;
  title?: string;
};

export default function AccFoundrySlotGrid({
  sectionId,
  tierId = "FREE",
  selectedAssetId = null,
  onSelectPlacement,
  title,
}: Props) {
  const slots = getAccDisplaySlots(sectionId, tierId);
  const occupied = slots.filter((s) => s.assetId && s.publicationStatus !== "ARCHIVED").length;

  return (
    <div data-testid={`acc-slot-grid-${sectionId}`} data-acc-section={sectionId} data-tier={tierId}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 10, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.1em" }}>
          {title ?? `${sectionId} · 3D SLOTS`} ({occupied}/{slots.length})
        </span>
        <span style={{ fontSize: 8, color: "rgba(255,255,255,0.45)" }}>
          Stable PLACEMENT_ID · never overwrite
        </span>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(104px, 1fr))",
          gap: 8,
          maxHeight: 300,
          overflowY: "auto",
        }}
      >
        {slots.map((slot) => {
          const empty = slot.publicationStatus === "EMPTY" || !slot.assetId;
          const archived = slot.publicationStatus === "ARCHIVED";
          const selected = Boolean(slot.assetId && slot.assetId === selectedAssetId);
          return (
            <button
              key={slot.slotId}
              type="button"
              data-slot-id={slot.slotId}
              data-placement-id={slot.placementId}
              data-slot-status={slot.publicationStatus}
              disabled={empty || archived || !onSelectPlacement}
              onClick={() => {
                if (!empty && !archived && onSelectPlacement) onSelectPlacement(slot);
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                minHeight: 118,
                padding: 8,
                borderRadius: 10,
                textAlign: "left",
                cursor: empty || archived || !onSelectPlacement ? "default" : "pointer",
                border: selected
                  ? "1px solid #00FFFF"
                  : empty
                    ? "1px dashed rgba(255,255,255,0.18)"
                    : "1px solid rgba(0,255,255,0.28)",
                background: selected
                  ? "rgba(0,255,255,0.14)"
                  : empty
                    ? "rgba(255,255,255,0.02)"
                    : "rgba(0,0,0,0.45)",
                opacity: archived ? 0.45 : 1,
              }}
            >
              <div
                style={{
                  flex: 1,
                  minHeight: 56,
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: empty
                    ? "repeating-linear-gradient(45deg, rgba(255,255,255,0.03), rgba(255,255,255,0.03) 6px, transparent 6px, transparent 12px)"
                    : "radial-gradient(circle at 40% 30%, rgba(0,255,255,0.12), rgba(5,5,16,0.9))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 9,
                  fontWeight: 800,
                  color: empty ? "rgba(255,255,255,0.35)" : "#00FFFF",
                  letterSpacing: "0.06em",
                }}
              >
                {empty ? "EMPTY 3D SLOT" : "3D MESH"}
              </div>
              <div style={{ fontSize: 9, fontWeight: 800, color: "#fff", marginTop: 6, lineHeight: 1.25 }}>
                {empty ? `Slot ${slot.slotIndex + 1}` : slot.displayName ?? slot.assetId}
              </div>
              <div style={{ fontSize: 7, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                {slot.slotId}
              </div>
              {!empty && slot.publicGlbPath ? (
                <div
                  style={{
                    fontSize: 7,
                    color: "#FFD700",
                    marginTop: 2,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={slot.publicGlbPath}
                >
                  {slot.publicGlbPath.split("/").pop()}
                </div>
              ) : null}
              <div
                style={{
                  fontSize: 7,
                  fontWeight: 800,
                  marginTop: 4,
                  color:
                    slot.publicationStatus === "PUBLISHED_TEST"
                      ? "#00FF88"
                      : slot.publicationStatus === "STAGED"
                        ? "#FF9900"
                        : "rgba(255,255,255,0.35)",
                }}
              >
                {slot.publicationStatus}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
