"use client";

import { useEffect, useMemo, useState } from "react";
import { ensureAllFeeds, type Home1Feed, type TmiAllFeeds } from "@/packages/magazine-engine/liveFeedBus";
import HomeFeedObserver from "@/components/admin/HomeFeedObserver";

type DebugState = {
  glow: boolean;
  frames: boolean;
  shapes: boolean;
  z: boolean;
  grid: boolean;
  density: boolean;
  zones: boolean;
  spacing: boolean;
};

type Home1LiveFeed = Home1Feed;

type HomeFeedPayload = TmiAllFeeds[keyof TmiAllFeeds];

const STORAGE_KEY = "tmi-style-debug-state";

const DEFAULT_STATE: DebugState = {
  glow: false,
  frames: false,
  shapes: false,
  z: false,
  grid: false,
  density: false,
  zones: false,
  spacing: false,
};

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
    __TMI_LIVE_FEED__?: Home1LiveFeed;
    __TMI_ALL_FEEDS__?: Partial<TmiAllFeeds>;
  }
}

function applyBodyFlags(state: DebugState) {
  const body = document.body;
  body.dataset.debug = "true";
  body.classList.toggle("debug-glow", state.glow);
  body.classList.toggle("debug-frames", state.frames);
  body.classList.toggle("debug-shapes", state.shapes);
  body.classList.toggle("debug-z", state.z);
  body.classList.toggle("debug-grid", state.grid);
  body.classList.toggle("debug-density", state.density);
  body.classList.toggle("debug-zones", state.zones);
  body.classList.toggle("debug-spacing", state.spacing);
}

export default function StyleDebugPage() {
  const [state, setState] = useState<DebugState>(DEFAULT_STATE);
  const [liveFeed, setLiveFeed] = useState<Home1LiveFeed | null>(null);
  const [allFeeds, setAllFeeds] = useState<Partial<TmiAllFeeds>>({});
  const [featureIdInput, setFeatureIdInput] = useState("");
  const [speedInput, setSpeedInput] = useState("0.0032");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<DebugState>;
      setState({ ...DEFAULT_STATE, ...parsed });
    } catch {
      setState(DEFAULT_STATE);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.__TMI_DEBUG__ = {
      ...window.__TMI_DEBUG__,
      ...state,
    };
    applyBodyFlags(state);
  }, [state]);

  useEffect(() => {
    ensureAllFeeds();

    const readFeed = () => {
      setLiveFeed(window.__TMI_LIVE_FEED__ ?? null);
      setAllFeeds(window.__TMI_ALL_FEEDS__ ?? {});
    };

    const onFeed = (event: Event) => {
      const customEvent = event as CustomEvent<Home1LiveFeed>;
      setLiveFeed(customEvent.detail);
    };

    readFeed();
    window.addEventListener("tmi:live-feed", onFeed as EventListener);
    window.addEventListener("tmi:all-feeds", readFeed as EventListener);
    const id = window.setInterval(readFeed, 250);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("tmi:live-feed", onFeed as EventListener);
      window.removeEventListener("tmi:all-feeds", readFeed as EventListener);
    };
  }, []);

  const toggles = useMemo(
    () =>
      (Object.keys(DEFAULT_STATE) as Array<keyof DebugState>).map((key) => ({
        key,
        label: key.toUpperCase(),
        value: state[key],
      })),
    [state]
  );

  return (
    <main style={{ minHeight: "100vh", background: "#06080f", color: "#fff", padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Style Debug Control</h1>
      <p style={{ opacity: 0.8 }}>
        Dev-only visual controls. Use with <code>?design=1</code> to inspect overlay layers.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
        {toggles.map((toggle) => (
          <button
            key={toggle.key}
            type="button"
            onClick={() =>
              setState((prev) => ({
                ...prev,
                [toggle.key]: !prev[toggle.key],
              }))
            }
            style={{
              border: "1px solid rgba(0,255,255,0.4)",
              borderRadius: 10,
              padding: "12px 14px",
              background: toggle.value ? "rgba(0,255,255,0.18)" : "rgba(255,255,255,0.06)",
              color: "#fff",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            <div style={{ fontWeight: 700 }}>{toggle.label}</div>
            <div style={{ opacity: 0.8, marginTop: 6 }}>{toggle.value ? "ON" : "OFF"}</div>
          </button>
        ))}
      </div>

      <section
        style={{
          marginTop: 24,
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 14,
          padding: 16,
          background: "rgba(255,255,255,0.04)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Control Room Live Feeds</h2>

        <HomeFeedObserver title="Unified Feed Observer (HOME1-HOME5)" />

        {/* ── All-surface status cards ── */}
        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", marginBottom: 18 }}>
          {(["home1","home2","home3","home4","home5"] as const).map((key) => {
            const feed = allFeeds[key] as Record<string, unknown> | undefined;
            const phase = feed?.phase as string ?? "offline";
            const isActive = phase === "active" || phase === "rotate";
            const SURFACE_META: Record<string, { label: string; color: string; desc: string; route: string }> = {
              home1: { label: "HOME 1", color: "#67e8f9",  desc: "Orbit · Crown Rotation",   route: "/home/1" },
              home2: { label: "HOME 2", color: "#a78bfa",  desc: "Editorial · Discovery",     route: "/home/2" },
              home3: { label: "HOME 3", color: "#6ee7b7",  desc: "Live Rooms · World",        route: "/home/3" },
              home4: { label: "HOME 4", color: "#fcd34d",  desc: "Marketplace · Games",       route: "/home/4" },
              home5: { label: "HOME 5", color: "#f9a8d4",  desc: "Leaderboard · Rankings",    route: "/home/5" },
            };
            const meta = SURFACE_META[key];
            return (
              <article
                key={key}
                style={{
                  border: `1px solid ${isActive ? meta.color + "55" : "rgba(255,255,255,0.1)"}`,
                  borderRadius: 12,
                  background: isActive ? `${meta.color}10` : "rgba(3,8,20,0.7)",
                  padding: 12,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* live pulse */}
                {isActive && (
                  <span style={{
                    position: "absolute", top: 10, right: 10,
                    width: 8, height: 8, borderRadius: "50%",
                    background: meta.color,
                    boxShadow: `0 0 8px ${meta.color}`,
                    animation: "tmi-pulse 1.2s ease-in-out infinite",
                  }} />
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.18em", color: meta.color }}>
                    {meta.label}
                  </span>
                  <span style={{ fontSize: 9, opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                    {meta.desc}
                  </span>
                </div>
                <div style={{ fontSize: 12, marginBottom: 8, color: isActive ? "#e2e8f0" : "#64748b" }}>
                  Phase: <strong>{phase}</strong>
                </div>
                {feed && (
                  <pre style={{ margin: "0 0 8px", fontSize: 10, whiteSpace: "pre-wrap", color: `${meta.color}cc`, maxHeight: 80, overflow: "hidden" }}>
                    {JSON.stringify(feed, null, 2)}
                  </pre>
                )}
                <a
                  href={meta.route}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-block",
                    fontSize: 10,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: meta.color,
                    border: `1px solid ${meta.color}44`,
                    borderRadius: 6,
                    padding: "4px 10px",
                    textDecoration: "none",
                  }}
                >
                  Open Surface →
                </a>
              </article>
            );
          })}
        </div>

        {/* ── Session users ── */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 18, padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <span style={{ fontSize: 10, opacity: 0.5, letterSpacing: "0.14em", textTransform: "uppercase" }}>Session:</span>
          {[
            { name: "You",            color: "#67e8f9" },
            { name: "Jay Paul Sanchez", color: "#a78bfa" },
            { name: "Justin King",    color: "#6ee7b7" },
          ].map(({ name, color }) => (
            <span key={name} style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color, border: `1px solid ${color}40`, borderRadius: 20, padding: "3px 10px" }}>
              {name}
            </span>
          ))}
          <span style={{ fontSize: 10, opacity: 0.4, marginLeft: "auto" }}>
            Feed sync: ws:{typeof window !== "undefined" ? window.location.hostname : "localhost"}:8080
          </span>
        </div>

        <h2 style={{ marginTop: 4 }}>Home1 Focus Controls</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10 }}>
          <div><strong>PHASE</strong><div>{liveFeed?.phase ?? "-"}</div></div>
          <div><strong>GENRE</strong><div>{liveFeed?.genre ?? "-"}</div></div>
          <div><strong>FEATURED</strong><div>{liveFeed?.featuredId ?? "-"}</div></div>
          <div><strong>ANGLE</strong><div>{liveFeed?.orbitAngle?.toFixed(2) ?? "-"}</div></div>
          <div><strong>SPEED</strong><div>{liveFeed?.orbitSpeed?.toFixed(4) ?? "-"}</div></div>
          <div><strong>UPDATED</strong><div>{liveFeed ? new Date(liveFeed.timestamp).toLocaleTimeString() : "-"}</div></div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, marginTop: 16 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Force Feature Artist ID</span>
            <input
              value={featureIdInput}
              onChange={(event) => setFeatureIdInput(event.target.value)}
              placeholder="big-a"
              style={{ borderRadius: 8, border: "1px solid rgba(255,255,255,0.18)", padding: "10px 12px", background: "#0b1020", color: "#fff" }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Orbit Speed</span>
            <input
              value={speedInput}
              onChange={(event) => setSpeedInput(event.target.value)}
              placeholder="0.0032"
              style={{ borderRadius: 8, border: "1px solid rgba(255,255,255,0.18)", padding: "10px 12px", background: "#0b1020", color: "#fff" }}
            />
          </label>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 16 }}>
          <button
            type="button"
            onClick={() => window.__TMI_DEBUG__?.forceFeature?.(featureIdInput.trim() || null)}
            style={{ borderRadius: 10, border: "1px solid rgba(250,204,21,0.45)", padding: "10px 14px", background: "rgba(250,204,21,0.12)", color: "#fff", cursor: "pointer" }}
          >
            Force Feature
          </button>
          <button
            type="button"
            onClick={() => window.__TMI_DEBUG__?.forceFeature?.(null)}
            style={{ borderRadius: 10, border: "1px solid rgba(255,255,255,0.18)", padding: "10px 14px", background: "rgba(255,255,255,0.06)", color: "#fff", cursor: "pointer" }}
          >
            Clear Feature
          </button>
          <button
            type="button"
            onClick={() => {
              const nextSpeed = Number(speedInput);
              if (Number.isFinite(nextSpeed)) {
                window.__TMI_DEBUG__?.setSpeed?.(nextSpeed);
              }
            }}
            style={{ borderRadius: 10, border: "1px solid rgba(34,211,238,0.45)", padding: "10px 14px", background: "rgba(34,211,238,0.12)", color: "#fff", cursor: "pointer" }}
          >
            Apply Speed
          </button>
          <button
            type="button"
            onClick={() => window.__TMI_DEBUG__?.triggerBurst?.()}
            style={{ borderRadius: 10, border: "1px solid rgba(244,114,182,0.45)", padding: "10px 14px", background: "rgba(244,114,182,0.12)", color: "#fff", cursor: "pointer" }}
          >
            Trigger Burst
          </button>
        </div>
      </section>
    </main>
  );
}
