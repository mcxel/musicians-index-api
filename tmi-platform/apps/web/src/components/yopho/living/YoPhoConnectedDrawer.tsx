"use client";

/**
 * LEVEL 2 - Connected YoPho Drawer
 * Fully skinned with the canonical YoPho AI Cutout & Scene Compositor.
 * Supports drawer ergonomics, scrollable canvas, and living project integration.
 */

import React from "react";
import YoPhoAiSceneCompositor from "@/components/yopho/YoPhoAiSceneCompositor";

export default function YoPhoConnectedDrawer({
  ownerId = "local",
}: {
  ownerId?: string;
}) {
  return (
    <section
      data-yopho-connected-drawer="1"
      style={{
        width: "100%",
        maxHeight: "85vh",
        overflowY: "auto",
        borderRadius: 14,
        border: "1px solid rgba(0, 255, 255, 0.35)",
        boxShadow: "0 0 35px rgba(0, 255, 255, 0.2)",
      }}
    >
      <YoPhoAiSceneCompositor ownerId={ownerId} isDrawer={true} />
    </section>
  );
}
