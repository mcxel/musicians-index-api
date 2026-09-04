"use client";

import { useEffect, useState } from "react";
import {
  createDefaultYoPhoBlueprint,
  getPortraitEntitlement,
  type YoPhoPortraitBlueprint,
  type SubscriptionPortraitEntitlement,
} from "@/lib/yopho/YoPhoPortraitEngine";
import {
  getYoPhoImageCapacity,
  normalizeYoPhoTier,
  trimYoPhoBlueprintToCapacity,
  YOPHO_FREE_ALLOWANCE_COPY,
} from "@/lib/yopho/YoPhoImageCapacity";
import { ensureTripleLayerStack } from "@/lib/yopho/YoPhoLayerStack";
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
 * Fan vs Performer keep separate storage + cardRole (Rule 26).
 * FREE = 1 background + 2 content images (3 image slots) — layered, background-first.
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
  const [tierKey, setTierKey] = useState("FREE");

  useEffect(() => {
    const resolved = normalizeYoPhoTier(tierProp ?? "FREE");
    setTierKey(resolved);
    setEntitlement(getPortraitEntitlement(resolved === "BAND" ? "PLATINUM" : resolved));

    const storageKey = editionsStorageKey(role);
    try {
      const raw = localStorage.getItem(storageKey);
      const parsed = raw ? (JSON.parse(raw) as YoPhoPortraitBlueprint[]) : [];
      if (parsed.length > 0 && parsed[0]) {
        setBlueprint(ensureTripleLayerStack(trimYoPhoBlueprintToCapacity(parsed[0], resolved)));
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
    const trimmed = ensureTripleLayerStack(trimYoPhoBlueprintToCapacity(saved, tierKey));
    try {
      const storageKey = editionsStorageKey(role);
      const raw = localStorage.getItem(storageKey);
      const parsed = raw ? (JSON.parse(raw) as YoPhoPortraitBlueprint[]) : [];
      const updated = parsed.length > 0 ? [...parsed] : [trimmed];
      updated[0] = trimmed;
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      /* quota */
    }
    setBlueprint(trimmed);
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

  const capacity = getYoPhoImageCapacity(tierKey);
  const accent = role === "fan" ? "#FF2DAA" : "#FFD700";
  const headline =
    role === "fan"
      ? "FAN · TRIPLE STAGE · BACKGROUND FIRST"
      : "PERFORMER · LIVING STAGE · BACKGROUND FIRST";
  const subline =
    role === "fan"
      ? `Master · preview · compare — ${capacity.tierKey}: ${YOPHO_FREE_ALLOWANCE_COPY}`
      : `Living YoPho card — ${capacity.tierKey} image slots ${capacity.maxImages}; fan canvas stays separate`;

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
        tierOrRole={tierKey}
        cardRole={role}
        userKey={userId}
      />
    </div>
  );
}
