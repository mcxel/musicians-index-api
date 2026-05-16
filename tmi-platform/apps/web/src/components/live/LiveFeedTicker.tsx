"use client";

/**
 * LIVE FEED TICKER
 * Slides in recent system/pipeline events for admin and lobby surfaces.
 * Each event slides in from the right, fades out after display.
 */

import { useEffect, useRef, useState } from "react";
import { TIMING } from "@/lib/motion/timingRegistry";
import { prefersReducedMotion } from "@/lib/motion/reducedMotionGuard";

export interface TickerEvent {
  id: string;
  message: string;
  level: "info" | "warning" | "critical" | "resolved" | "success";
  at: number;
}

interface LiveFeedTickerProps {
  events: TickerEvent[];
  position?: "top-right" | "bottom-right" | "inline";
  maxVisible?: number;
}

const LEVEL_STYLE: Record<TickerEvent["level"], React.CSSProperties> = {
  info:     { borderColor: "rgba(147,197,253,0.35)", color: "#93c5fd" },
  warning:  { borderColor: "rgba(253,230,138,0.4)",  color: "#fde68a" },
  critical: { borderColor: "rgba(252,165,165,0.5)",  color: "#fca5a5" },
  resolved: { borderColor: "rgba(134,239,172,0.4)",  color: "#86efac" },
  success:  { borderColor: "rgba(52,211,153,0.4)",   color: "#34d399" },
};

export default function LiveFeedTicker({ events, position = "inline", maxVisible = 4 }: LiveFeedTickerProps) {
  const [shown, setShown] = useState<TickerEvent[]>([]);
  const seenRef = useRef(new Set<string>());
  const reduced = prefersReducedMotion();

  useEffect(() => {
    const newEvents = events.filter((e) => !seenRef.current.has(e.id));
    if (!newEvents.length) return;

    newEvents.forEach((e) => seenRef.current.add(e.id));
    setShown((prev) => [...newEvents, ...prev].slice(0, maxVisible));

    // Auto-expire after 6s
    const t = window.setTimeout(() => {
      setShown((prev) => prev.filter((e) => !newEvents.find((n) => n.id === e.id)));
    }, 6000);
    return () => window.clearTimeout(t);
  }, [events, maxVisible]);

  if (!shown.length) return null;

  const positionStyle: React.CSSProperties =
    position === "top-right"
      ? { position: "fixed", top: 64, right: 12, zIndex: 8000, pointerEvents: "none" }
      : position === "bottom-right"
      ? { position: "fixed", bottom: 48, right: 12, zIndex: 8000, pointerEvents: "none" }
      : {};

  return (
    <div
      data-testid="live-feed-ticker"
      style={{ display: "grid", gap: 4, maxWidth: 400, ...positionStyle }}
    >
      {shown.map((event, i) => (
        <div
          key={event.id}
          style={{
            background: "rgba(2,6,23,0.92)",
            border: `1px solid`,
            borderRadius: 6,
            padding: "5px 10px",
            fontSize: 11,
            display: "flex",
            gap: 8,
            alignItems: "center",
            backdropFilter: "blur(6px)",
            transition: reduced ? undefined : `opacity ${TIMING.monitorFade}ms ease, transform ${TIMING.monitorFade}ms ease`,
            transform: reduced ? undefined : "translateX(0)",
            opacity: 1,
            ...LEVEL_STYLE[event.level],
          }}
        >
          <span style={{ fontSize: 9, color: "rgba(148,163,184,0.55)", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
            {new Date(event.at).toLocaleTimeString()}
          </span>
          <span style={{ flex: 1, lineHeight: 1.4 }}>{event.message}</span>
        </div>
      ))}
    </div>
  );
}
