"use client";

import { useEffect, useMemo, useState } from "react";
import { useWorkspace } from "@/components/shell/WorkspaceProvider";
import { getWorkspaceRegistry } from "@/components/shell/workspaceRegistry";

export function CommandPalette() {
  const { isCommandPaletteOpen, closeCommandPalette, openWorkspace, availableWorkspaceIds } = useWorkspace();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const items = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const allowed = new Set(availableWorkspaceIds);
    const all = getWorkspaceRegistry().filter((item) => allowed.has(item.id));
    if (!normalized) return all;
    return all.filter((item) => item.label.toLowerCase().includes(normalized) || item.id.toLowerCase().includes(normalized));
  }, [query, availableWorkspaceIds]);

  useEffect(() => {
    if (!isCommandPaletteOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeCommandPalette();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, Math.max(0, items.length - 1)));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((prev) => Math.max(0, prev - 1));
      } else if (event.key === "Enter") {
        event.preventDefault();
        const selected = items[activeIndex];
        if (!selected) return;
        openWorkspace(selected.id, "half");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, closeCommandPalette, isCommandPaletteOpen, items, openWorkspace]);

  useEffect(() => {
    if (!isCommandPaletteOpen) {
      setQuery("");
      setActiveIndex(0);
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onClick={(event) => {
        if (event.target === event.currentTarget) closeCommandPalette();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 120,
        background: "rgba(4, 5, 14, 0.68)",
        backdropFilter: "blur(8px)",
        display: "grid",
        placeItems: "start center",
        paddingTop: "12vh",
      }}
    >
      <div
        style={{
          width: "min(680px, 92vw)",
          border: "1px solid rgba(170, 45, 255, 0.55)",
          borderRadius: 14,
          background: "rgba(7, 9, 24, 0.9)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: 12, borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <input
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            placeholder="Open workspace..."
            aria-label="Search workspaces"
            style={{
              width: "100%",
              borderRadius: 10,
              border: "1px solid rgba(255, 255, 255, 0.2)",
              background: "rgba(255, 255, 255, 0.05)",
              color: "#f3eaff",
              padding: "10px 12px",
              fontSize: 14,
              outline: "none",
            }}
          />
        </div>

        <div style={{ maxHeight: "46vh", overflow: "auto" }}>
          {items.map((item, index) => {
            const active = index === activeIndex;
            return (
              <button
                key={item.id}
                type="button"
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => openWorkspace(item.id, "half")}
                aria-label={`Open ${item.label}`}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  border: "none",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                  background: active ? "rgba(170, 45, 255, 0.18)" : "transparent",
                  color: "#f2e8ff",
                  textAlign: "left",
                  padding: "11px 14px",
                  cursor: "pointer",
                }}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</span>
                <span style={{ marginLeft: "auto", color: "rgba(242, 232, 255, 0.6)", fontSize: 12 }}>{item.category}</span>
              </button>
            );
          })}

          {items.length === 0 && (
            <div style={{ padding: 16, color: "rgba(242, 232, 255, 0.72)", fontSize: 13 }}>No workspace matches your search.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
