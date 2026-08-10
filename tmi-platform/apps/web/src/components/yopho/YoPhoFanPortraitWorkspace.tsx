"use client";

import { useEffect, useState } from "react";
import {
  createDefaultYoPhoBlueprint,
  getPortraitEntitlement,
  type YoPhoPortraitBlueprint,
  type SubscriptionPortraitEntitlement,
} from "@/lib/yopho/YoPhoPortraitEngine";
import YoPhoTripleStageStudio from "@/components/yopho/YoPhoTripleStageStudio";

interface YoPhoFanPortraitWorkspaceProps {
  userId: string;
  displayName: string;
  tier?: string;
  compact?: boolean;
}

/**
 * Fan YoPho triple-stage studio — used in /fan/canvas and Universal Workspace yopho.
 */
export default function YoPhoFanPortraitWorkspace({
  userId,
  displayName,
  tier: tierProp,
  compact = false,
}: YoPhoFanPortraitWorkspaceProps) {
  const [blueprint, setBlueprint] = useState<YoPhoPortraitBlueprint | null>(null);
  const [entitlement, setEntitlement] = useState<SubscriptionPortraitEntitlement | null>(null);

  useEffect(() => {
    const tier = tierProp?.toUpperCase() ?? "FREE";
    setEntitlement(getPortraitEntitlement(tier));

    try {
      const raw = localStorage.getItem("tmi_yopho_editions_fan");
      const parsed = raw ? (JSON.parse(raw) as YoPhoPortraitBlueprint[]) : [];
      if (parsed.length > 0) {
        setBlueprint(parsed[0]!);
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

  if (!blueprint || !entitlement) {
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
            FAN EXCLUSIVE · TRIPLE STAGE
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
            Master · preview · compare — portrait engine controls
          </div>
        </div>
      ) : null}
      <YoPhoTripleStageStudio
        master={blueprint}
        onMasterChange={setBlueprint}
        onSaveEdition={handleSaveEdition}
        storageKey="tmi_yopho_editions_fan_active"
      />
    </div>
  );
}
