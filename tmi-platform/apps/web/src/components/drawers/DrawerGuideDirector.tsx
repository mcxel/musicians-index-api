"use client";

/**
 * DrawerGuideDirector — translucent in-drawer coaching overlay.
 * Does not cover composer/CTA/media; dismissible; reopen via ? GUIDE.
 */

import { useEffect, useState } from "react";
import type { UniversalDrawerModuleId } from "@/lib/drawers/UniversalDrawerRegistry";
import {
  getDrawerGuide,
  recordDrawerGuideVisit,
  shouldAutoShowDrawerGuide,
} from "@/lib/drawers/DrawerGuideRegistry";

export default function DrawerGuideDirector({
  drawerId,
  open,
  userId = "anon",
  persona = "fan",
  accentColor = "#00FFFF",
}: {
  drawerId: UniversalDrawerModuleId;
  open: boolean;
  userId?: string;
  persona?: string;
  accentColor?: string;
}) {
  const guide = getDrawerGuide(drawerId);
  const [visible, setVisible] = useState(false);
  const [manual, setManual] = useState(false);

  useEffect(() => {
    if (!open || !guide) {
      setVisible(false);
      setManual(false);
      return;
    }
    if (shouldAutoShowDrawerGuide(userId, persona, drawerId)) {
      recordDrawerGuideVisit(userId, persona, drawerId);
      setVisible(true);
    }
  }, [open, drawerId, userId, persona, guide]);

  if (!guide) return null;

  const show = open && (visible || manual);

  return (
    <div data-drawer-guide-root={drawerId} style={{ position: "relative" }}>
      <button
        type="button"
        data-testid={`drawer-guide-reopen-${drawerId}`}
        onClick={() => setManual(true)}
        style={{
          position: "absolute",
          top: -2,
          right: 0,
          zIndex: 6,
          padding: "4px 8px",
          borderRadius: 6,
          border: `1px solid ${accentColor}44`,
          background: "rgba(0,0,0,0.45)",
          color: accentColor,
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: "0.1em",
          cursor: "pointer",
        }}
      >
        ? GUIDE
      </button>

      {show ? (
        <div
          data-testid={`drawer-guide-${drawerId}`}
          role="dialog"
          aria-label={`${guide.title} guide`}
          style={{
            position: "absolute",
            top: 28,
            left: 8,
            right: 8,
            zIndex: 7,
            maxWidth: 420,
            padding: "14px 14px 12px",
            borderRadius: 12,
            border: `1px solid ${accentColor}55`,
            background: "rgba(8,10,22,0.55)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 28px rgba(0,0,0,0.35)",
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.12em", color: accentColor, marginBottom: 8 }}>
            {guide.title}
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.88)", lineHeight: 1.45, marginBottom: 6 }}>
            {guide.purpose}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.62)", lineHeight: 1.45, marginBottom: 6 }}>
            {guide.value}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.78)", lineHeight: 1.45, marginBottom: 12 }}>
            First action: {guide.firstAction}
          </div>
          <button
            type="button"
            onClick={() => {
              setVisible(false);
              setManual(false);
            }}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: `1px solid ${accentColor}66`,
              background: `${accentColor}18`,
              color: accentColor,
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.1em",
              cursor: "pointer",
            }}
          >
            GOT IT
          </button>
        </div>
      ) : null}
    </div>
  );
}
