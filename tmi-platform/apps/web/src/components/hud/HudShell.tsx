"use client";
import React, { useMemo } from "react";
import { getHudRegistry } from "@tmi/hud-runtime";
import ModuleCard from "./ModuleCard";
import DraggableGrid from "./DraggableGrid";
import type { HudModule } from "@tmi/hud-core";

export default function HudShell() {
  const registry = useMemo(() => getHudRegistry(), []);
  const modules: HudModule[] = useMemo(() => registry.list(), [registry]);

  return (
    <div style={{ display: "flex", gap: 16, padding: 12 }}>
      <aside style={{ width: 260, borderRight: "1px solid rgba(255,255,255,0.04)", paddingRight: 12 }}>
        <h3 style={{ margin: "6px 0 12px 0" }}>Modules</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {modules.map((m) => (
            <ModuleCard key={m.id} mod={m} onSelect={() => {}} />
          ))}
        </div>
      </aside>

      <main style={{ flex: 1, minHeight: 240 }}>
        <DraggableGrid modules={modules} />
      </main>
    </div>
  );
}
