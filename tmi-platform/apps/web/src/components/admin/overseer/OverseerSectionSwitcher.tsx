"use client";

/**
 * Surround-panel section switcher — cycles content in a rail/intelligence slot.
 * Does NOT wrap dual media monitors (media stays primary). Shell freeze: chrome only.
 */

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";

export type OverseerSectionOption = {
  id: string;
  label: string;
  accent?: string;
  render: () => ReactNode;
};

const STORAGE_PREFIX = "tmi.overseer.sectionSlot.v1:";

type Props = {
  slotId: string;
  /** Original panel content — always available as first/default section when provided. */
  defaultLabel?: string;
  defaultContent?: ReactNode;
  sections: OverseerSectionOption[];
  compact?: boolean;
};

export default function OverseerSectionSwitcher({
  slotId,
  defaultLabel = "Default",
  defaultContent,
  sections,
  compact = false,
}: Props) {
  const catalog = useMemo(() => {
    const extras = sections.filter((s) => s.id !== "default");
    if (defaultContent != null) {
      return [
        { id: "default", label: defaultLabel, accent: "#FFD700", render: () => defaultContent },
        ...extras,
      ];
    }
    return extras.length > 0 ? extras : sections;
  }, [defaultContent, defaultLabel, sections]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_PREFIX + slotId);
      if (!raw) return;
      const found = catalog.findIndex((s) => s.id === raw);
      if (found >= 0) setIndex(found);
    } catch {
      /* ignore */
    }
  }, [slotId, catalog]);

  useEffect(() => {
    const cur = catalog[index];
    if (!cur) return;
    try {
      window.localStorage.setItem(STORAGE_PREFIX + slotId, cur.id);
    } catch {
      /* ignore */
    }
  }, [catalog, index, slotId]);

  const safeIndex = catalog.length === 0 ? 0 : ((index % catalog.length) + catalog.length) % catalog.length;
  const current = catalog[safeIndex];

  function prev() {
    if (catalog.length < 2) return;
    setIndex((i) => (i - 1 + catalog.length) % catalog.length);
  }
  function next() {
    if (catalog.length < 2) return;
    setIndex((i) => (i + 1) % catalog.length);
  }

  if (!current) {
    return (
      <div style={{ padding: 12, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
        No sections available for this slot.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: compact ? 4 : 6,
          padding: compact ? "3px 6px" : "5px 8px",
          borderBottom: "1px solid rgba(255,215,0,0.22)",
          background: "rgba(0,0,0,0.45)",
        }}
      >
        <button type="button" onClick={prev} disabled={catalog.length < 2} style={btnStyle} title="Previous section">
          ◀
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: compact ? 8 : 9,
              fontWeight: 900,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: current.accent ?? "#00FFFF",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {current.label}
          </div>
          <div style={{ fontSize: 7, color: "rgba(255,255,255,0.35)" }}>
            Section {safeIndex + 1}/{catalog.length}
          </div>
        </div>
        <select
          aria-label="Section picker"
          value={current.id}
          onChange={(e) => {
            const found = catalog.findIndex((s) => s.id === e.target.value);
            if (found >= 0) setIndex(found);
          }}
          style={{
            maxWidth: compact ? 90 : 120,
            fontSize: 9,
            fontWeight: 700,
            background: "rgba(0,0,0,0.6)",
            color: "#ffe9bb",
            border: "1px solid rgba(255,215,0,0.35)",
            borderRadius: 6,
            padding: "2px 4px",
          }}
        >
          {catalog.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <button type="button" onClick={next} disabled={catalog.length < 2} style={btnStyle} title="Next section">
          ▶
        </button>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>{current.render()}</div>
    </div>
  );
}

const btnStyle: CSSProperties = {
  border: "1px solid rgba(255,215,0,0.4)",
  background: "rgba(255,215,0,0.1)",
  color: "#FFD700",
  borderRadius: 6,
  width: 26,
  height: 22,
  fontSize: 10,
  fontWeight: 900,
  cursor: "pointer",
  padding: 0,
  flexShrink: 0,
};
