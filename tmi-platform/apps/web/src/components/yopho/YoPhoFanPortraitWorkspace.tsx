"use client";

import { useEffect, useState } from "react";
import {
  createDefaultYoPhoBlueprint,
  type YoPhoPortraitBlueprint,
} from "@/lib/yopho/YoPhoPortraitEngine";
import { normalizeYoPhoTier, trimYoPhoBlueprintToCapacity } from "@/lib/yopho/YoPhoImageCapacity";
import YoPhoTripleStageStudio from "@/components/yopho/YoPhoTripleStageStudio";
import { useAuth } from "@/lib/hooks/useAuth";

interface YoPhoFanPortraitWorkspaceProps {
  userId: string;
  displayName: string;
  tier?: string;
  compact?: boolean;
}

/**
 * Fan YoPho triple-stage studio — Media Console BOTTOM_DEEP + /fan/canvas.
 * Tier capacity gates multi-image / dimensional layers (FREE = 3 pictures).
 */
export default function YoPhoFanPortraitWorkspace({
  userId,
  displayName,
  tier: tierProp,
  compact = false,
}: YoPhoFanPortraitWorkspaceProps) {
  const [blueprint, setBlueprint] = useState<YoPhoPortraitBlueprint | null>(null);
  const [tierKey, setTierKey] = useState("FREE");
  const { tier: sessionTier } = useAuth();

  useEffect(() => {
    const resolved = normalizeYoPhoTier(tierProp ?? sessionTier ?? "FREE");
    setTierKey(resolved);

    try {
      const raw = localStorage.getItem("tmi_yopho_editions_fan");
      const parsed = raw ? (JSON.parse(raw) as YoPhoPortraitBlueprint[]) : [];
      if (parsed.length > 0 && parsed[0]) {
        setBlueprint(trimYoPhoBlueprintToCapacity(parsed[0], resolved));
      } else {
        setBlueprint(createDefaultYoPhoBlueprint("fan", displayName));
      }
    } catch {
      setBlueprint(createDefaultYoPhoBlueprint("fan", displayName));
    }
  }, [userId, displayName, tierProp, sessionTier]);

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
        cardRole="fan"
        userKey={userId}
      />
    </div>
  );
}
