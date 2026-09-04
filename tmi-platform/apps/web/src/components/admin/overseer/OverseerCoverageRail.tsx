"use client";

/**
 * OverseerCoverageRail — horizontally scrollable admin coverage switcher.
 * Clicking any item mounts its workspace in-place via focusIntelligenceWorkspace().
 * External pages open in a new tab. Nothing navigates away from the Overseer.
 */

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { focusIntelligenceWorkspace, OVERSEER_DESK_PANEL_EVENT } from "@/lib/admin/overseerDeckConvergence";
import type { DeskPanelId } from "@/lib/admin/ObservatoryDeskState";

type CoverageItem = {
  id: string;
  label: string;
  accent: string;
  panelId?: DeskPanelId;
  /** DOM id to scroll into view in the left/right rail without leaving Overseer. */
  scrollTarget?: string;
  /** Genuine external page — opens in a new tab, never replaces current page. */
  externalHref?: string;
};

const COVERAGE_ITEMS: CoverageItem[] = [
  { id: "overview",     label: "OVERVIEW",     accent: "#FFD700", panelId: "overview"          },
  { id: "analytics",    label: "ANALYTICS",    accent: "#00FFFF", panelId: "analytics"         },
  { id: "revenue",      label: "REVENUE",      accent: "#FFD700", panelId: "revenue"           },
  { id: "audience",     label: "AUDIENCE",     accent: "#FF2DAA", panelId: "audience"          },
  { id: "rooms",        label: "ROOMS",        accent: "#00FFFF", panelId: "rooms"             },
  { id: "lobby-wall",   label: "LOBBY WALL",   accent: "#00FF88", panelId: "lobby-wall"        },
  { id: "bots",         label: "BOTS",         accent: "#FF2DAA", panelId: "bots"              },
  { id: "rankings",     label: "RANKINGS",     accent: "#FFD700", panelId: "rankings"          },
  { id: "presentation", label: "PRESENTATION", accent: "#AA2DFF", panelId: "presentation"      },
  { id: "webrtc",       label: "WEBRTC",       accent: "#00FFFF", panelId: "webrtc"            },
  { id: "commerce",     label: "COMMERCE",     accent: "#FFD700", panelId: "commerce"          },
  { id: "submissions",  label: "SUBMISSIONS",  accent: "#00FF88", panelId: "submissions"       },
  { id: "alerts",       label: "ALERTS",       accent: "#FF6B8A", panelId: "alerts"            },
  { id: "legal",        label: "LEGAL",        accent: "#AA2DFF", panelId: "legal-compliance"  },
  { id: "health",       label: "HEALTH",       accent: "#00FF88", panelId: "system-health"     },
  { id: "stats",        label: "STATS",        accent: "#00FFFF", panelId: "stats"             },
  { id: "geo",          label: "GEO",          accent: "#FFD700", panelId: "geography"         },
  { id: "engagement",   label: "ENGAGEMENT",   accent: "#FF2DAA", panelId: "engagement"        },
  { id: "growth",       label: "GROWTH",       accent: "#00FF88", panelId: "growth"            },
  { id: "sponsors",     label: "SPONSORS",     accent: "#FFD700", panelId: "sponsors"          },
  // Bot-specific tools → focus bots or chain-command rail panel
  { id: "bot-cmd",      label: "BOT CMD",      accent: "#FF2DAA", panelId: "bots"              },
  { id: "chain-cmd",    label: "CHAIN CMD",    accent: "#AA2DFF", scrollTarget: "chain-command"},
  { id: "bot-squad",    label: "BOT SQUAD",    accent: "#FF2DAA", scrollTarget: "bot-roster"   },
  { id: "inbox",        label: "INBOX",        accent: "#00FFFF", scrollTarget: "unified-inbox" },
  // External pages — open new tab, never replace Overseer
  { id: "fan-page",     label: "FAN PAGE ↗",   accent: "#00FFFF", externalHref: "/hub/fan"      },
  { id: "performer",    label: "PERFORMER ↗",  accent: "#FF2DAA", externalHref: "/hub/performer"},
];

const SCROLL_STEP = 220;

export type OverseerCoverageRailProps = {
  /** Sync with ObservatoryControlDesk's active panel for the gold underline. */
  activePanelId?: DeskPanelId | null;
  onActivePanelChange?: (id: DeskPanelId) => void;
};

export default function OverseerCoverageRail({
  activePanelId,
  onActivePanelChange,
}: OverseerCoverageRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  // Track which panel the Desk just focused (via event from left-sidebar clicks too)
  const [localActive, setLocalActive] = useState<DeskPanelId | null>(activePanelId ?? null);
  const activePanel = activePanelId ?? localActive;

  useEffect(() => {
    const onFocus = (e: Event) => {
      const panelId = (e as CustomEvent<{ panelId?: string }>).detail?.panelId;
      if (panelId) setLocalActive(panelId as DeskPanelId);
    };
    window.addEventListener(OVERSEER_DESK_PANEL_EVENT, onFocus);
    return () => window.removeEventListener(OVERSEER_DESK_PANEL_EVENT, onFocus);
  }, []);

  const syncScrollEdges = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 0);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    syncScrollEdges();
    el.addEventListener("scroll", syncScrollEdges, { passive: true });
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(syncScrollEdges) : null;
    ro?.observe(el);
    return () => {
      el.removeEventListener("scroll", syncScrollEdges);
      ro?.disconnect();
    };
  }, [syncScrollEdges]);

  const scrollRail = (dir: -1 | 1) => {
    scrollRef.current?.scrollBy({ left: dir * SCROLL_STEP, behavior: "smooth" });
  };

  const handleClick = (item: CoverageItem) => {
    if (item.externalHref) {
      window.open(item.externalHref, "_blank", "noopener,noreferrer");
      return;
    }
    if (item.scrollTarget) {
      document.getElementById(item.scrollTarget)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      return;
    }
    if (item.panelId) {
      focusIntelligenceWorkspace(item.panelId);
      setLocalActive(item.panelId);
      onActivePanelChange?.(item.panelId);
    }
  };

  const chevronStyle = (disabled: boolean): CSSProperties => ({
    flexShrink: 0,
    width: 20,
    height: 20,
    borderRadius: "50%",
    border: `1px solid ${disabled ? "rgba(255,215,0,0.15)" : "rgba(255,215,0,0.5)"}`,
    background: disabled ? "transparent" : "rgba(255,215,0,0.1)",
    color: disabled ? "rgba(255,255,255,0.2)" : "#FFD700",
    fontSize: 11,
    fontWeight: 900,
    lineHeight: 1,
    cursor: disabled ? "default" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s",
    fontFamily: "inherit",
  });

  return (
    <div
      data-coverage-rail
      style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 0, flex: 1 }}
    >
      {/* Section divider */}
      <span aria-hidden style={{ width: 1, height: 16, background: "rgba(255,215,0,0.3)", flexShrink: 0 }} />
      <span
        style={{
          fontSize: 7,
          fontWeight: 900,
          letterSpacing: "0.16em",
          color: "rgba(255,215,0,0.55)",
          flexShrink: 0,
          textTransform: "uppercase",
        }}
      >
        COVERAGE
      </span>

      {/* Left chevron */}
      <button
        type="button"
        aria-label="Scroll coverage left"
        disabled={atStart}
        onClick={() => scrollRail(-1)}
        style={chevronStyle(atStart)}
      >
        ‹
      </button>

      {/* Scrollable item strip — hide native scrollbar */}
      <div
        ref={scrollRef}
        style={{
          display: "flex",
          gap: 3,
          overflowX: "auto",
          overflowY: "hidden",
          flex: 1,
          minWidth: 0,
          scrollbarWidth: "none" as const,
          msOverflowStyle: "none",
        }}
      >
        {COVERAGE_ITEMS.map((item) => {
          const isActive = item.panelId != null && item.panelId === activePanel;
          return (
            <div
              key={item.id}
              style={{ position: "relative", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}
            >
              <button
                type="button"
                onClick={() => handleClick(item)}
                title={item.externalHref ? `Open ${item.label} in new tab` : `Mount ${item.label} workspace`}
                style={{
                  padding: "3px 7px",
                  borderRadius: 5,
                  border: `1px solid ${isActive ? item.accent : `${item.accent}44`}`,
                  background: isActive ? `${item.accent}1a` : "rgba(0,0,0,0.35)",
                  color: isActive ? item.accent : "rgba(255,255,255,0.62)",
                  fontSize: 7.5,
                  fontWeight: 900,
                  letterSpacing: "0.07em",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  fontFamily: "inherit",
                  transition: "border-color 0.15s, color 0.15s, background 0.15s",
                  boxShadow: isActive ? `0 0 7px ${item.accent}44` : "none",
                  textTransform: "uppercase",
                }}
              >
                {item.label}
              </button>

              {/* Animated gold underline for active item */}
              <AnimatePresence>
                {isActive && (
                  <motion.span
                    layoutId="coverage-active-underline"
                    initial={{ opacity: 0, scaleX: 0.4 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleX: 0.4 }}
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    style={{
                      position: "absolute",
                      bottom: -1,
                      left: 6,
                      right: 6,
                      height: 2,
                      background: item.accent,
                      borderRadius: 1,
                      boxShadow: `0 0 6px ${item.accent}`,
                      originX: 0.5,
                    }}
                  />
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Right chevron */}
      <button
        type="button"
        aria-label="Scroll coverage right"
        disabled={atEnd}
        onClick={() => scrollRail(1)}
        style={chevronStyle(atEnd)}
      >
        ›
      </button>
    </div>
  );
}
