"use client";

import { useEffect, useMemo, useState } from "react";
import { getAvatarPocketPullLabel, getAvatarPocketPullStage } from "@/lib/avatar/AvatarPocketPullEngine";
import { resolveAvatarInventoryClass, resolveAvatarInventoryGlow } from "@/lib/avatar/AvatarInventoryRevealEngine";

type AvatarItemShowcaseProps = {
  seed: string;
};

export default function AvatarItemShowcase({ seed }: AvatarItemShowcaseProps) {
  const [tick, setTick] = useState(0);
  const stage = useMemo(() => getAvatarPocketPullStage(tick), [tick]);
  const rarity = useMemo(() => resolveAvatarInventoryClass(seed), [seed]);
  const glow = resolveAvatarInventoryGlow(rarity);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTick((current) => current + 1);
    }, 850);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div style={{ borderRadius: 10, border: `1px solid ${glow}66`, background: "rgba(10,10,18,0.88)", padding: 8, display: "grid", gap: 4, boxShadow: `0 0 14px ${glow}33` }}>
      <div style={{ fontSize: 9, color: glow, textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 900 }}>Avatar Inventory Reveal</div>
      <div style={{ fontSize: 11, color: "#fff", fontWeight: 800 }}>{getAvatarPocketPullLabel(stage)}</div>
      <div style={{ fontSize: 10, color: "#d4d4d8", fontWeight: 700 }}>Class: {rarity}</div>
    </div>
  );
}
