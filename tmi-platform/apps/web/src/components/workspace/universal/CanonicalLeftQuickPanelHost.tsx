"use client";

import React, { useEffect, useState } from "react";
import { useWorkspacePresentationStore } from "@/lib/workspace/universal/WorkspacePresentationRuntime";
import CyberneticQuickHudOverlay from "@/components/hud/CyberneticQuickHudOverlay";

export default function CanonicalLeftQuickPanelHost({
  userId,
  displayName,
  role,
}: {
  userId?: string;
  displayName?: string;
  role?: string;
} = {}) {
  const { leftPanelWorkspace, closeSurface } = useWorkspacePresentationStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!leftPanelWorkspace) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: isMobile ? "auto" : 100,
        bottom: isMobile ? 0 : "auto",
        left: isMobile ? 0 : 80,
        right: isMobile ? 0 : "auto",
        width: isMobile ? "100%" : 320,
        zIndex: 9350,
        paddingBottom: isMobile ? "env(safe-area-inset-bottom, 16px)" : 0,
      }}
    >
      <CyberneticQuickHudOverlay
        type={leftPanelWorkspace as any}
        isOpen={true}
        onClose={() => closeSurface("LEFT_PANEL")}
        accentColor="#00E5FF"
      />
    </div>
  );
}
