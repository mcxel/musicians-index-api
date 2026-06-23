"use client";

/**
 * InventoryCanister — Rule 15 canonical canister.
 * Wraps the existing InventoryPanel component.
 * Shows props, emotes, and equipped loadout.
 * Follows user into every surface.
 */

import { InventoryPanel } from "@/components/InventoryPanel";

interface InventoryCanisterProps {
  accentColor?: string;
  onEquip?: () => void;
}

export function InventoryCanister({ accentColor = "#FF6B35", onEquip }: InventoryCanisterProps) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.015)",
      border: `1px solid ${accentColor}22`,
      borderRadius: 14,
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "12px 18px",
        borderBottom: `1px solid ${accentColor}18`,
      }}>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: accentColor, fontWeight: 800 }}>
          📦 INVENTORY
        </div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>
          Props, emotes, and wearables — follow you into every room.
        </div>
      </div>

      {/* InventoryPanel is the existing source implementation */}
      <div style={{ padding: "14px 18px" }}>
        <InventoryPanel onEquip={onEquip} />
      </div>
    </div>
  );
}

export default InventoryCanister;
