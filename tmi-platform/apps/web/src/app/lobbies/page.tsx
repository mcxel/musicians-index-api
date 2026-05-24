"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { LOBBY_ITEMS, formatPrice, getCheckoutUrl, type StoreItem } from "@/lib/store/StoreItemEngine";

const LOBBY_ROOMS = [
  { slug: "arena-east",       title: "Arena East",       mode: "arena",   count: 214, hot: true  },
  { slug: "vip-neon-lounge",  title: "VIP Neon Lounge",  mode: "lobby",   count: 87,  hot: false },
  { slug: "cypher-drop",      title: "Cypher Drop",      mode: "cypher",  count: 342, hot: true  },
  { slug: "producer-lab",     title: "Producer Lab",     mode: "producer",count: 56,  hot: false },
  { slug: "battle-zone",      title: "Battle Zone",      mode: "battle",  count: 189, hot: true  },
  { slug: "listening-party",  title: "Listening Party",  mode: "lobby",   count: 73,  hot: false },
  { slug: "monthly-idol",     title: "Monthly Idol",     mode: "gameshow",count: 5841,hot: true  },
  { slug: "test-room",        title: "Open Room",        mode: "lobby",   count: 12,  hot: false },
];

const MODE_COLORS: Record<string, { accent: string; glow: string; icon: string }> = {
  arena:    { accent: "#FF2DAA", glow: "rgba(255,45,170,0.35)",   icon: "🏟️" },
  lobby:    { accent: "#FFD700", glow: "rgba(255,215,0,0.3)",     icon: "🎪" },
  cypher:   { accent: "#00FFFF", glow: "rgba(0,255,255,0.3)",     icon: "🎤" },
  producer: { accent: "#AA2DFF", glow: "rgba(170,45,255,0.35)",   icon: "🎛️" },
  battle:   { accent: "#FF6600", glow: "rgba(255,102,0,0.3)",     icon: "⚔️" },
  gameshow: { accent: "#FFD700", glow: "rgba(255,215,0,0.4)",     icon: "🎬" },
};

// Skin previews
const SKIN_PREVIEWS: Record<string, { bg: string; accent: string; particles: string[] }> = {
  "lobby-neon":       { bg: "linear-gradient(135deg,#0d0028,#00001a)", accent: "#AA2DFF", particles: ["💡","⚡","✨"] },
  "lobby-cinema":     { bg: "linear-gradient(135deg,#0a0000,#1a0005)", accent: "#FF2DAA", particles: ["🎬","🍿","🎞️"] },
  "lobby-futuristic": { bg: "linear-gradient(135deg,#000818,#001428)", accent: "#00FFFF", particles: ["🚀","⭐","🛸"] },
  "lobby-cypher":     { bg: "linear-gradient(135deg,#0a0800,#100600)", accent: "#FFD700", particles: ["🎙️","🔥","💨"] },
  "lobby-chill":      { bg: "linear-gradient(135deg,#0a0500,#0d0800)", accent: "#FF9500", particles: ["🛋️","☕","🌙"] },
};

export default function LobbiesPage() {
  const [activeTab, setActiveTab] = useState<"rooms" | "skins">("rooms");
  const [activeSkin, setActiveSkin] = useState("lobby-neon");
  const [previewSkin, setPreviewSkin] = useState<string | null>(null);
  const [ownedSkins] = useState<Set<string>>(new Set(["lobby-neon"]));

  const displayedSkin = previewSkin ?? activeSkin;
  const preview = SKIN_PREVIEWS[displayedSkin];

  return (
    <main style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at 50% 80%, #0d0020 0%, #03020b 60%)",
      color: "#fff",
      fontFamily: "'Inter', system-ui, sans-serif",
      padding: "28px 24px 100px",
    }}>
      {/* Header */}
      <div style={{ maxWidth: 1200, margin: "0 auto 24px" }}>
        <p style={{ fontSize: 10, letterSpacing: "0.24em", color: "#FF2DAA", textTransform: "uppercase", fontWeight: 800, marginBottom: 8 }}>
          The Musician&apos;s Index
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
          <h1 style={{ fontSize: "clamp(24px,4vw,42px)", fontWeight: 900, letterSpacing: "0.06em", margin: 0, textTransform: "uppercase", color: "#fff" }}>
            Live Lobbies
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 999, background: "rgba(255,45,170,0.12)", border: "1px solid rgba(255,45,170,0.35)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF2DAA", display: "inline-block" }} />
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: "#FF2DAA" }}>LIVE NOW</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 0 }}>
          {[{ v: "rooms", l: "Live Rooms" }, { v: "skins", l: "Lobby Skins" }].map(tab => (
            <button key={tab.v} onClick={() => setActiveTab(tab.v as "rooms" | "skins")}
              style={{ padding: "10px 18px", background: "none", border: "none", borderBottom: `2px solid ${activeTab === tab.v ? "#FF2DAA" : "transparent"}`, cursor: "pointer", fontSize: 12, fontWeight: 700, color: activeTab === tab.v ? "#FF2DAA" : "rgba(255,255,255,0.4)", marginBottom: -1 }}>
              {tab.l}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "rooms" && (
          <motion.div key="rooms" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {LOBBY_ROOMS.map((room) => {
              const colors = MODE_COLORS[room.mode] ?? MODE_COLORS.lobby!;
              return (
                <Link key={room.slug} href={`/lobbies/${room.slug}`} style={{ textDecoration: "none" }}>
                  <motion.div whileHover={{ y: -4, boxShadow: `0 12px 40px ${colors.glow}` }} transition={{ duration: 0.2 }}
                    style={{ position: "relative", borderRadius: 16, border: `1px solid ${colors.accent}44`, background: `linear-gradient(135deg, rgba(10,5,25,0.95), rgba(5,3,14,0.98))`, padding: "20px 20px 16px", overflow: "hidden", cursor: "pointer" }}>
                    <div style={{ position: "absolute", top: 0, right: 0, width: 120, height: 120, background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`, borderRadius: "50%", transform: "translate(30%,-30%)", pointerEvents: "none" }} />
                    {room.hot && (
                      <div style={{ position: "absolute", top: 12, right: 12, padding: "3px 9px", borderRadius: 999, background: colors.accent + "22", border: `1px solid ${colors.accent}55`, fontSize: 9, fontWeight: 900, color: colors.accent }}>
                        🔥 HOT
                      </div>
                    )}
                    <div style={{ fontSize: 28, marginBottom: 10 }}>{colors.icon}</div>
                    <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.16em", color: colors.accent, textTransform: "uppercase", marginBottom: 6 }}>{room.mode.toUpperCase()}</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", marginBottom: 12 }}>{room.title}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 2, width: `${Math.min(100, (room.count / 6000) * 100)}%`, background: `linear-gradient(to right, ${colors.accent}, ${colors.accent}88)` }} />
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.55)" }}>{room.count.toLocaleString()}</div>
                    </div>
                    <div style={{ marginTop: 14, padding: "8px 14px", borderRadius: 8, background: `${colors.accent}18`, border: `1px solid ${colors.accent}44`, textAlign: "center", fontSize: 11, fontWeight: 900, color: colors.accent }}>
                      Enter Room →
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </motion.div>
        )}

        {activeTab === "skins" && (
          <motion.div key="skins" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
              {/* Skins Grid */}
              <div>
                <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em", marginBottom: 16 }}>
                  CHOOSE YOUR LOBBY SKIN
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
                  {LOBBY_ITEMS.map((item: StoreItem) => {
                    const owned = ownedSkins.has(item.id);
                    const active = activeSkin === item.id;
                    const skinPreview = SKIN_PREVIEWS[item.id];
                    return (
                      <motion.div key={item.id}
                        whileHover={{ y: -3 }}
                        onMouseEnter={() => setPreviewSkin(item.id)}
                        onMouseLeave={() => setPreviewSkin(null)}
                        style={{ borderRadius: 14, border: `2px solid ${active ? "#00FF88" : owned ? "rgba(0,255,136,0.25)" : "rgba(255,255,255,0.1)"}`, overflow: "hidden", cursor: "pointer" }}>
                        {/* Preview strip */}
                        <div style={{ height: 80, background: skinPreview?.bg ?? "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 24 }}>
                          {(skinPreview?.particles ?? ["✨"]).map((p, i) => <span key={i}>{p}</span>)}
                        </div>
                        <div style={{ padding: "14px 14px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                            <div style={{ fontSize: 13, fontWeight: 800 }}>{item.name}</div>
                            {item.badge && <span style={{ fontSize: 8, fontWeight: 900, padding: "2px 6px", borderRadius: 3, background: "rgba(255,215,0,0.15)", color: "#FFD700" }}>{item.badge}</span>}
                          </div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 12, lineHeight: 1.4 }}>{item.description}</div>
                          <div style={{ display: "flex", gap: 6 }}>
                            {active ? (
                              <div style={{ flex: 1, padding: "8px", textAlign: "center", background: "rgba(0,255,136,0.12)", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 7, fontSize: 11, fontWeight: 700, color: "#00FF88" }}>
                                ✓ Active
                              </div>
                            ) : owned ? (
                              <button onClick={() => setActiveSkin(item.id)}
                                style={{ flex: 1, padding: "8px", background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.25)", borderRadius: 7, color: "#00FF88", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>
                                Apply Skin
                              </button>
                            ) : (
                              <Link href={getCheckoutUrl(item)}
                                style={{ flex: 1, padding: "8px", background: "linear-gradient(135deg,#FF2DAA,#AA2DFF)", borderRadius: 7, color: "#fff", fontWeight: 800, fontSize: 11, textDecoration: "none", textAlign: "center" }}>
                                Buy {formatPrice(item.price)}
                              </Link>
                            )}
                            <button onClick={() => setPreviewSkin(item.id === previewSkin ? null : item.id)}
                              style={{ padding: "8px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, color: "rgba(255,255,255,0.5)", fontSize: 11, cursor: "pointer" }}>
                              Preview
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Live Preview Panel */}
              <div style={{ position: "sticky", top: 24 }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em", marginBottom: 14 }}>LIVE PREVIEW</div>
                <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div style={{ height: 160, background: preview?.bg ?? "rgba(255,255,255,0.03)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <div style={{ fontSize: 40 }}>{preview?.particles[0] ?? "🎪"}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: preview?.accent ?? "#fff", letterSpacing: "0.12em" }}>
                      {LOBBY_ITEMS.find(i => i.id === displayedSkin)?.name ?? "Default Lobby"}
                    </div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.03)", padding: "16px 16px" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                      {LOBBY_ITEMS.find(i => i.id === displayedSkin)?.name}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, marginBottom: 12 }}>
                      {LOBBY_ITEMS.find(i => i.id === displayedSkin)?.description}
                    </div>
                    {!ownedSkins.has(displayedSkin) && (
                      <Link href={getCheckoutUrl(LOBBY_ITEMS.find(i => i.id === displayedSkin) ?? LOBBY_ITEMS[0]!)}
                        style={{ display: "block", padding: "10px", background: "linear-gradient(135deg,#FF2DAA,#AA2DFF)", borderRadius: 8, color: "#fff", fontWeight: 800, fontSize: 12, textDecoration: "none", textAlign: "center" }}>
                        Buy Skin — {formatPrice(LOBBY_ITEMS.find(i => i.id === displayedSkin)?.price ?? 0)}
                      </Link>
                    )}
                    {ownedSkins.has(displayedSkin) && activeSkin !== displayedSkin && (
                      <button onClick={() => setActiveSkin(displayedSkin)}
                        style={{ width: "100%", padding: "10px", background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 8, color: "#00FF88", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                        Apply This Skin
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
