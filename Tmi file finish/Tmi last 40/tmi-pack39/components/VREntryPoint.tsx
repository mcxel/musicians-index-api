// apps/web/src/components/vr/VREntryPoint.tsx
// "Enter VR" button visible on any VR-capable scene.
// Handles device detection, entry flow, and fallback.

"use client";
import { useState, useEffect } from "react";

type XRSupport = "full_vr" | "desktop_3d" | "mobile_gyro" | "not_supported";

export function VREntryPoint({
  sceneId,
  onEnter,
}: {
  sceneId: string;
  onEnter: (mode: string) => void;
}) {
  const [support, setSupport] = useState<XRSupport>("not_supported");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function checkXR() {
      if (typeof navigator === "undefined") return;
      const ua = navigator.userAgent;
      const isMobile = /Android|iPhone/i.test(ua);

      if ("xr" in navigator) {
        const xr = (navigator as any).xr;
        const vr = await xr.isSessionSupported("immersive-vr").catch(() => false);
        setSupport(vr ? "full_vr" : "desktop_3d");
      } else if (isMobile && "DeviceOrientationEvent" in window) {
        setSupport("mobile_gyro");
      }
    }
    checkXR();
  }, []);

  const T = { void:"#0D0520", gold:"#FFB800", cyan:"#00E5FF", pink:"#FF2D78", text:"#fff", text3:"#7A5F9A", display:"'Bebas Neue',Impact,sans-serif", heading:"'Oswald',sans-serif" };

  const buttonConfig = {
    full_vr:      { label: "ENTER VR", icon: "🥽", color: T.gold, desc: "Full immersive VR" },
    desktop_3d:   { label: "EXPLORE 3D", icon: "🖥️", color: T.cyan, desc: "3D mouse-look mode" },
    mobile_gyro:  { label: "GYROSCOPE MODE", icon: "📱", color: T.pink, desc: "Move your phone to look around" },
    not_supported:{ label: "3D NOT AVAILABLE", icon: "⚠️", color: T.text3, desc: "Browser doesn't support WebXR" },
  };

  const cfg = buttonConfig[support];

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
      <button
        onClick={() => { setIsLoading(true); onEnter(support); }}
        disabled={support === "not_supported" || isLoading}
        style={{
          padding:"12px 24px", background:support !== "not_supported" ? cfg.color : T.text3,
          color: support !== "not_supported" ? T.void : T.text3,
          border:"none", borderRadius:8, fontFamily:T.heading, fontSize:14, fontWeight:700,
          cursor: support !== "not_supported" ? "pointer" : "not-allowed",
          letterSpacing:1, display:"flex", alignItems:"center", gap:8,
          boxShadow: support !== "not_supported" ? `0 0 20px ${cfg.color}66` : "none",
        }}
      >
        <span style={{ fontSize:20 }}>{cfg.icon}</span>
        {isLoading ? "LOADING SCENE..." : cfg.label}
      </button>
      <div style={{ fontFamily:T.heading, fontSize:10, color:T.text3, letterSpacing:1 }}>
        {cfg.desc}
      </div>
      {support === "full_vr" && (
        <div style={{ fontFamily:T.heading, fontSize:9, color:T.text3, textAlign:"center" }}>
          Compatible: Meta Quest • PSVR2 • Apple Vision Pro • SteamVR
        </div>
      )}
    </div>
  );
}
