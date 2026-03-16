"use client";

import { useState } from "react";
import { RayJourneyHost, type HostScript } from "@/components/host/RayJourneyHost";

export default function HostPage() {
  const [currentScript, setCurrentScript] = useState<HostScript | null>(null);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#070a0f",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
      }}
    >
      <h1 style={{ fontSize: 36, fontWeight: 900, color: "#fff", marginBottom: 8, textAlign: "center" }}>Grand Stage</h1>
      <p style={{ color: "rgba(255,255,255,.4)", marginBottom: 48, textAlign: "center" }}>Hosted by Ray Journey</p>
      <div style={{ maxWidth: 480, width: "100%" }}>
        <RayJourneyHost currentScript={currentScript} size="stage" isLive={false} />
      </div>
    </main>
  );
}
