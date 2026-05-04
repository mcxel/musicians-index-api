"use client";

import { useEffect, useMemo, useState } from "react";
import { buildVenueSeatingMap } from "@/lib/venue/tmiVenueSeatEngine";
import HubAssetPortraitLayer from "@/components/avatar/HubAssetPortraitLayer";
import VenueAudienceShell from "@/components/venues/VenueAudienceShell";
import VenueBackstageShell from "@/components/venues/VenueBackstageShell";
import VenueBillboardSurface from "@/components/lobbies/VenueBillboardSurface";
import VenueHostShell from "@/components/venues/VenueHostShell";
import {
  subscribeLobbyFeed,
  getLobbyFeedSnapshot,
  type LobbyFeedState,
} from "@/lib/lobby/LobbyFeedBus";
import type { LobbyRuntimeState } from "@/lib/lobby/LobbyStateEngine";
import VenueLiveChatShell from "@/components/venues/VenueLiveChatShell";
import VenueSecurityShell from "@/components/venues/VenueSecurityShell";
import VenueSponsorShell from "@/components/venues/VenueSponsorShell";
import VenueStageShell from "@/components/venues/VenueStageShell";
import VenueTicketShell from "@/components/venues/VenueTicketShell";

const sponsorRotation = ["Beat Cola", "Mic Forge", "Neon Threads", "Pulse Cloud"];

type ZoneName = "vip" | "front" | "mid" | "rear";
const ZONE_CONFIG: { zone: ZoneName; label: string; color: string }[] = [
  { zone: "vip",   label: "VIP",   color: "#FFD700" },
  { zone: "front", label: "FRONT", color: "#FF2DAA" },
  { zone: "mid",   label: "MID",   color: "#00FFFF" },
  { zone: "rear",  label: "REAR",  color: "#AA2DFF" },
];

type VenueWorldShellProps = {
  slug: string;
  focus?: "world" | "stage" | "backstage" | "green-room" | "tickets";
};

function lobbyFeedToRuntimeState(feed: LobbyFeedState, countdown: number): LobbyRuntimeState {
  if (feed.status === "LIVE")        return "LIVE_SHOW";
  if (feed.status === "PRE-SHOW")    return "PRE_SHOW";
  if (feed.status === "QUEUE OPEN")  return "QUEUE_OPEN";
  if (countdown > 300) return "FREE_ROAM";
  if (countdown > 60)  return "PRE_SHOW";
  if (countdown > 0)   return "SEATING";
  return "POST_SHOW";
}

export default function VenueWorldShell({ slug, focus = "world" }: VenueWorldShellProps) {
  const [lobbyFeed, setLobbyFeed] = useState<LobbyFeedState>(() => getLobbyFeedSnapshot());
  const [occupiedSeats, setOccupiedSeats] = useState(128);
  const [reactions, setReactions] = useState(412);
  const [tipsTotal, setTipsTotal] = useState(765);
  const [hostPosition, setHostPosition] = useState("center");
  const [spotlightArtist, setSpotlightArtist] = useState("MC Charlie");
  const [sponsorIndex, setSponsorIndex] = useState(0);
  const [countdownSeconds, setCountdownSeconds] = useState(540);
  const [moderationState, setModerationState] = useState("clean");
  const [emergencyShutdown, setEmergencyShutdown] = useState(false);
  const [lastScan, setLastScan] = useState("");
  const [hostMode, setHostMode] = useState("intro");
  const [chatLog, setChatLog] = useState<string[]>([]);
  const [lineup, setLineup] = useState(["Nova K", "Ray Journey", "Zee Flux"]);
  const [safetyBlocks, setSafetyBlocks] = useState<string[]>([]);
  const [seatMap] = useState(() => buildVenueSeatingMap(slug, 8, 12));
  const [activeZones, setActiveZones] = useState<Set<ZoneName>>(() => new Set<ZoneName>(["vip", "front", "mid", "rear"]));
  const [inventory, setInventory] = useState([
    { id: "i1", name: "General Admission", qty: 200 },
    { id: "i2", name: "VIP Wristbands",    qty: 50  },
    { id: "i3", name: "Backstage Passes",  qty: 10  },
  ]);
  const [newInventoryItem, setNewInventoryItem] = useState("");

  const venueName = useMemo(
    () =>
      slug
        .split("-")
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(" "),
    [slug],
  );

  const zoneCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const seat of seatMap.seats) {
      if (seat.status !== "blocked") counts[seat.zone] = (counts[seat.zone] ?? 0) + 1;
    }
    return counts;
  }, [seatMap]);

  const sponsorAd = sponsorRotation[sponsorIndex];

  const rotateAd = () => setSponsorIndex((prev) => (prev + 1) % sponsorRotation.length);

  const moveBackstageArtistToStage = (artist: string) => {
    setSpotlightArtist(artist);
    setLineup((prev) => [artist, ...prev.filter((entry) => entry !== artist)]);
  };

  function toggleZone(zone: ZoneName) {
    setActiveZones(prev => {
      const next = new Set(prev);
      if (next.has(zone)) next.delete(zone); else next.add(zone);
      return next;
    });
  }

  function adjustInventory(id: string, delta: number) {
    setInventory(prev => prev.map(item => item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item));
  }

  function removeInventoryItem(id: string) {
    setInventory(prev => prev.filter(item => item.id !== id));
  }

  function addInventoryItem() {
    if (!newInventoryItem.trim()) return;
    setInventory(prev => [...prev, { id: `i${Date.now()}`, name: newInventoryItem.trim(), qty: 1 }]);
    setNewInventoryItem("");
  }

  const rootStyle = {
    minHeight: "100vh",
    background: "linear-gradient(165deg, #0a0812, #1f1534 48%, #080610)",
    padding: 20,
  } as const;

  useEffect(() => subscribeLobbyFeed(setLobbyFeed), []);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ source: string; reason: string }>).detail;
      if (!detail || detail.source !== "venue:world-chat") return;
      setSafetyBlocks((prev) => [detail.reason, ...prev].slice(0, 4));
    };
    window.addEventListener("tmi:safety-violation", handler as EventListener);
    return () => window.removeEventListener("tmi:safety-violation", handler as EventListener);
  }, []);

  return (
    <main style={rootStyle}>
      <header style={{ maxWidth: 1300, margin: "0 auto 14px", color: "#f3e9ff" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ color: "#9f7dd6", fontSize: 11, letterSpacing: 2 }}>Phase D Venue World</div>
            <h1 style={{ margin: "4px 0 6px", fontSize: 30 }}>{venueName}</h1>
            <p style={{ margin: 0, color: "#d7c6ef", fontSize: 13 }}>
              Focus mode: {focus} | Show countdown: {countdownSeconds}s
            </p>
          </div>
          <HubAssetPortraitLayer
            name={spotlightArtist}
            accent="#9f7dd6"
            variant="hero"
            state={hostMode === "intro" ? "speaking" : "live"}
            assetId={`asset-venue-${slug}`}
            hostId={`host-${slug}`}
          />
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 12, maxWidth: 1300, margin: "0 auto" }}>
        <div style={{ display: "grid", gap: 10 }}>
          <VenueBillboardSurface runtimeState={lobbyFeedToRuntimeState(lobbyFeed, countdownSeconds)} />
          <VenueStageShell
            hostPosition={hostPosition}
            spotlightArtist={spotlightArtist}
            onHostMove={setHostPosition}
            onSpotlightSwitch={setSpotlightArtist}
          />
          <VenueAudienceShell
            occupiedSeats={occupiedSeats}
            reactions={reactions}
            tipsTotal={tipsTotal}
            onSeatDelta={(delta) => setOccupiedSeats((prev) => Math.max(0, prev + delta))}
            onReaction={() => setReactions((prev) => prev + 1)}
            onTip={(amount) => setTipsTotal((prev) => prev + amount)}
          />
          <VenueBackstageShell lineup={lineup} onMoveToStage={moveBackstageArtistToStage} />
        </div>

        <aside style={{ display: "grid", gap: 10 }}>
          <VenueTicketShell lastScan={lastScan} onScan={setLastScan} />
          <VenueSponsorShell sponsorAd={sponsorAd} onRotateAd={rotateAd} />
          <VenueHostShell hostMode={hostMode} onHostMode={setHostMode} />
          <VenueSecurityShell
            moderationState={moderationState}
            emergencyShutdown={emergencyShutdown}
            onModeration={setModerationState}
            onEmergencyToggle={() => setEmergencyShutdown((prev) => !prev)}
          />
          <section style={{ borderRadius: 12, border: "1px solid #5a5f82", background: "#181d33", padding: 12 }}>
            <h3 style={{ margin: "0 0 8px", color: "#d7dcff" }}>Show Countdown</h3>
            <button
              onClick={() => setCountdownSeconds((prev) => Math.max(0, prev - 15))}
              style={{ borderRadius: 8, border: "1px solid #9da8de", background: "#2b3566", color: "#e0e6ff", padding: "6px 10px", cursor: "pointer", marginRight: 8 }}
            >
              Tick -15s
            </button>
            <button
              onClick={() => setCountdownSeconds((prev) => prev + 15)}
              style={{ borderRadius: 8, border: "1px solid #9da8de", background: "#2b3566", color: "#e0e6ff", padding: "6px 10px", cursor: "pointer" }}
            >
              Add +15s
            </button>
          </section>
          <VenueLiveChatShell
            moderationState={moderationState}
            sourceId="venue:world-chat"
            onMessage={(message) => setChatLog((prev) => [message, ...prev].slice(0, 6))}
          />
          {safetyBlocks.length > 0 ? (
            <section style={{ borderRadius: 12, border: "1px solid #7f1d1d", background: "#2a0e14", padding: 12 }}>
              <h3 style={{ margin: "0 0 8px", color: "#fecaca" }}>Teen Safety Blocks</h3>
              <div style={{ display: "grid", gap: 6 }}>
                {safetyBlocks.map((entry, index) => (
                  <div key={`${entry}-${index}`} style={{ borderRadius: 8, border: "1px solid #b91c1c", background: "#3f0f16", color: "#fecaca", fontSize: 12, padding: "6px 8px" }}>
                    {entry}
                  </div>
                ))}
              </div>
            </section>
          ) : null}
          <section style={{ borderRadius: 12, border: "1px solid #51627d", background: "#132033", padding: 12 }}>
            <h3 style={{ margin: "0 0 8px", color: "#cde5ff" }}>Recent Live Chat</h3>
            <div style={{ display: "grid", gap: 6 }}>
              {chatLog.length === 0 ? <div style={{ color: "#a8bdd8", fontSize: 12 }}>No messages yet.</div> : null}
              {chatLog.map((entry, index) => (
                <div key={`${entry}-${index}`} style={{ borderRadius: 8, border: "1px solid #6d86a8", background: "#0d1725", color: "#d4e8ff", padding: "6px 8px", fontSize: 12 }}>
                  {entry}
                </div>
              ))}
            </div>
          </section>

          {/* Seat Zones */}
          <section style={{ borderRadius: 12, border: "1px solid #3d4878", background: "#0e1330", padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <h3 style={{ margin: 0, color: "#d7dcff", fontSize: 13 }}>Seat Zones</h3>
              <span style={{ fontSize: 9, color: "#6b7280" }}>{seatMap.seats.filter(s => s.status !== "blocked").length} seats total</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {ZONE_CONFIG.map(({ zone, color, label }) => {
                const count = zoneCounts[zone] ?? 0;
                const active = activeZones.has(zone);
                return (
                  <button
                    key={zone}
                    onClick={() => toggleZone(zone)}
                    style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${active ? color : "#334155"}`, background: active ? `${color}18` : "transparent", color: active ? color : "#475569", cursor: "pointer", textAlign: "left" }}
                  >
                    <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em" }}>{label}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, marginTop: 2 }}>{count} seats</div>
                    <div style={{ fontSize: 8, marginTop: 2, opacity: 0.7 }}>{active ? "ACTIVE" : "DISABLED"}</div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Venue Inventory */}
          <section style={{ borderRadius: 12, border: "1px solid #3d5248", background: "#0e1f18", padding: 12 }}>
            <h3 style={{ margin: "0 0 10px", color: "#a7f3d0", fontSize: 13 }}>Venue Inventory</h3>
            <div style={{ display: "grid", gap: 6, marginBottom: 10 }}>
              {inventory.map(item => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 6, background: "#071610", borderRadius: 7, border: "1px solid #1e3f30", padding: "6px 8px" }}>
                  <span style={{ flex: 1, fontSize: 11, color: "#d1fae5" }}>{item.name}</span>
                  <button onClick={() => adjustInventory(item.id, -1)} style={{ width: 22, height: 22, borderRadius: 4, border: "1px solid #1e3f30", background: "transparent", color: "#6ee7b7", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                  <span style={{ color: "#a7f3d0", fontSize: 12, fontWeight: 700, minWidth: 28, textAlign: "center" }}>{item.qty}</span>
                  <button onClick={() => adjustInventory(item.id, 1)} style={{ width: 22, height: 22, borderRadius: 4, border: "1px solid #1e3f30", background: "transparent", color: "#6ee7b7", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                  <button onClick={() => removeInventoryItem(item.id)} style={{ width: 22, height: 22, borderRadius: 4, border: "1px solid #7f1d1d", background: "transparent", color: "#f87171", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <input
                value={newInventoryItem}
                onChange={e => setNewInventoryItem(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addInventoryItem()}
                placeholder="New item..."
                style={{ flex: 1, background: "#071610", border: "1px solid #1e3f30", borderRadius: 7, color: "#d1fae5", fontSize: 11, padding: "6px 8px" }}
              />
              <button
                onClick={addInventoryItem}
                style={{ borderRadius: 7, border: "1px solid #065f46", background: "#064e3b", color: "#6ee7b7", fontSize: 10, fontWeight: 700, padding: "6px 10px", cursor: "pointer" }}
              >
                ADD
              </button>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
