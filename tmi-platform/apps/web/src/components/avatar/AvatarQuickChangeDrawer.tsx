"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  BOBBLEHEAD_BASES,
  BOBBLEHEAD_DEFAULT_BASE_ID,
  getBobbleheadBaseById,
  type BobbleheadBase,
} from "@/lib/avatars/BobbleheadBaseRegistry";
import {
  bobbleheadRuntimeToRigProps,
  persistBobbleheadBaseId,
  readPersistedBobbleheadBaseId,
  resolveBobbleheadRuntimeCharacter,
} from "@/lib/avatars/BobbleheadRuntimeCharacter";
import {
  FAN_SKIN_TONE_CONTINUUM,
  persistFanSkinT,
  readPersistedFanSkinT,
  sampleFanSkinTone,
} from "@/lib/avatars/FanCosmeticCatalog";

const AvatarViewer = dynamic(
  () => import("@/components/3d/AvatarLobbyCanvas").then((m) => m.AvatarViewer),
  { ssr: false }
);

export interface AvatarQuickChangeDrawerProps {
  onClose: () => void;
  onOpenFullCenter?: () => void;
}

export default function AvatarQuickChangeDrawer({
  onClose,
  onOpenFullCenter,
}: AvatarQuickChangeDrawerProps) {
  const [baseId, setBaseId] = useState(() => readPersistedBobbleheadBaseId());
  const [skinT, setSkinT] = useState(() => readPersistedFanSkinT());
  const [saveToast, setSaveToast] = useState(false);

  const selectedBase = getBobbleheadBaseById(baseId) ?? BOBBLEHEAD_BASES[0]!;
  const skin = sampleFanSkinTone(skinT);

  const handleApply = () => {
    persistBobbleheadBaseId(baseId);
    persistFanSkinT(skinT);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("bb:loadout:changed", { detail: { baseId, skinT } }));
      window.dispatchEvent(new CustomEvent("tmi:avatar:equipped", { detail: { baseId, skinT } }));
    }
    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
      onClose();
    }, 800);
  };

  return (
    <div
      data-testid="tmi-avatar-quick-change-drawer"
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        left: 0,
        zIndex: 50,
        width: 320,
        background: "rgba(5,5,16,0.98)",
        border: "1px solid rgba(0,255,255,0.45)",
        borderRadius: 14,
        padding: 12,
        boxShadow: "0 20px 50px rgba(0,0,0,0.85)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 6 }}>
        <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", color: "#00FFFF" }}>
          👤 QUICK AVATAR CUSTOMIZER
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            fontSize: 9,
            fontWeight: 800,
            background: "rgba(255,255,255,0.1)",
            border: "none",
            color: "#fff",
            borderRadius: 4,
            padding: "2px 6px",
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>

      {/* 3D Mini Viewport */}
      <div
        style={{
          height: 160,
          borderRadius: 10,
          border: "1px solid rgba(0,255,255,0.3)",
          background: "radial-gradient(ellipse at center, rgba(0,255,255,0.1) 0%, rgba(5,5,16,0.9) 75%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <AvatarViewer
          {...bobbleheadRuntimeToRigProps(resolveBobbleheadRuntimeCharacter(baseId), { skinT })}
          size={160}
          enableOrbit={true}
        />
        <div
          style={{
            position: "absolute",
            bottom: 6,
            left: 6,
            right: 6,
            background: "rgba(0,0,0,0.7)",
            padding: "3px 6px",
            borderRadius: 6,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 9, fontWeight: 800, color: "#fff" }}>
            {selectedBase.displayName}
          </span>
          <span style={{ fontSize: 8, color: "#00FF88", fontWeight: 700 }}>
            {selectedBase.previewHonestyLabel}
          </span>
        </div>
      </div>

      {/* Quick Base Switcher */}
      <div>
        <div style={{ fontSize: 8, fontWeight: 800, color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em", marginBottom: 4 }}>
          AVATAR BASE
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4 }}>
          {BOBBLEHEAD_BASES.map((base) => (
            <button
              key={base.id}
              type="button"
              onClick={() => setBaseId(base.id)}
              style={{
                fontSize: 8,
                fontWeight: 800,
                padding: "4px 2px",
                borderRadius: 6,
                border: `1px solid ${baseId === base.id ? "#00FFFF" : "rgba(255,255,255,0.1)"}`,
                background: baseId === base.id ? "rgba(0,255,255,0.2)" : "rgba(255,255,255,0.03)",
                color: baseId === base.id ? "#00FFFF" : "rgba(255,255,255,0.6)",
                cursor: "pointer",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {base.displayName.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Skin Tone */}
      <div>
        <div style={{ fontSize: 8, fontWeight: 800, color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em", marginBottom: 4 }}>
          SKIN TONE
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {FAN_SKIN_TONE_CONTINUUM.slice(0, 8).map((s) => (
            <button
              key={s.id}
              type="button"
              title={s.label}
              onClick={() => setSkinT(s.t)}
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: s.hex,
                border: Math.abs(skinT - s.t) < 0.08 ? "2px solid #00FFFF" : "1px solid rgba(255,255,255,0.2)",
                cursor: "pointer",
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
        <button
          type="button"
          onClick={handleApply}
          style={{
            flex: 1,
            fontSize: 9,
            fontWeight: 900,
            padding: "8px 10px",
            borderRadius: 8,
            background: saveToast ? "#00FF88" : "linear-gradient(135deg, #00FFFF, #AA2DFF)",
            color: "#050510",
            border: "none",
            cursor: "pointer",
          }}
        >
          {saveToast ? "✓ EQUIPPED!" : "💾 SAVE & APPLY"}
        </button>

        <Link
          href="/settings/avatar"
          onClick={onClose}
          style={{
            fontSize: 8,
            fontWeight: 800,
            padding: "8px 10px",
            borderRadius: 8,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#00FFFF",
            textAlign: "center",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          FULL CENTER →
        </Link>
      </div>
    </div>
  );
}
