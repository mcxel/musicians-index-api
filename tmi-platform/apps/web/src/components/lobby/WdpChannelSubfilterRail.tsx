"use client";

/**
 * WDP channel subfilters — ALL WDP | MINI | WORLD | AUTOMATED.
 * Same mosaic inventory; subtype is a filter, not a second dance-party database.
 */

import {
  WDP_SUBFILTER_TABS,
  type WdpDiscoverySubtype,
} from "@/lib/lobby/liveLobbyWallLaw";

export type WdpChannelSubfilterRailProps = {
  activeSubtype: WdpDiscoverySubtype;
  onSelect: (subtype: WdpDiscoverySubtype) => void;
  /** Compact Lobby Wall / drawer density. */
  compact?: boolean;
};

export default function WdpChannelSubfilterRail({
  activeSubtype,
  onSelect,
  compact = false,
}: WdpChannelSubfilterRailProps) {
  return (
    <nav
      aria-label="WDP dance party filters"
      data-testid="wdp-subfilter-rail"
      data-wdp-channel="1"
      style={{
        display: "flex",
        gap: compact ? 6 : 8,
        overflowX: "auto",
        overscrollBehaviorX: "contain",
        scrollbarWidth: "thin",
        padding: compact ? "0 0 8px" : "2px 0 10px",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {WDP_SUBFILTER_TABS.map((tab) => {
        const selected = activeSubtype === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            aria-pressed={selected}
            data-wdp-subfilter={tab.id}
            onClick={() => onSelect(tab.id)}
            style={{
              flex: "0 0 auto",
              minHeight: compact ? 32 : 36,
              border: `1px solid ${selected ? "#00FF88" : "rgba(0,255,136,0.28)"}`,
              borderRadius: 4,
              padding: compact ? "0 10px" : "0 12px",
              background: selected ? "rgba(0,255,136,0.14)" : "rgba(5,5,16,0.55)",
              color: selected ? "#00FF88" : "rgba(255,255,255,0.68)",
              fontSize: compact ? 9 : 10,
              fontWeight: 900,
              letterSpacing: "0.08em",
              whiteSpace: "nowrap",
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
