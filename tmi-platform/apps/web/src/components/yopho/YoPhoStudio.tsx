"use client";

import { useEffect, useState } from "react";
import {
  createDefaultYoPhoBlueprint,
  getPortraitEntitlement,
  type YoPhoPortraitBlueprint,
  type SubscriptionPortraitEntitlement,
} from "@/lib/yopho/YoPhoPortraitEngine";
import YoPhoTripleStageStudio from "@/components/yopho/YoPhoTripleStageStudio";

export type YoPhoStudioRole = "fan" | "performer";

export interface YoPhoStudioProps {
  role: YoPhoStudioRole;
  userId: string;
  displayName: string;
  tier?: string;
  profileImageUrl?: string | null;
}

function editionsStorageKey(role: YoPhoStudioRole): string {
  return role === "fan" ? "tmi_yopho_editions_fan" : "tmi_yopho_editions_performer";
}

function activeStorageKey(role: YoPhoStudioRole): string {
  return role === "fan" ? "tmi_yopho_editions_fan_active" : "tmi_yopho_editions_performer_active";
}

/**
 * Canonical full-page YoPho triple-stage runtime — shared editor, role-specific assets.
 */
export default function YoPhoStudio({
  role,
  userId,
  displayName,
  tier: tierProp,
  profileImageUrl,
}: YoPhoStudioProps) {
  const [blueprint, setBlueprint] = useState<YoPhoPortraitBlueprint | null>(null);
  const [entitlement, setEntitlement] = useState<SubscriptionPortraitEntitlement | null>(null);

  useEffect(() => {
    const tier = tierProp?.toUpperCase() ?? "FREE";
    setEntitlement(getPortraitEntitlement(tier));

    const storageKey = editionsStorageKey(role);
    try {
      const raw = localStorage.getItem(storageKey);
      const parsed = raw ? (JSON.parse(raw) as YoPhoPortraitBlueprint[]) : [];
      if (parsed.length > 0) {
        setBlueprint(parsed[0]!);
      } else {
        setBlueprint(
          createDefaultYoPhoBlueprint(role, displayName, profileImageUrl ?? undefined),
        );
      }
    } catch {
      setBlueprint(createDefaultYoPhoBlueprint(role, displayName, profileImageUrl ?? undefined));
    }
  }, [userId, displayName, tierProp, role, profileImageUrl]);

  const handleSaveEdition = (saved: YoPhoPortraitBlueprint) => {
    try {
      const storageKey = editionsStorageKey(role);
      const raw = localStorage.getItem(storageKey);
      const parsed = raw ? (JSON.parse(raw) as YoPhoPortraitBlueprint[]) : [];
      const updated = parsed.length > 0 ? [...parsed] : [saved];
      updated[0] = saved;
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      /* quota */
    }
    setBlueprint(saved);
  };

  if (!blueprint || !entitlement) {
    return (
      <div
        style={{
          padding: 32,
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

  const accent = role === "fan" ? "#FF2DAA" : "#FFD700";
  const headline =
    role === "fan" ? "FAN EXCLUSIVE · TRIPLE STAGE" : "PERFORMER LIVING STAGE · TRIPLE STAGE";
  const subline =
    role === "fan"
      ? "Master · preview · compare — portrait engine controls"
      : "Living YoPho card — master, preview, and compare before you publish";

  return (
    <div style={{ padding: "16px 20px 32px" }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.18em", color: accent }}>
          {headline}
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>{subline}</div>
      </div>
      <YoPhoTripleStageStudio
        master={blueprint}
        onMasterChange={setBlueprint}
        onSaveEdition={handleSaveEdition}
        storageKey={activeStorageKey(role)}
      />
    </div>
  );
}
