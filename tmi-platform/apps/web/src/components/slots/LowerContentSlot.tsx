"use client";

import { ReactNode } from "react";

export interface LowerContentSlotProps {
  isCanisterActive: boolean;
  canisterContent: ReactNode;
  defaultContent: ReactNode;
}

/**
 * LowerContentSlot — Controlled Content Swap Wrapper.
 * Mounted underneath the main video panel.
 * When a Group Avatar Video-Chat Canister is opened, it hides the default
 * content (while keeping it mounted to preserve scroll/selection state)
 * and displays the canister. When closed, it restores the default content.
 */
export default function LowerContentSlot({
  isCanisterActive,
  canisterContent,
  defaultContent,
}: LowerContentSlotProps) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: 280,
        background: "#050510",
        borderTop: "1px solid rgba(255,45,170,0.2)",
        overflow: "hidden",
      }}
    >
      {/* Default Content — hidden (display: none) when canister is active so state persists */}
      <div style={{ display: isCanisterActive ? "none" : "block", width: "100%", height: "100%" }}>
        {defaultContent}
      </div>

      {/* Group Video-Chat Canister Content */}
      {isCanisterActive && (
        <div style={{ width: "100%", height: "100%" }}>
          {canisterContent}
        </div>
      )}
    </div>
  );
}
