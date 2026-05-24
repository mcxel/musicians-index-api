"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  generateChaosSlots,
  focusSlot,
  CHAOS_CSS,
  type ChaosSlot,
} from "@/lib/showmanship/ChaosGridEngine";
import BroadcastMediaSurface, { type MediaSource } from "@/components/showmanship/BroadcastMediaSurface";
import SponsorGhostPanel, { type SponsorAsset } from "@/components/showmanship/SponsorGhostPanel";
import DirectorPreviewMonitor from "@/components/showmanship/DirectorPreviewMonitor";
import type { UserTier } from "@/lib/showmanship/AssetLockerPolicy";
import { getAssetLockerPolicy, getMediaSurfaceLimit } from "@/lib/showmanship/AssetLockerPolicy";
import { getGlobalOrchestrator } from "@/lib/showmanship/MomentOrchestrator";
import { getClosureEngine } from "@/lib/showmanship/ClosureSequenceEngine";
import SeatUpgradeUI from "@/components/showmanship/SeatUpgradeUI";

interface ShowmanshipCommandCenterProps {
  performerTier?: UserTier;
  performerName?: string;
  fallbackImageUrl?: string;   // album art / motion image
  sponsors?: SponsorAsset[];
  isLive?: boolean;
  viewerCount?: number;
  onGoLive?: () => void;
  onEndShow?: () => void;
}

type MediaSurfaceEntry = {
  slotIndex: number;
  source: MediaSource | null;
  label: string;
};

type Tab = "media" | "sponsors" | "memory" | "settings";

let cssInjected = false;

// Predefined quick-launch media options
const QUICK_MEDIA: Array<{ label: string; icon: string; source: MediaSource }> = [
  { label: "YouTube", icon: "▶", source: { type: "youtube", videoId: "" } },
  { label: "Spotify",  icon: "♪", source: { type: "spotify",  embedUrl: "" } },
  { label: "Web / Google", icon: "🌐", source: { type: "url", src: "https://www.google.com" } },
];

export default function ShowmanshipCommandCenter({
  performerTier = "free",
  performerName = "Performer",
  fallbackImageUrl,
  sponsors = [],
  isLive = false,
  viewerCount = 0,
  onGoLive,
  onEndShow,
}: ShowmanshipCommandCenterProps) {
  const policy = getAssetLockerPolicy(performerTier);
  const maxSurfaces = getMediaSurfaceLimit(performerTier);

  const [surfaces, setSurfaces] = useState<MediaSurfaceEntry[]>([]);
  const [focusedSlot, setFocusedSlot] = useState<number | null>(null);
  const [slots, setSlots] = useState<ChaosSlot[]>([]);
  const [tab, setTab] = useState<Tab>("media");
  const [ghostOpen, setGhostOpen] = useState(false);
  const [selectedSponsors, setSelectedSponsors] = useState<SponsorAsset[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [showDirector, setShowDirector] = useState(true);
  const [inputMode, setInputMode] = useState<"youtube" | "spotify" | "url" | null>(null);
  const [ritualReady, setRitualReady] = useState(false);
  const [momentCount, setMomentCount] = useState(0);
  const [ritualFired, setRitualFired] = useState(false);

  useEffect(() => {
    if (!cssInjected && typeof document !== "undefined") {
      cssInjected = true;
      const s = document.createElement("style");
      s.textContent = CHAOS_CSS;
      document.head.appendChild(s);
    }
    setSlots(generateChaosSlots(maxSurfaces));
  }, [maxSurfaces]);

  // Wire MomentOrchestrator actions into this UI
  useEffect(() => {
    const orch = getGlobalOrchestrator();
    const unsub = orch.onAction((action) => {
      switch (action.type) {
        case "TRIGGER_SPONSOR_POP":
          if (policy.sponsorPopButton && sponsors.length > 0) {
            const target = action.sponsorId
              ? sponsors.find(s => s.id === action.sponsorId)
              : sponsors[0];
            if (target) {
              setSelectedSponsors([target]);
              setGhostOpen(true);
            }
          }
          break;
        case "FOCUS_MEDIA_SURFACE":
          setFocusedSlot(action.slotIndex);
          break;
        default:
          break;
      }
    });
    return unsub;
  }, [policy.sponsorPopButton, sponsors]);

  // Poll closure engine readiness every 2s — no pub/sub for cooldown state
  useEffect(() => {
    const engine = getClosureEngine();
    const id = setInterval(() => {
      setRitualReady(engine.canRunRitual());
      setMomentCount(engine.getMomentCount());
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const handleTriggerRitual = useCallback(() => {
    const engine = getClosureEngine();
    const fired = engine.run({ triggerUserId: performerName });
    if (fired) {
      setRitualFired(true);
      setRitualReady(false);
      setTimeout(() => setRitualFired(false), 20000);
    }
  }, [performerName]);

  const addSurface = useCallback((source: MediaSource, label: string) => {
    setSurfaces(prev => {
      if (prev.length >= maxSurfaces) return prev;
      return [...prev, { slotIndex: prev.length, source, label }];
    });
  }, [maxSurfaces]);

  const removeSurface = useCallback((slotIndex: number) => {
    setSurfaces(prev => prev.filter(s => s.slotIndex !== slotIndex));
    if (focusedSlot === slotIndex) setFocusedSlot(null);
  }, [focusedSlot]);

  const handleQuickLaunch = useCallback((template: (typeof QUICK_MEDIA)[0]) => {
    if (!policy.canShowExternalMedia) return;
    if (template.source.type === "url" && template.label === "Web / Google") {
      addSurface({ type: "url", src: "https://www.google.com" }, "Google");
      return;
    }
    setInputMode(template.source.type as "youtube" | "spotify" | "url");
  }, [policy.canShowExternalMedia, addSurface]);

  const handleUrlSubmit = useCallback(() => {
    if (!urlInput.trim()) return;
    if (inputMode === "youtube") {
      const match = urlInput.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
      const videoId = match?.[1] ?? urlInput.trim();
      addSurface({ type: "youtube", videoId }, `YouTube: ${videoId}`);
    } else if (inputMode === "spotify") {
      addSurface({ type: "spotify", embedUrl: urlInput.trim() }, "Spotify");
    } else {
      addSurface({ type: "url", src: urlInput.trim() }, urlInput.trim());
    }
    setUrlInput("");
    setInputMode(null);
  }, [urlInput, inputMode, addSurface]);

  const handleSponsorPop = useCallback((sponsor: SponsorAsset) => {
    if (!policy.sponsorPopButton) return;
    setSelectedSponsors([sponsor]);
    setGhostOpen(true);
  }, [policy.sponsorPopButton]);

  const handleSponsorMultiPop = useCallback(() => {
    if (!policy.sponsorPopButton || sponsors.length === 0) return;
    setSelectedSponsors(sponsors.slice(0, policy.maxSponsors));
    setGhostOpen(true);
  }, [policy, sponsors]);

  const TAB_ITEMS: Array<{ id: Tab; label: string }> = [
    { id: "media",    label: "📡 Media"    },
    { id: "sponsors", label: "💼 Sponsors" },
    { id: "memory",   label: "🖼 Memory"   },
    { id: "settings", label: "⚙ Settings"  },
  ];

  return (
    <>
      {/* Ghost Panel */}
      <SponsorGhostPanel
        sponsors={selectedSponsors}
        isOpen={ghostOpen}
        onClose={() => setGhostOpen(false)}
      />

      {/* Director PiP */}
      {showDirector && (
        <DirectorPreviewMonitor
          isLive={isLive}
          viewerCount={viewerCount}
        />
      )}

      {/* Seat Upgrade CTA — for fan-facing surfaces that embed this */}
      {/* Performer sees it as "audience upgrade pulse" indicator */}

      {/* Active media surfaces (Chaos Grid) */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 3000 }}>
        {surfaces.map((entry) => {
          const slot = slots[entry.slotIndex];
          if (!slot) return null;
          const isFocused = focusedSlot === entry.slotIndex;
          return (
            <div key={entry.slotIndex} style={{ pointerEvents: "auto" }}>
              <BroadcastMediaSurface
                slot={isFocused ? focusSlot(slot) : slot}
                source={entry.source}
                focused={isFocused}
                fallbackImageUrl={fallbackImageUrl}
                fallbackLabel={entry.label}
                onFocus={() => setFocusedSlot(entry.slotIndex)}
                onClose={() => removeSurface(entry.slotIndex)}
              />
            </div>
          );
        })}
      </div>

      {/* Command Panel — fixed bottom bar */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        zIndex: 9000,
        background: "rgba(0,0,0,0.92)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        padding: "0 16px",
      }}>
        {/* Tab bar */}
        <div style={{ display: "flex", gap: 2, borderBottom: "1px solid rgba(255,255,255,0.06)", paddingTop: 6 }}>
          {TAB_ITEMS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: "6px 14px", fontSize: 9, fontWeight: 900,
                letterSpacing: "0.1em", cursor: "pointer",
                background: tab === t.id ? "rgba(0,229,255,0.1)" : "transparent",
                border: "none",
                borderBottom: `2px solid ${tab === t.id ? "#00e5ff" : "transparent"}`,
                color: tab === t.id ? "#00e5ff" : "rgba(255,255,255,0.3)",
                transition: "color 0.2s, background 0.2s",
              }}
            >
              {t.label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          {/* Go Live / End Show */}
          {!isLive ? (
            <button
              onClick={onGoLive}
              style={{
                margin: "4px 0", padding: "4px 12px", fontSize: 9, fontWeight: 900,
                letterSpacing: "0.12em", cursor: "pointer",
                background: "rgba(220,30,30,0.15)", border: "1px solid rgba(220,30,30,0.4)",
                borderRadius: 6, color: "#ff4444",
              }}
            >
              🔴 Go Live
            </button>
          ) : (
            <button
              onClick={onEndShow}
              style={{
                margin: "4px 0", padding: "4px 12px", fontSize: 9, fontWeight: 900,
                letterSpacing: "0.12em", cursor: "pointer",
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 6, color: "rgba(255,255,255,0.4)",
              }}
            >
              End Show
            </button>
          )}
        </div>

        {/* Tab content */}
        <div style={{ padding: "10px 0 12px", minHeight: 64 }}>

          {/* MEDIA TAB */}
          {tab === "media" && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-start" }}>
              {/* Quick launch buttons */}
              {QUICK_MEDIA.map(qm => (
                <button
                  key={qm.label}
                  onClick={() => handleQuickLaunch(qm)}
                  disabled={!policy.canShowExternalMedia || surfaces.length >= maxSurfaces}
                  style={{
                    padding: "7px 12px", fontSize: 10, fontWeight: 800,
                    cursor: policy.canShowExternalMedia ? "pointer" : "not-allowed",
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8, color: policy.canShowExternalMedia ? "#fff" : "rgba(255,255,255,0.2)",
                    display: "flex", alignItems: "center", gap: 5,
                  }}
                >
                  <span>{qm.icon}</span> {qm.label}
                </button>
              ))}

              {/* URL input mode */}
              {inputMode && (
                <div style={{ display: "flex", gap: 6, alignItems: "center", flex: 1, minWidth: 220 }}>
                  <input
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleUrlSubmit()}
                    placeholder={inputMode === "youtube" ? "YouTube URL or video ID" : inputMode === "spotify" ? "Spotify embed URL" : "Enter URL"}
                    autoFocus
                    style={{
                      flex: 1, padding: "6px 10px", fontSize: 11,
                      background: "rgba(255,255,255,0.06)", border: "1px solid rgba(0,229,255,0.25)",
                      borderRadius: 7, color: "#fff", outline: "none",
                    }}
                  />
                  <button onClick={handleUrlSubmit} style={{ padding: "6px 12px", fontSize: 10, fontWeight: 900, background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.3)", borderRadius: 7, color: "#00e5ff", cursor: "pointer" }}>Add</button>
                  <button onClick={() => { setInputMode(null); setUrlInput(""); }} style={{ padding: "6px 10px", fontSize: 10, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>✕</button>
                </div>
              )}

              {/* Active surface count */}
              <span style={{ marginLeft: "auto", fontSize: 9, color: "rgba(255,255,255,0.3)", alignSelf: "center" }}>
                {surfaces.length}/{maxSurfaces} surfaces
              </span>

              {!policy.canShowExternalMedia && (
                <span style={{ fontSize: 9, color: "#ff8888" }}>Upgrade to PRO+ to use media surfaces</span>
              )}
            </div>
          )}

          {/* SPONSORS TAB */}
          {tab === "sponsors" && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {sponsors.length === 0 && (
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>No sponsors linked yet.</span>
              )}
              {sponsors.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleSponsorPop(s)}
                  disabled={!policy.sponsorPopButton}
                  style={{
                    padding: "8px 14px", fontSize: 10, fontWeight: 900,
                    cursor: policy.sponsorPopButton ? "pointer" : "not-allowed",
                    background: `${s.primaryColor ?? "#00e5ff"}11`,
                    border: `1px solid ${s.primaryColor ?? "#00e5ff"}44`,
                    borderRadius: 8, color: s.primaryColor ?? "#00e5ff",
                    display: "flex", alignItems: "center", gap: 6,
                  }}
                >
                  {s.logoUrl && <img src={s.logoUrl} alt="" style={{ height: 16, objectFit: "contain" }} />}
                  {s.name}
                  <span style={{ fontSize: 9, opacity: 0.6 }}>▶ Pop</span>
                </button>
              ))}
              {sponsors.length > 1 && policy.sponsorPopButton && (
                <button
                  onClick={handleSponsorMultiPop}
                  style={{
                    padding: "8px 14px", fontSize: 10, fontWeight: 900, cursor: "pointer",
                    background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)",
                    borderRadius: 8, color: "#ffd700",
                  }}
                >
                  All Sponsors
                </button>
              )}
              {!policy.sponsorPopButton && (
                <span style={{ fontSize: 9, color: "#ff8888" }}>Upgrade to PRO to use sponsor pop</span>
              )}
            </div>
          )}

          {/* MEMORY TAB */}
          {tab === "memory" && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                Memory wall ({policy.memoryWallSlots === Infinity ? "∞" : policy.memoryWallSlots} slots) — select a photo to show audience
              </span>
              <button
                onClick={() => addSurface({ type: "image", src: fallbackImageUrl ?? "/images/default-cover.jpg", alt: "Album Art" }, "Album Art")}
                disabled={surfaces.length >= maxSurfaces}
                style={{
                  padding: "7px 14px", fontSize: 10, fontWeight: 800,
                  cursor: surfaces.length < maxSurfaces ? "pointer" : "not-allowed",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 8, color: "#fff",
                }}
              >
                🖼 Show Album Art
              </button>
            </div>
          )}

          {/* SETTINGS TAB */}
          {tab === "settings" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

              {/* Ritual trigger — the performer's deliberate weapon */}
              <div style={{
                background: ritualReady ? "rgba(255,215,0,0.06)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${ritualReady ? "rgba(255,215,0,0.3)" : "rgba(255,255,255,0.07)"}`,
                borderRadius: 10,
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.15em", color: ritualReady ? "#ffd700" : "rgba(255,255,255,0.25)", marginBottom: 3 }}>
                    RITUAL
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
                    {ritualFired
                      ? "sequence running — wait for the room"
                      : ritualReady
                        ? "room has earned it — trigger when the moment peaks"
                        : `cooldown — ${momentCount}/2 moments passed`}
                  </div>
                </div>
                <button
                  onClick={handleTriggerRitual}
                  disabled={!ritualReady || ritualFired}
                  style={{
                    padding: "8px 16px",
                    fontSize: 9,
                    fontWeight: 900,
                    letterSpacing: "0.15em",
                    cursor: ritualReady && !ritualFired ? "pointer" : "not-allowed",
                    background: ritualReady && !ritualFired ? "rgba(255,215,0,0.12)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${ritualReady && !ritualFired ? "rgba(255,215,0,0.5)" : "rgba(255,255,255,0.07)"}`,
                    borderRadius: 8,
                    color: ritualReady && !ritualFired ? "#ffd700" : "rgba(255,255,255,0.2)",
                    whiteSpace: "nowrap",
                    animation: ritualReady && !ritualFired ? "upgradePulse 2s ease-in-out infinite" : undefined,
                  }}
                >
                  👑 trigger
                </button>
              </div>

              {/* Other settings */}
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={showDirector}
                    onChange={e => setShowDirector(e.target.checked)}
                    style={{ accentColor: "#00e5ff" }}
                  />
                  <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, fontWeight: 700 }}>
                    Director Preview
                  </span>
                </label>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>
                  Tier: <span style={{ color: "#ffd700", fontWeight: 800 }}>{performerTier.toUpperCase()}</span>
                  {" · "}Chroma: <span style={{ color: policy.chromaHero ? "#00e5ff" : "#ff5555" }}>{policy.chromaHero ? "✓" : "✗"}</span>
                  {" · "}Analytics: <span style={{ color: "#ffd700" }}>{policy.analytics}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
