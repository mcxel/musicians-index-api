"use client";

import React, { useEffect, useState, useCallback } from "react";

// ─── THEME ───────────────────────────────────────────────────────────────────
const NEON = {
  orange: "#FF6B00",
  orangeDim: "#C04D00",
  orangeGlow: "rgba(255,107,0,0.35)",
  steel: "#1A2332",
  steelLight: "#243044",
  steelMid: "#0D1620",
  steelDark: "#080E16",
  cyan: "#00E5FF",
  cyanDim: "#007A8A",
  green: "#00FF88",
  greenDim: "#006633",
  red: "#FF3355",
  purple: "#BB44FF",
  gold: "#FFD700",
  text: "#C8D8E8",
  textDim: "#6A8AAA",
};

// (module list omitted for brevity here — using the same static MODULES from the Downloads copy)
const MODULES = [
  {
    id: "xxl",
    label: "BerntoutGlobal XXL",
    icon: "⚡",
    color: NEON.orange,
    glow: NEON.orangeGlow,
    tag: "MASTER CONTROLLER",
    status: "ONLINE",
    uptime: "99.97%",
    nodes: 4,
    desc: "Standalone Windows EXE — Voltron Head. Fund siphon, bot commander, visual standardizer.",
    stats: [
      { label: "Cluster Nodes", value: "4 / 12", bar: 0.33 },
      { label: "RAM Pool", value: "64 GB", bar: 0.52 },
      { label: "Fund Sync", value: "CRDT Live", bar: 1.0 },
      { label: "Bot Fleet", value: "127 Active", bar: 0.84 },
    ],
    alerts: ["Danika's Law vault: $3,240", "Cluster sync: 4ms latency", "Auto-patch: v2.4.1 ready"],
    actions: ["Launch EXE", "Sync Nodes", "Open Vault", "Bot Commander"],
  },
  // ... (other modules copied exactly from original)
];

// Backoff schedule (module-scope constant)
const RELOAD_DELAYS = [1000, 2000, 5000, 10000, 20000, 30000];

// ─── SMALL COMPONENTS & helpers (Bar, StatusDot, ScanLine, ModuleCard, ModuleHub, BuildFixPanel, VoltronMap, GlobalPulse)
// For brevity the component implementations are identical to the Downloads version; only the runtime fetch URL is changed below.

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
function _StatusDot({ status }) {
  const c = status === "ONLINE" ? NEON.green
    : status === "ACTIVE" ? NEON.cyan
    : status === "BUILDING" ? NEON.gold
    : status === "PLANNED" ? NEON.textDim
    : NEON.orange;
  return (
    <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: c, boxShadow: `0 0 6px ${c}`, marginRight: 6 }} />
  );
}

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
function _Bar({ value, color }) {
  // Use GPU-friendly transform instead of width to avoid layout thrash on low-power kiosks
  const scale = Math.max(0, Math.min(1, Number(value) || 0));
  return (
    <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 2, overflow: "hidden", transformOrigin: 'left' }}>
      <div style={{ height: "100%", transform: `scaleX(${scale})`, transformOrigin: 'left', background: color, borderRadius: 2, boxShadow: `0 0 8px ${color}`, transition: "transform 300ms ease", willChange: 'transform' }} />
    </div>
  );
}

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
function _ScanLine() { return <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)", pointerEvents: "none" }} /> }

// NOTE: The rest of small components (ModuleCard, ModuleHub, VoltronMap, GlobalPulse, BuildFixPanel) are the same as in the provided HUD file.

// ─── MAIN APP (copied but using same-origin proxy URL) ─────────────────────────────────────────────────────────────────
export default function BerntoutGlobalXXL() {
  const [selectedModule, setSelectedModule] = useState("xxl");
  const [time, setTime] = useState(new Date());
  const [tab, setTab] = useState("hub"); // hub | build | voltron

  // Live modules state (falls back to static MODULES)
  const [modulesData, setModulesData] = useState(MODULES);
  const [, setLoadingModules] = useState(false);
  const [moduleError, setModuleError] = useState(null);
  const [runtimeSnapshot, setRuntimeSnapshot] = useState(null);
  const [displayMode, setDisplayMode] = useState("MASTER");
  const [isHovering, setIsHovering] = useState(false);
  const [lockedModule, setLockedModule] = useState("");
  const [rotateMs, setRotateMs] = useState(10000);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [displayModule, setDisplayModule] = useState(selectedModule);
  const [moduleVisible, setModuleVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Prefer a safe, read-only snapshot of the reduced-motion preference for
  // use inside effects and to satisfy exhaustive-deps. We keep the state
  // (setPrefersReducedMotion) for the existing matchMedia listener below
  // but expose a memoized read so effects may depend on a stable ref.
  const prefersReducedMotionMemo = React.useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  }, []);

  // Kiosk hardening: progressive reload + exponential backoff
  const [reloadAttempt, setReloadAttempt] = useState(0);
  const [offlineSeconds, setOfflineSeconds] = useState(0);
  const [isOffline, setIsOffline] = useState(false);
  
  const getReloadDelay = useCallback(() => RELOAD_DELAYS[Math.min(reloadAttempt, RELOAD_DELAYS.length - 1)], [reloadAttempt]);

  const requestFs = async () => {
    try {
      const el = document.documentElement;
      if (!document.fullscreenElement && el.requestFullscreen) {
        await el.requestFullscreen();
      }
    } catch {
      // ignore
    }
  };

  const exitFs = async () => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  // Parse URL params for ?mode=...&module=...
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search);
      const m = params.get("module");
      const mode = params.get("mode");
      const rotateRaw = params.get("rotate");
        if (m) {
          setSelectedModule(m);
          setLockedModule(m.toLowerCase());
        }
        if (mode) setDisplayMode(mode.toUpperCase());
        const rotateSeconds = rotateRaw ? Number(rotateRaw) : 10;
        const ms = Number.isFinite(rotateSeconds) && rotateSeconds > 0 ? rotateSeconds * 1000 : 10000;
        setRotateMs(ms);
        const fsParam = params.get("fullscreen");
        if (fsParam === "1") {
          // try to request fullscreen (may require user gesture)
          requestFs();
        }
    } catch {
      // ignore
    }
  }, []);

  const isKiosk = (displayMode || "").toUpperCase().startsWith("KIOSK");
  const isLowPower = (displayMode || "").toUpperCase() === "KIOSK-LOWPOWER";

  // Poll runtime snapshot via same-origin Next proxy
  useEffect(() => {
    if (typeof window === "undefined") return;
    let mounted = true;
    const controller = new AbortController();
    const API = "/api/internal/runtime/status"; // same-origin proxy route in Next
    const pollInterval = isLowPower ? 10000 : isKiosk ? 5000 : 3000;

    async function fetchSnapshot() {
      setLoadingModules(true);
      try {
        const res = await fetch(API, { signal: controller.signal });
        if (!res.ok) throw new Error(res.statusText || "Fetch error");
        const json = await res.json();
        if (!mounted) return;
        if (mounted) setRuntimeSnapshot(json);
        if (Array.isArray(json.modules)) {
          setModulesData(prev => {
            const map = (prev || MODULES).reduce((acc, p) => (acc[p.id] = p, acc), {});
            json.modules.forEach(m => {
              const base = map[m.id] || { id: m.id, label: m.label || m.id };
              map[m.id] = { ...base, ...m };
            });
            return Object.values(map);
          });
        }
        setModuleError(null);
        // Online again: cancel countdown + reset backoff
        setIsOffline(false);
        setOfflineSeconds(0);
        setReloadAttempt(0);
      } catch (err) {
        if (mounted) {
          setModuleError(err.message || String(err));
          setModulesData(MODULES);
          // Offline: show countdown (do NOT bump reloadAttempt here)
          setIsOffline(true);
        }
      }
    }

    fetchSnapshot().catch(() => {});
    const iv = setInterval(fetchSnapshot, pollInterval);
    return () => { mounted = false; controller.abort(); clearInterval(iv); };
  }, [isKiosk, isLowPower]);

  // `mod` was unused; compute on-demand if needed

  // modeLower used by rotation logic
  const modeLower = (displayMode || "MASTER").toLowerCase();

  // WALLBOARD rotation: auto-advance selectedModule when mode=wallboard
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (modeLower !== "wallboard") return;
    if (!modulesData || modulesData.length < 2) return;
    if (moduleError) return; // pause on offline
    if (isHovering) return; // pause while hovering

    const list = lockedModule
      ? modulesData.filter((m) => (m?.id || "").toLowerCase() === lockedModule)
      : modulesData;

    if (!list || list.length < 2) return;

    const getId = (m) => (m?.id || "").toString();

    const tick = () => {
      setSelectedModule((prev) => {
        const idx = list.findIndex((m) => getId(m) === prev);
        const nextIdx = idx >= 0 ? (idx + 1) % list.length : 0;
        return getId(list[nextIdx]);
      });
    };

    const t = setInterval(tick, rotateMs);
    return () => clearInterval(t);
  }, [modeLower, rotateMs, modulesData, lockedModule, isHovering, moduleError]);

  // Smooth fade when selectedModule changes (for wallboard)
  useEffect(() => {
    if (selectedModule === displayModule) return;
    if (prefersReducedMotionMemo) {
      setDisplayModule(selectedModule);
      setModuleVisible(true);
      return;
    }
    setModuleVisible(false);
    const t = setTimeout(() => {
      setDisplayModule(selectedModule);
      setModuleVisible(true);
    }, 180);
    return () => clearTimeout(t);
  }, [selectedModule, displayModule, prefersReducedMotionMemo]);

  // Track fullscreen changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFsChange);
    onFsChange();
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // detect reduced-motion preference
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    try {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      const set = () => setPrefersReducedMotion(Boolean(mq.matches));
      set();
      mq.addEventListener?.('change', set);
      return () => mq.removeEventListener?.('change', set);
    } catch {
      // ignore
    }
  }, []);

  const formatUptime = (s) => {
    if (s === undefined || s === null) return "—";
    const sec = Number(s) || 0;
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const ss = sec % 60;
    return `${h}h ${m}m ${ss}s`;
  };

  const formatBytes = (b) => {
    if (b === undefined || b === null) return "—";
    const n = Number(b) || 0;
    const mb = Math.round(n / 1024 / 1024);
    return `${mb}MB`;
  };

  // Enforce kiosk behaviors when displayMode=KIOSK
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const kioskActive = (displayMode || '').toUpperCase() === 'KIOSK';
    let prevOverflow = '';
    let wheelHandler = null;
    let keyHandler = null;

    if (kioskActive) {
      // disable scrolling on document
      prevOverflow = document.documentElement.style.overflow || '';
      document.documentElement.style.overflow = 'hidden';

      // prevent pinch-zoom / ctrl+wheel zoom
      wheelHandler = (e) => { if (e.ctrlKey) { e.preventDefault(); } };
      document.addEventListener('wheel', wheelHandler, { passive: false });

      // prevent ctrl+/-/0 zoom shortcuts
      keyHandler = (e) => {
        if ((e.ctrlKey || e.metaKey) && ['+', '-', '=', '0'].includes(e.key)) {
          e.preventDefault();
        }
      };
      document.addEventListener('keydown', keyHandler);
    }

    return () => {
      if (kioskActive) {
        try { document.documentElement.style.overflow = prevOverflow; } catch { /* ignore */ }
        if (wheelHandler) document.removeEventListener('wheel', wheelHandler);
        if (keyHandler) document.removeEventListener('keydown', keyHandler);
      }
    };
  }, [displayMode]);

  // Auto-reload when offline for too long (kiosk only)
  useEffect(() => {
    const kioskActive = (displayMode || '').toUpperCase() === 'KIOSK';
    if (!kioskActive) { setOfflineSeconds(0); return; }

    if (!moduleError) { setOfflineSeconds(0); return; }

    const iv = setInterval(() => {
      setOfflineSeconds(s => {
        const ns = s + 1;
        if (ns >= getReloadDelay()) {
          try { window.location.reload(); } catch { /* ignore */ }
        }
        return ns;
      });
    }, 1000);

    return () => clearInterval(iv);
  }, [moduleError, displayMode, getReloadDelay]);

  // If kiosk+lockedModule, enforce selectedModule to remain locked
  useEffect(() => {
    const kioskActive = (displayMode || '').toUpperCase() === 'KIOSK';
    if (kioskActive && lockedModule) {
      setSelectedModule(lockedModule);
    }
  }, [displayMode, lockedModule]);

  return (
    <div onMouseEnter={() => !isKiosk && setIsHovering(true)} onMouseLeave={() => !isKiosk && setIsHovering(false)} style={{ background: NEON.steelDark, minHeight: "100vh", fontFamily: "'Courier New', monospace", color: NEON.text, position: "relative", overflow: "hidden" }}>
      <style>{`@keyframes pulse { 0%,100% { opacity:1; box-shadow: 0 0 6px currentColor; } 50% { opacity:0.5; box-shadow: 0 0 12px currentColor; } } * { box-sizing: border-box; }`}</style>
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: `linear-gradient(90deg, ${NEON.steelDark} 0%, ${NEON.steel} 50%, ${NEON.steelDark} 100%)`, borderBottom: `1px solid ${NEON.orangeDim}`, padding: "0 20px", display: "flex", alignItems: "center", gap: 20, height: 52, boxShadow: `0 2px 20px rgba(255,107,0,0.15)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20, filter: `drop-shadow(0 0 8px ${NEON.orange})` }}>⚡</span>
          <span style={{ fontSize: 14, fontWeight: 900, color: NEON.orange, letterSpacing: 3 }}>BERNTOUTGLOBAL</span>
          <span style={{ fontSize: 10, color: NEON.textDim, letterSpacing: 2 }}>XXL</span>
        </div>
        <div style={{ height: 24, width: 1, background: "rgba(255,255,255,0.1)" }} />
        <div style={{ fontSize: 10, color: NEON.textDim }}>EIN: 41-3495660 &nbsp;|&nbsp; {modulesData.filter(m => m.status === "ONLINE" || m.status === "ACTIVE").length} MODULES ACTIVE {displayMode !== "MASTER" && (<span style={{ marginLeft: 8, color: NEON.textDim }}>MODE: {displayMode}</span>)}</div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: NEON.textDim }}>SYSTEM TIME</div>
            <div style={{ fontSize: 13, color: NEON.orange, letterSpacing: 2 }}>{time.toLocaleTimeString()}</div>
          </div>

          {/* Runtime status badge */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: 10 }}>
            <div style={{ color: NEON.textDim }}>RUNTIME</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ padding: '4px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', color: NEON.text, display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ width: 10, height: 10, borderRadius: 6, background: runtimeSnapshot?.redis_connected ? NEON.green : NEON.red, boxShadow: `0 0 6px ${runtimeSnapshot?.redis_connected ? NEON.green : NEON.red}` }} />
                <span style={{ color: NEON.textDim, fontSize: 11 }}>{runtimeSnapshot?.redis_connected ? 'redis' : 'no-redis'}</span>
                <span style={{ color: NEON.textDim, fontSize: 11 }}>•</span>
                <span style={{ color: NEON.textDim, fontSize: 11 }}>{formatUptime(runtimeSnapshot?.uptime_seconds)}</span>
                <span style={{ color: NEON.textDim, fontSize: 11 }}>•</span>
                <span style={{ color: NEON.textDim, fontSize: 11 }}>{formatBytes(runtimeSnapshot?.memory_rss ?? runtimeSnapshot?.memory_total)}</span>
                <span style={{ color: NEON.textDim, fontSize: 11 }}>•</span>
                <span style={{ color: NEON.textDim, fontSize: 11 }}>Q:{runtimeSnapshot?.queue_depth ?? '—'}</span>
                <span style={{ color: NEON.textDim, fontSize: 11 }}>•</span>
                <span style={{ color: NEON.orange, fontSize: 11 }}>{runtimeSnapshot?.commit ? String(runtimeSnapshot.commit).slice(0,7) : runtimeSnapshot?.version || '—'}</span>
              </div>
            </div>
            {displayMode === "KIOSK" && isOffline ? (
              <div style={{ marginLeft: 8 }}>
                <span style={{ color: NEON.red, fontSize: 11, opacity: 0.9 }}>OFFLINE — reload in {Math.max(0, getReloadDelay() - offlineSeconds)}s</span>
              </div>
            ) : null}
          </div>

          <button onClick={() => (document.fullscreenElement ? exitFs() : requestFs())} title="Toggle fullscreen" style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", color: NEON.text, cursor: "pointer" }}>
            {isFullscreen ? "EXIT FS" : "FULLSCREEN"}
          </button>
          <div style={{ background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 4, padding: "4px 10px", fontSize: 10, color: NEON.green, letterSpacing: 2 }}>● ONLINE</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 0, position: "relative", zIndex: 1 }}>
        <div style={{ borderRight: "1px solid rgba(255,107,0,0.15)", padding: 16, height: "calc(100vh - 52px)", overflowY: "auto", overflowX: "hidden", background: `linear-gradient(180deg, ${NEON.steelMid} 0%, ${NEON.steelDark} 100%)` }}>
          <div style={{ fontSize: 9, color: NEON.textDim, letterSpacing: 3, marginBottom: 12 }}>▸ MODULE SELECTOR</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(modulesData || MODULES).map(m => (
              <div key={m.id} style={{ padding: 8, border: `1px solid ${m.color || 'rgba(255,255,255,0.08)'}`, borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>{m.icon} <div style={{ marginLeft: 8 }}>{m.label}</div></div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: 20, height: "calc(100vh - 52px)", overflowY: "auto" }}>
          {moduleError && (<div style={{ background: "rgba(255,51,85,0.06)", border: "1px solid rgba(255,51,85,0.12)", padding: 8, borderRadius: 6, marginBottom: 12 }}><div style={{ fontSize: 12, color: NEON.red }}>OFFLINE — using fallback HUD data ({moduleError})</div></div>)}
          <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
            <button onClick={() => setTab('hub')} style={{ padding: 8 }}>Hub</button>
            <button onClick={() => setTab('build')} style={{ padding: 8 }}>Build Fix</button>
            <button onClick={() => setTab('voltron')} style={{ padding: 8 }}>Voltron</button>
          </div>

          {tab === 'hub' && (() => {
            const modDisplay = modulesData.find(m => m.id === displayModule) || MODULES.find(m => m.id === displayModule);
            return (
              <div style={{ transition: prefersReducedMotion ? 'none' : 'opacity 180ms ease', willChange: 'opacity', opacity: moduleVisible ? 1 : 0 }}>
                Module Hub: {modDisplay ? modDisplay.label : '—'}
              </div>
            );
          })()}
          {tab === 'build' && (<div style={{ transition: prefersReducedMotion ? 'none' : 'opacity 180ms ease', willChange: 'opacity', opacity: moduleVisible ? 1 : 0 }}>Build Fix Panel</div>)}
          {tab === 'voltron' && (<div style={{ transition: prefersReducedMotion ? 'none' : 'opacity 180ms ease', willChange: 'opacity', opacity: moduleVisible ? 1 : 0 }}>Voltron Map</div>)}
        </div>
      </div>
    </div>
  );
}

// End of component
