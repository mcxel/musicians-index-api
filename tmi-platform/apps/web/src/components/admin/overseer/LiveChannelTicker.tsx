"use client";

/**
 * LiveChannelTicker — architectural divider between Operations Deck and
 * Intelligence Deck (Two-Deck Architecture). NOT sticky. Scroll past this
 * to reach Artist Revenue / Magazine Analytics / other intelligence panels.
 *
 * Rule 20: shows real live session labels or an honest empty state.
 * Never fabricates viewer counts.
 */

import { useEffect, useState } from "react";
import { MEDIA_SOURCE_REGISTRY } from "@/components/admin/overseer/workspace/widgets/MediaSourceRegistry";

type LiveSessionRow = {
  title?: string;
  category?: string;
};

type TickerItem = {
  id: string;
  label: string;
  tone: string;
};

const SOURCE_FALLBACK: TickerItem[] = MEDIA_SOURCE_REGISTRY.filter(
  (s) => s.status === "LIVE" || s.status === "STANDBY",
).map((s) => ({
  id: s.id,
  label: s.label,
  tone: s.accent,
}));

export default function LiveChannelTicker() {
  const [items, setItems] = useState<TickerItem[]>([]);
  const [status, setStatus] = useState<"loading" | "live" | "empty">("loading");

  useEffect(() => {
    let active = true;

    const poll = async () => {
      try {
        const res = await fetch("/api/live/go", { cache: "no-store" });
        if (!res.ok) {
          if (active) {
            setItems(SOURCE_FALLBACK);
            setStatus("empty");
          }
          return;
        }
        const data = (await res.json()) as { sessions?: LiveSessionRow[]; count?: number };
        if (!active) return;

        const sessions = data.sessions ?? [];
        if (sessions.length === 0) {
          setItems(SOURCE_FALLBACK);
          setStatus("empty");
          return;
        }

        setItems(
          sessions.slice(0, 24).map((session, index) => ({
            id: `live-${index}-${session.title ?? session.category ?? "room"}`,
            label: (session.title || session.category || "Live Room").trim(),
            tone: "#00FF88",
          })),
        );
        setStatus("live");
      } catch {
        if (active) {
          setItems(SOURCE_FALLBACK);
          setStatus("empty");
        }
      }
    };

    void poll();
    const id = setInterval(() => {
      void poll();
    }, 15000);

    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const row = items.length > 0 ? items : SOURCE_FALLBACK;

  return (
    <div
      data-deck="live-channel-ticker"
      role="region"
      aria-label="Live channel ticker — scroll past for intelligence deck"
      style={{
        flex: "0 0 auto",
        flexShrink: 0,
        width: "100%",
        minHeight: 64,
        borderTop: "3px solid #FFD700",
        borderBottom: "3px solid #FFD700",
        borderLeft: "2px solid rgba(212,175,55,0.85)",
        borderRight: "2px solid rgba(212,175,55,0.85)",
        borderRadius: 12,
        background:
          "linear-gradient(180deg, #2a1020 0%, #14080e 40%, #0a0508 100%)",
        boxShadow:
          "0 0 0 1px rgba(255,45,170,0.25), 0 8px 28px rgba(0,0,0,0.65), inset 0 0 18px rgba(255,215,0,0.12)",
        padding: "10px 14px",
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        gridTemplateRows: "auto auto",
        gap: "6px 14px",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          gridColumn: "1 / -1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          paddingBottom: 4,
          borderBottom: "1px solid rgba(255,215,0,0.28)",
        }}
      >
        <span style={{ color: "#FFD700", fontSize: 11, fontWeight: 900, letterSpacing: "0.22em" }}>
          ▲ OPERATIONS DECK
        </span>
        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 800 }}>│</span>
        <span style={{ color: "#FF2DAA", fontSize: 11, fontWeight: 900, letterSpacing: "0.22em" }}>
          ▼ SCROLL FOR INTELLIGENCE DECK
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          whiteSpace: "nowrap",
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: status === "live" ? "#00FF88" : "#FFD700",
            boxShadow: status === "live" ? "0 0 10px #00FF88" : "0 0 8px #FFD700",
          }}
        />
        <span
          style={{
            color: "#FFD700",
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          Live Channel Ticker
        </span>
      </div>

      <div
        style={{
          overflow: "hidden",
          maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            gap: 28,
            whiteSpace: "nowrap",
            animation: "tmi-live-channel-ticker 42s linear infinite",
          }}
        >
          {[...row, ...row].map((item, index) => (
            <span
              key={`${item.id}-${index}`}
              style={{
                color: item.tone,
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              ◆ {item.label}
            </span>
          ))}
        </div>
      </div>

      <div
        style={{
          color: "rgba(255,255,255,0.5)",
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        {status === "live"
          ? `${row.length} live`
          : status === "loading"
            ? "Loading…"
            : "No live rooms — matrix sources"}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes tmi-live-channel-ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `,
        }}
      />
    </div>
  );
}
