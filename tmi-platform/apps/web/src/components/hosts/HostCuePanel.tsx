"use client";

import { useState } from "react";
import { fireHostCue } from "@/lib/hosts/hostCueEngine";

type HostCuePanelProps = {
  hostId: string;
};

export default function HostCuePanel({ hostId }: HostCuePanelProps) {
  const [cue, setCue] = useState("Welcome to the show");

  return (
    <section data-testid={`host-cue-panel-${hostId}`} style={{ border: "1px solid rgba(56,189,248,0.4)", borderRadius: 10, padding: 10, background: "#0f172a" }}>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          data-testid={`host-cue-input-${hostId}`}
          value={cue}
          onChange={(e) => setCue(e.target.value)}
          style={{ flex: 1, background: "#020617", color: "#e2e8f0", border: "1px solid rgba(148,163,184,0.35)", borderRadius: 8, padding: "7px 8px" }}
        />
        <button
          data-testid={`host-cue-fire-${hostId}`}
          type="button"
          onClick={() => fireHostCue(hostId, cue)}
          style={{ border: "1px solid rgba(56,189,248,0.6)", borderRadius: 8, background: "rgba(14,116,144,0.2)", color: "#e0f2fe", padding: "7px 10px", cursor: "pointer" }}
        >
          Fire Cue
        </button>
      </div>
    </section>
  );
}
