"use client";

import { useEffect, useState } from "react";
import {
  createDefaultYoPhoBlueprint,
  type YoPhoPortraitBlueprint,
} from "@/lib/yopho/YoPhoPortraitEngine";
import { getYoPhoImageCapacity } from "@/lib/yopho/YoPhoImageCapacity";
import YoPhoTripleStageStudio from "@/components/yopho/YoPhoTripleStageStudio";

interface YoPhoFanPortraitWorkspaceProps {
  userId: string;
  displayName: string;
  tier?: string;
  compact?: boolean;
}

/**
 * Fan YoPho triple-stage studio — Media Console BOTTOM_DEEP + /fan/canvas.
 * Tier capacity gates multi-image / dimensional layers (FREE = 1).
 */
export default function YoPhoFanPortraitWorkspace({
  userId,
  displayName,
  tier: tierProp,
  compact = false,
}: YoPhoFanPortraitWorkspaceProps) {
  const [blueprint, setBlueprint] = useState<YoPhoPortraitBlueprint | null>(null);
  const [tierKey, setTierKey] = useState("FREE");

  useEffect(() => {
    const tier = tierProp?.toUpperCase() ?? "FREE";
    setTierKey(tier);
    const capacity = getYoPhoImageCapacity(tier);

    try {
      const raw = localStorage.getItem("tmi_yopho_editions_fan");
      const parsed = raw ? (JSON.parse(raw) as YoPhoPortraitBlueprint[]) : [];
      if (parsed.length > 0 && parsed[0]) {
        // Trim layers if saved edition exceeds current tier capacity (honest gate)
        let bp = parsed[0];
        const total = 1 + bp.secondaryLayers.length;
        if (total > capacity.maxImages) {
          bp = {
            ...bp,
            secondaryLayers: bp.secondaryLayers.slice(0, Math.max(0, capacity.maxImages - 1)),
            activePortraitsCount: Math.min(bp.activePortraitsCount, capacity.maxImages),
          };
        }
        setBlueprint(bp);
      } else {
        setBlueprint(createDefaultYoPhoBlueprint("fan", displayName));
      }
    } catch {
      setBlueprint(createDefaultYoPhoBlueprint("fan", displayName));
    }
  }, [userId, displayName, tierProp]);

  const handleSaveEdition = (saved: YoPhoPortraitBlueprint) => {
    try {
      const raw = localStorage.getItem("tmi_yopho_editions_fan");
      const parsed = raw ? (JSON.parse(raw) as YoPhoPortraitBlueprint[]) : [];
      const updated = parsed.length > 0 ? [...parsed] : [saved];
      updated[0] = saved;
      localStorage.setItem("tmi_yopho_editions_fan", JSON.stringify(updated));
    } catch {
      /* quota */
    }
    setBlueprint(saved);
  };

  if (!blueprint) {
    return (
      <div
        style={{
          padding: compact ? 16 : 32,
          color: "#00FFFF",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textAlign: "center",
        }}
      >
        LOADING YOPHO STUDIO…
      </div>
    );
  }

  return (
    <div style={{ padding: compact ? "8px 12px 16px" : "16px 20px 24px" }}>
      {!compact ? (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.18em", color: "#FF2DAA" }}>
            FAN · TRIPLE STAGE · Z-DEPTH LAYERS
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
            Preview · Working card · Preview 2 — filters apply before Master; capacity by tier
          </div>
        </div>
      ) : null}
      <YoPhoTripleStageStudio
        master={blueprint}
        onMasterChange={setBlueprint}
        onSaveEdition={handleSaveEdition}
        storageKey="tmi_yopho_editions_fan_active"
        tierOrRole={tierKey}
      />
    </div>
  );
}
