"use client";

/**
 * AvatarCreationCenter — Rule 15 canonical canister.
 * Wraps the existing AvatarCreator + Fan-only bobblehead base picker.
 * Rule 26: ownership UI is Fan-only via RoleGate.
 */

import RoleGate from "@/components/auth/RoleGate";
import { AvatarCreator } from "@/components/AvatarCreator";
import BobbleheadBasePicker from "@/components/avatar/BobbleheadBasePicker";
import {
  BOBBLEHEAD_DEFAULT_BASE_ID,
  getBobbleheadBaseById,
  type BobbleheadBase,
} from "@/lib/avatars/BobbleheadBaseRegistry";
import { useCallback, useState } from "react";

interface AvatarCreationCenterProps {
  accentColor?: string;
}

export function AvatarCreationCenter({ accentColor = "#AA2DFF" }: AvatarCreationCenterProps) {
  const [baseId, setBaseId] = useState(BOBBLEHEAD_DEFAULT_BASE_ID);
  const selected = getBobbleheadBaseById(baseId);

  const onSelect = useCallback((base: BobbleheadBase) => {
    setBaseId(base.id);
    try {
      sessionStorage.setItem("tmi_bobblehead_base_id", base.id);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <RoleGate
      allow={["FAN", "USER", "ADMIN", "STAFF"]}
      fallback={
        <div
          style={{
            padding: 18,
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${accentColor}22`,
            borderRadius: 14,
            fontSize: 11,
            color: "rgba(255,255,255,0.45)",
          }}
        >
          Avatar ownership is Fan-only. Performers use real photo / live camera identity.
        </div>
      }
    >
      <div
        style={{
          background: "rgba(255,255,255,0.015)",
          border: `1px solid ${accentColor}22`,
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "12px 18px",
            borderBottom: `1px solid ${accentColor}18`,
          }}
        >
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: accentColor, fontWeight: 800 }}>
            👤 AVATAR CREATION CENTER
          </div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>
            Pick a bobblehead base, then customize — 3D face-scan runtime is still pending.
          </div>
        </div>

        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${accentColor}12` }}>
          <BobbleheadBasePicker
            selectedBaseId={baseId}
            onSelect={onSelect}
            accentColor={accentColor}
          />
          {selected && (
            <div style={{ marginTop: 10, fontSize: 9, color: "rgba(255,255,255,0.4)" }}>
              Selected: <span style={{ color: "#fff", fontWeight: 700 }}>{selected.displayName}</span>
              {" · "}
              {selected.previewHonestyLabel}
            </div>
          )}
        </div>

        <div style={{ padding: "14px 18px" }}>
          <AvatarCreator />
        </div>
      </div>
    </RoleGate>
  );
}

export default AvatarCreationCenter;
