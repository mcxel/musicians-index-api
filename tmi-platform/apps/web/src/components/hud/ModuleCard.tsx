"use client";
import React from "react";
import type { HudModule } from "@tmi/hud-core";

export default function ModuleCard({
  mod,
  onSelect,
  selected,
}: {
  mod: HudModule;
  onSelect: (id: string) => void;
  selected?: boolean;
}) {
  return (
    <button
      onClick={() => onSelect(mod.id)}
      style={{
        display: "block",
        textAlign: "left",
        padding: 12,
        borderRadius: 8,
        border: selected ? "2px solid #00b0ff" : "1px solid rgba(255,255,255,0.06)",
        background: selected ? "rgba(0,176,255,0.06)" : "transparent",
        color: "inherit",
        cursor: "pointer",
      }}
    >
      <div style={{ fontWeight: 700 }}>{mod.title ?? mod.id}</div>
      {mod.description ? (
        <div style={{ opacity: 0.8, marginTop: 6 }}>{mod.description}</div>
      ) : null}
    </button>
  );
}
