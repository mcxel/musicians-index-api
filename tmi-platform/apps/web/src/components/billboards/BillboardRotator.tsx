"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  registerBillboardSlot,
  onBillboardHoverStart,
  onBillboardHoverEnd,
  tickBillboardHover,
  type BillboardPreviewContent,
} from "@/lib/live/BillboardPreviewHoverEngine";
import BillboardPreviewHover from "./BillboardPreviewHover";

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  slots: BillboardPreviewContent[];
  rotationMs?: number;
  showDots?: boolean;
  height?: number | string;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function BillboardRotator({
  slots,
  rotationMs = 6000,
  showDots = true,
  height = 120,
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewContent, setPreviewContent] = useState<BillboardPreviewContent | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hoverTickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Register all slots once on mount
  useEffect(() => {
    for (const slot of slots) {
      registerBillboardSlot(slot);
    }
  }, [slots]);

  // Auto-rotation — pauses while a slot is hovered
  useEffect(() => {
    if (hoveredSlot) {
      if (tickRef.current) clearInterval(tickRef.current);
      return;
    }
    tickRef.current = setInterval(() => {
      setActiveIndex(i => (i + 1) % Math.max(1, slots.length));
    }, rotationMs);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [hoveredSlot, rotationMs, slots.length]);

  // Hover preview tick loop
  useEffect(() => {
    if (!hoveredSlot) {
      setPreviewVisible(false);
      setPreviewContent(null);
      return;
    }
    hoverTickRef.current = setInterval(() => {
      const state = tickBillboardHover(hoveredSlot);
      if (state?.previewVisible) {
        setPreviewVisible(true);
        setPreviewContent(state.previewContent);
      }
    }, 50);
    return () => { if (hoverTickRef.current) clearInterval(hoverTickRef.current); };
  }, [hoveredSlot]);

  const handleMouseEnter = useCallback((slotId: string) => {
    setHoveredSlot(slotId);
    onBillboardHoverStart(slotId);
  }, []);

  const handleMouseLeave = useCallback((slotId: string) => {
    setHoveredSlot(null);
    onBillboardHoverEnd(slotId);
    setPreviewVisible(false);
  }, []);

  const current = slots[activeIndex];
  if (!current) return null;

  const accent = current.accentColor ?? "#00f5ff";

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height,
        borderRadius: 10,
        overflow: "visible",
        userSelect: "none",
      }}
    >
      {/* Slot strip */}
      <div style={{ display: "flex", height: "100%", gap: 0, position: "relative" }}>
        {slots.map((slot, idx) => {
          const isActive = idx === activeIndex;
          const slotAccent = slot.accentColor ?? "#00f5ff";
          return (
            <div
              key={slot.slotId}
              onMouseEnter={() => handleMouseEnter(slot.slotId)}
              onMouseLeave={() => handleMouseLeave(slot.slotId)}
              style={{
                flex: isActive ? "3 1 0" : "1 1 0",
                transition: "flex 0.4s cubic-bezier(0.4,0,0.2,1), border-color 0.3s",
                background: isActive
                  ? `linear-gradient(135deg, ${slotAccent}1a, rgba(2,6,23,0.96))`
                  : "rgba(2,6,23,0.70)",
                border: `1px solid ${isActive ? slotAccent + "55" : "rgba(255,255,255,0.06)"}`,
                borderRadius: idx === 0 ? "10px 0 0 10px" : idx === slots.length - 1 ? "0 10px 10px 0" : "0",
                padding: "10px 14px",
                cursor: "pointer",
                overflow: "hidden",
                position: "relative",
                minWidth: 0,
              }}
              onClick={() => setActiveIndex(idx)}
            >
              {isActive ? (
                <>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: slotAccent, marginBottom: 4 }}>
                    {slot.badgeText ?? slot.type.replace("_", " ")}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {slot.title}
                  </div>
                  {slot.subtitle ? (
                    <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {slot.subtitle}
                    </div>
                  ) : null}
                  {slot.liveStats ? (
                    <div style={{ fontSize: 10, color: "#22d3ee", marginTop: 4 }}>
                      ● {slot.liveStats.viewers.toLocaleString()} · 🔥{slot.liveStats.heatLevel}%
                    </div>
                  ) : null}
                </>
              ) : (
                <div style={{ fontSize: 9, color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase", writingMode: "vertical-lr", margin: "auto" }}>
                  {slot.type.replace("_", " ")}
                </div>
              )}

              {/* Hover preview portal */}
              {hoveredSlot === slot.slotId && previewContent && (
                <BillboardPreviewHover
                  active={previewVisible}
                  roomId={previewContent.slotId}
                  performerNames={["Nova Kane", "Ari Volt"]}
                  topReactions={["🔥 hype", "👏 encore", "💸 tip", "🗳 vote"]}
                  crowdLevel={previewContent.liveStats?.heatLevel ?? 72}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation dots */}
      {showDots && slots.length > 1 ? (
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 8 }}>
          {slots.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              aria-label={`Go to slot ${idx + 1}`}
              style={{
                width: activeIndex === idx ? 20 : 6,
                height: 6,
                borderRadius: 999,
                background: activeIndex === idx ? accent : "rgba(255,255,255,0.15)",
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "width 0.25s ease, background 0.25s ease",
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
