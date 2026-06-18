"use client";

import { useEffect, useState } from "react";
import { AvatarPreview, type AvatarBobbleheadConfig } from "./AvatarWorkspaceCanister";

interface AvatarMiniDisplayProps {
  size?: number;
  fallback?: React.ReactNode;
  showLabel?: boolean;
}

export default function AvatarMiniDisplay({ size = 48, fallback, showLabel = false }: AvatarMiniDisplayProps) {
  const [config, setConfig] = useState<AvatarBobbleheadConfig | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    fetch("/api/avatar/config", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then((d: { config?: { bobbleheadConfig?: AvatarBobbleheadConfig; isComplete?: boolean } } | null) => {
        if (d?.config?.isComplete && d.config.bobbleheadConfig) {
          setConfig(d.config.bobbleheadConfig);
        }
      })
      .catch(() => {})
      .finally(() => setChecked(true));
  }, []);

  if (!checked) return null;

  if (!config) return <>{fallback ?? null}</>;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <AvatarPreview config={config} size={size} />
      {showLabel && <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", fontWeight: 700 }}>MY AVATAR</div>}
    </div>
  );
}
