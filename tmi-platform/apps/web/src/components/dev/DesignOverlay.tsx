"use client";

import { useEffect, useMemo, useState } from "react";

declare global {
  interface Window {
    __TMI_DEBUG__?: {
      glow?: boolean;
      frames?: boolean;
      shapes?: boolean;
      z?: boolean;
      grid?: boolean;
      density?: boolean;
      zones?: boolean;
      spacing?: boolean;
      forceFeature?: (id: string | null) => void;
      setSpeed?: (speed: number) => void;
      triggerBurst?: () => void;
    };
  }
}

function isEnabledByQuery(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.get("design") === "1";
}

export default function DesignOverlay() {
  const [enabled, setEnabled] = useState(false);
  const [debug, setDebug] = useState({
    grid: false,
    zones: false,
    density: false,
    frames: false,
  });

  useEffect(() => {
    const active = isEnabledByQuery();
    setEnabled(active);

    if (!active) return;

    const readDebug = () => {
      const state = window.__TMI_DEBUG__ ?? {};
      setDebug({
        grid: Boolean(state.grid),
        zones: Boolean(state.zones),
        density: Boolean(state.density),
        frames: Boolean(state.frames),
      });
    };

    readDebug();
    const id = window.setInterval(readDebug, 250);
    return () => window.clearInterval(id);
  }, []);

  const overlays = useMemo(() => {
    if (!enabled) return null;

    return (
      <div className="tmi-design-overlay" aria-hidden="true">
        {debug.grid && <div className="tmi-design-grid" />}

        {debug.zones && (
          <div className="tmi-design-zones">
            <div className="tmi-zone tmi-zone-editorial">[EDITORIAL BELT]</div>
            <div className="tmi-zone tmi-zone-discovery">[DISCOVERY BELT]</div>
            <div className="tmi-zone tmi-zone-live">[LIVE WORLD]</div>
            <div className="tmi-zone tmi-zone-marketplace">[MARKETPLACE]</div>
            <div className="tmi-zone tmi-zone-ranking">[RANKING]</div>
          </div>
        )}

        {debug.frames && (
          <div className="tmi-design-frames">
            <div className="tmi-frame-box">FRAME L1</div>
            <div className="tmi-frame-box tmi-frame-box-inner">FRAME L2</div>
          </div>
        )}

        {debug.density && (
          <div className="tmi-density-overlay">
            <div className="tmi-density-chip tmi-density-good">ACTIVE ZONE</div>
            <div className="tmi-density-chip tmi-density-low">LOW DENSITY</div>
          </div>
        )}
      </div>
    );
  }, [debug.density, debug.frames, debug.grid, debug.zones, enabled]);

  if (!enabled) return null;
  return overlays;
}
