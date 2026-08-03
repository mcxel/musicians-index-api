"use client";

/**
 * Thin Creator Asset Vault drawer panel — reference registry only.
 * Syncs from PerformerRegistry / Media Locker refs. No duplicate upload pipeline.
 */

import { useMemo } from "react";
import Link from "next/link";
import { listCreatorAssets } from "@/lib/commerce/CreatorAssetVault";
import { useActivePerformer } from "@/lib/context/ActivePerformerContext";
import { getPerformerById } from "@/lib/performers/PerformerRegistry";

export interface CreatorAssetVaultPanelProps {
  fallbackPerformerId: string;
  accentColor?: string;
}

export default function CreatorAssetVaultPanel({
  fallbackPerformerId,
  accentColor = "#FF2DAA",
}: CreatorAssetVaultPanelProps) {
  const { resolvePerformerId, activePerformer } = useActivePerformer();
  const ownerId = resolvePerformerId(fallbackPerformerId) ?? fallbackPerformerId;
  const assets = useMemo(() => listCreatorAssets(ownerId), [ownerId]);
  const name =
    activePerformer?.name ?? getPerformerById(ownerId)?.name ?? ownerId;

  return (
    <div
      key={`vault-${ownerId}`}
      style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 12 }}
    >
      <div>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", color: accentColor }}>
          CREATOR ASSET VAULT
        </div>
        <p style={{ margin: "4px 0 0", fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>
          Reference index for {name}. Upload lives in Media Locker — this vault does not duplicate the pipeline.
        </p>
      </div>

      {assets.length === 0 ? (
        <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
          No asset references yet. Profile media from PerformerRegistry will appear here when present.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {assets.map((a) => (
            <div
              key={a.assetId}
              style={{
                padding: 10,
                borderRadius: 8,
                border: "1px solid rgba(255,45,170,0.25)",
                background: "rgba(255,45,170,0.06)",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 800, color: accentColor }}>{a.label}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                {a.type} · {a.source}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.55)",
                  marginTop: 4,
                  wordBreak: "break-all",
                }}
              >
                {a.urlOrRef}
              </div>
            </div>
          ))}
        </div>
      )}

      <Link
        href="/performer/media"
        style={{
          display: "inline-block",
          padding: "10px 14px",
          borderRadius: 10,
          border: `1px solid ${accentColor}66`,
          color: accentColor,
          fontWeight: 800,
          fontSize: 12,
          textDecoration: "none",
          width: "fit-content",
        }}
      >
        Open Media Locker →
      </Link>
    </div>
  );
}
