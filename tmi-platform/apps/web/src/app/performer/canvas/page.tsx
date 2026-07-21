"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import YoPhoLivingCanvasOS from "@/components/yopho/YoPhoLivingCanvasOS";
import {
  YOPHO_SKIN_CATALOG,
  type YoPhoSkin,
} from "@/lib/yopho/YoPhoSkinRegistry";

// ── Palette ───────────────────────────────────────────────────────────────────
const BG      = "#050510";
const CYAN    = "#00FFFF";
const FUCHSIA = "#FF2DAA";
const GOLD    = "#FFD700";
const PURPLE  = "#AA2DFF";
const GREEN   = "#00FF7F";

interface SessionUser {
  id: string;
  name?: string;
  email: string;
  role: string;
  tier?: string;
  image?: string | null;
  profileSlug?: string;
}

type Tab = "canvas" | "skins" | "hotspots" | "analytics" | "settings";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "canvas",    label: "LIVE CANVAS",  icon: "🎬" },
  { id: "skins",     label: "SKIN SHOP",    icon: "🎨" },
  { id: "hotspots",  label: "HOTSPOTS",     icon: "📍" },
  { id: "analytics", label: "ANALYTICS",    icon: "📊" },
  { id: "settings",  label: "SETTINGS",     icon: "⚙️" },
];

const TIER_COLORS: Record<string, string> = {
  FREE: "#888", PRO: "#00CCFF", RUBY: "#FF3366",
  SILVER: "#C0C0C0", GOLD: "#FFD700", PLATINUM: "#00FFC8", DIAMOND: "#AA2DFF",
};

// ── Fake analytics seed (replaced by real data when analytics API exists) ─────
const CANVAS_ANALYTICS = [
  { label: "Canvas Views",     value: "—",   unit: "today",     icon: "👁️" },
  { label: "Avg Time on Page", value: "—",   unit: "per visit", icon: "⏱️" },
  { label: "Hotspot Clicks",   value: "—",   unit: "total",     icon: "📍" },
  { label: "Skin Purchases",   value: "—",   unit: "from canvas",icon: "💰" },
];

export default function PerformerYoPhoCanvasPage() {
  const router = useRouter();
  const [user, setUser]           = useState<SessionUser | null>(null);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("canvas");
  const [activeSkin, setActiveSkin] = useState<YoPhoSkin>(YOPHO_SKIN_CATALOG[0]!);

  // Hotspot enable/disable state (persisted locally)
  const [hotspotEnabled, setHotspotEnabled] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem("tmi_canvas_hotspots");
      return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
    } catch { return {}; }
  });

  const [canvasPublished, setCanvasPublished] = useState(true);
  const [showLiveBadge, setShowLiveBadge]     = useState(false);
  const [saveStatus, setSaveStatus]            = useState<string | null>(null);

  // ── Auth check ────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then((r) => r.json())
      .then((d: { authenticated?: boolean; user?: SessionUser }) => {
        if (!d.authenticated || !d.user) { router.replace("/auth"); return; }
        const role = d.user.role?.toUpperCase();
        if (role !== "PERFORMER" && role !== "BAND") {
          // Fans have their own canvas page
          router.replace("/fan/canvas");
          return;
        }
        setUser(d.user);
        setLoading(false);
      })
      .catch(() => router.replace("/auth"));
  }, [router]);

  const handleToggleHotspot = (id: string) => {
    setHotspotEnabled((prev) => {
      const updated = { ...prev, [id]: !(prev[id] ?? true) };
      try { localStorage.setItem("tmi_canvas_hotspots", JSON.stringify(updated)); } catch {/* */}
      return updated;
    });
  };

  const handleSaveSettings = () => {
    setSaveStatus("Settings saved!");
    setTimeout(() => setSaveStatus(null), 2500);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: CYAN, fontSize: 13, fontWeight: 700, letterSpacing: "0.15em" }}>
          LOADING LIVING CANVAS…
        </div>
      </div>
    );
  }

  if (!user) return null;

  const tier      = user.tier?.toUpperCase() ?? "FREE";
  const tierColor = TIER_COLORS[tier] ?? "#888";
  const slug      = user.profileSlug ?? user.email.split("@")[0] ?? "performer";
  const name      = user.name ?? slug;

  // Active skin's hotspots merged with enabled state
  const hotspots = activeSkin.hotspots.map((h) => ({
    ...h,
    enabled: hotspotEnabled[h.id] ?? true,
  }));

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        fontFamily: "'Inter', sans-serif",
        color: "#fff",
        overflowX: "hidden",
      }}
    >
      {/* ── TOP NAV BAR ────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(5,5,16,0.97)",
          borderBottom: `1px solid ${CYAN}33`,
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/performer/dashboard" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: 11 }}>
            ← STUDIO
          </Link>
          <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.15)" }} />
          <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.1em", color: "#fff" }}>
            🏠 LIVING CANVAS OS
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Published state toggle */}
          <button
            onClick={() => setCanvasPublished((p) => !p)}
            style={{
              background: canvasPublished ? `${GREEN}22` : "rgba(255,255,255,0.08)",
              border: `1px solid ${canvasPublished ? GREEN : "rgba(255,255,255,0.2)"}`,
              borderRadius: 20,
              padding: "4px 14px",
              fontSize: 10,
              fontWeight: 900,
              color: canvasPublished ? GREEN : "rgba(255,255,255,0.5)",
              cursor: "pointer",
              letterSpacing: "0.1em",
            }}
          >
            {canvasPublished ? "● PUBLISHED" : "○ HIDDEN"}
          </button>

          {/* View public canvas */}
          <Link
            href={`/performers/${slug}`}
            target="_blank"
            style={{
              background: `${CYAN}22`,
              border: `1px solid ${CYAN}44`,
              borderRadius: 8,
              padding: "6px 14px",
              color: CYAN,
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.08em",
              textDecoration: "none",
            }}
          >
            🔗 VIEW PUBLIC
          </Link>

          {/* Tier badge */}
          <div
            style={{
              background: `${tierColor}22`,
              border: `1px solid ${tierColor}`,
              borderRadius: 20,
              padding: "3px 12px",
              fontSize: 9,
              fontWeight: 900,
              color: tierColor,
              letterSpacing: "0.12em",
            }}
          >
            {tier}
          </div>
        </div>
      </div>

      {/* ── TAB RAIL ──────────────────────────────────────────────────────── */}
      <div
        style={{
          borderBottom: `1px solid rgba(255,255,255,0.08)`,
          background: "rgba(8,5,20,0.95)",
          display: "flex",
          padding: "0 24px",
          overflow: "auto",
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "14px 20px",
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.1em",
              color: activeTab === tab.id ? CYAN : "rgba(255,255,255,0.45)",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === tab.id ? `2px solid ${CYAN}` : "2px solid transparent",
              cursor: "pointer",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── TAB: LIVE CANVAS ───────────────────────────────────────────────── */}
      {activeTab === "canvas" && (
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 24px" }}>
          {/* Hero intro */}
          <div style={{ marginBottom: 24 }}>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 900,
                background: `linear-gradient(135deg, ${CYAN}, ${FUCHSIA})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                margin: "0 0 8px",
              }}
            >
              {name}&apos;s Living Canvas
            </h1>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: 0 }}>
              Your interactive stage — click hotspots to preview, manage content from the tabs above.
            </p>
          </div>

          {/* Canvas OS component — full-width */}
          <YoPhoLivingCanvasOS
            performerName={name}
            performerSlug={slug}
            performerImageUrl={user.image ?? undefined}
          />

          {/* Instructional callouts */}
          <div
            style={{
              marginTop: 20,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
            }}
          >
            {[
              { icon: "🎵", label: "Studio Monitors", desc: "Click to preview your playlist in the canvas" },
              { icon: "📺", label: "Smart TV Screen", desc: "Connects to your latest music videos" },
              { icon: "🏆", label: "Trophy Shelf",    desc: "Shows your current ranking & achievements" },
              { icon: "🛒", label: "Merch Display",   desc: "Links to your store — toggle from Hotspots tab" },
              { icon: "🚪", label: "Live Stage Door", desc: "Takes fans directly to your live room" },
              { icon: "🎨", label: "Skin Marketplace","desc": "Customize your room from the Skins tab" },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  padding: "12px 14px",
                }}
              >
                <div style={{ fontSize: 16, marginBottom: 4 }}>{item.icon}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{item.label}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: SKIN SHOP ─────────────────────────────────────────────────── */}
      {activeTab === "skins" && (
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 24px" }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: "0 0 6px" }}>🎨 Skin Marketplace</h2>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: 0 }}>
              Upgrade your living canvas room environment. Each skin includes custom ambient video, sounds, and hotspot themes.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 20,
            }}
          >
            {YOPHO_SKIN_CATALOG.map((skin) => {
              const owned   = skin.priceUsd === 0 || activeSkin.id === skin.id;
              const isActive = activeSkin.id === skin.id;

              return (
                <div
                  key={skin.id}
                  style={{
                    background: "rgba(10,6,26,0.95)",
                    border: isActive ? `2px solid ${skin.accentColor}` : "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 16,
                    overflow: "hidden",
                    boxShadow: isActive ? `0 0 24px ${skin.accentColor}44` : "none",
                  }}
                >
                  {/* Skin preview header */}
                  <div
                    style={{
                      height: 120,
                      background: `linear-gradient(135deg, ${skin.accentColor}33, ${skin.secondaryColor}33)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    {skin.fallbackImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={skin.fallbackImageUrl}
                        alt={skin.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.6 }}
                      />
                    ) : (
                      <div style={{ fontSize: 40 }}>🎬</div>
                    )}
                    {isActive && (
                      <div
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          background: skin.accentColor,
                          color: "#000",
                          fontSize: 8,
                          fontWeight: 900,
                          padding: "3px 8px",
                          borderRadius: 10,
                          letterSpacing: "0.1em",
                        }}
                      >
                        ACTIVE
                      </div>
                    )}
                  </div>

                  <div style={{ padding: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: "#fff", marginBottom: 4 }}>{skin.name}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", marginBottom: 12 }}>{skin.tagline}</div>

                    {/* Hotspot count */}
                    <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                      {[
                        { label: `${skin.hotspots.length} Hotspots` },
                        { label: `${skin.ambientSound.charAt(0).toUpperCase() + skin.ambientSound.slice(1)} Audio` },
                        { label: skin.category.charAt(0).toUpperCase() + skin.category.slice(1) },
                      ].map((tag) => (
                        <span
                          key={tag.label}
                          style={{
                            fontSize: 8,
                            fontWeight: 700,
                            color: skin.accentColor,
                            background: `${skin.accentColor}18`,
                            border: `1px solid ${skin.accentColor}44`,
                            borderRadius: 6,
                            padding: "2px 8px",
                          }}
                        >
                          {tag.label}
                        </span>
                      ))}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 16, fontWeight: 900, color: skin.priceUsd === 0 ? GREEN : GOLD }}>
                        {skin.priceUsd === 0 ? "FREE" : `$${skin.priceUsd.toFixed(2)}`}
                      </div>

                      <button
                        onClick={() => setActiveSkin(skin)}
                        style={{
                          background: isActive
                            ? "rgba(255,255,255,0.05)"
                            : owned
                            ? `${GREEN}22`
                            : `${GOLD}22`,
                          border: `1px solid ${isActive ? "rgba(255,255,255,0.2)" : owned ? GREEN : GOLD}`,
                          borderRadius: 8,
                          padding: "7px 18px",
                          color: isActive ? "rgba(255,255,255,0.5)" : owned ? GREEN : GOLD,
                          fontSize: 10,
                          fontWeight: 900,
                          cursor: isActive ? "default" : "pointer",
                          letterSpacing: "0.06em",
                        }}
                        disabled={isActive}
                      >
                        {isActive ? "✓ ACTIVE" : owned ? "ACTIVATE" : "BUY & ACTIVATE"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB: HOTSPOTS ──────────────────────────────────────────────────── */}
      {activeTab === "hotspots" && (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: "0 0 6px" }}>📍 Canvas Hotspots</h2>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: 0 }}>
              Control which interactive hotspots appear on your canvas. Disabled hotspots are hidden from fans.
              Currently showing hotspots for: <strong style={{ color: CYAN }}>{activeSkin.name}</strong>
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {hotspots.map((h) => (
              <div
                key={h.id}
                style={{
                  background: "rgba(10,6,26,0.95)",
                  border: `1px solid ${h.enabled ? CYAN + "44" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 14,
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  opacity: h.enabled ? 1 : 0.45,
                  transition: "opacity 0.2s",
                }}
              >
                <span style={{ fontSize: 24 }}>{h.icon}</span>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{h.name}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>{h.description}</div>
                  <div
                    style={{
                      display: "inline-block",
                      fontSize: 8,
                      fontWeight: 900,
                      letterSpacing: "0.1em",
                      color: FUCHSIA,
                      background: `${FUCHSIA}18`,
                      border: `1px solid ${FUCHSIA}33`,
                      borderRadius: 6,
                      padding: "1px 8px",
                      marginTop: 6,
                    }}
                  >
                    {h.actionType.toUpperCase()}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <button
                    onClick={() => handleToggleHotspot(h.id)}
                    style={{
                      background: h.enabled ? `${GREEN}22` : "rgba(255,255,255,0.05)",
                      border: `2px solid ${h.enabled ? GREEN : "rgba(255,255,255,0.2)"}`,
                      borderRadius: 20,
                      padding: "5px 16px",
                      color: h.enabled ? GREEN : "rgba(255,255,255,0.3)",
                      fontSize: 10,
                      fontWeight: 900,
                      cursor: "pointer",
                      minWidth: 80,
                    }}
                  >
                    {h.enabled ? "● ON" : "○ OFF"}
                  </button>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>
                    {Math.round(h.xPercent)}%, {Math.round(h.yPercent)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: ANALYTICS ─────────────────────────────────────────────────── */}
      {activeTab === "analytics" && (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: "0 0 6px" }}>📊 Canvas Analytics</h2>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: 0 }}>
              Track how fans interact with your living canvas. Analytics populate once your canvas receives real visitor traffic.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
            {CANVAS_ANALYTICS.map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: "rgba(10,6,26,0.95)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 16,
                  padding: 20,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: CYAN, marginBottom: 4 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{stat.label}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{stat.unit}</div>
              </div>
            ))}
          </div>

          <div
            style={{
              background: "rgba(10,6,26,0.95)",
              border: `1px solid ${CYAN}22`,
              borderRadius: 16,
              padding: 24,
              textAlign: "center",
              color: "rgba(255,255,255,0.4)",
              fontSize: 12,
            }}
          >
            📈 Full analytics dashboard coming after canvas receives visitor traffic.
            Share your canvas link to start collecting data:
            <div style={{ marginTop: 12 }}>
              <code
                style={{
                  background: "rgba(0,229,255,0.1)",
                  border: `1px solid ${CYAN}44`,
                  borderRadius: 8,
                  padding: "6px 14px",
                  fontSize: 11,
                  color: CYAN,
                  fontFamily: "monospace",
                }}
              >
                themusiciansindex.com/performers/{slug}
              </code>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: SETTINGS ──────────────────────────────────────────────────── */}
      {activeTab === "settings" && (
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 24px" }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: "0 0 6px" }}>⚙️ Canvas Settings</h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Canvas visibility */}
            <div
              style={{
                background: "rgba(10,6,26,0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 16,
                padding: 20,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 900, color: "#fff", marginBottom: 4 }}>Canvas Visibility</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginBottom: 16 }}>
                When hidden, visitors see your standard profile instead of the living canvas.
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {["Published", "Hidden"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setCanvasPublished(opt === "Published")}
                    style={{
                      padding: "8px 20px",
                      borderRadius: 10,
                      background:
                        (opt === "Published" && canvasPublished) || (opt === "Hidden" && !canvasPublished)
                          ? (opt === "Published" ? `${GREEN}22` : "rgba(255,255,255,0.1)")
                          : "transparent",
                      border: `1px solid ${(opt === "Published" && canvasPublished) ? GREEN : (opt === "Hidden" && !canvasPublished) ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.15)"}`,
                      color: (opt === "Published" && canvasPublished) ? GREEN : (opt === "Hidden" && !canvasPublished) ? "#fff" : "rgba(255,255,255,0.4)",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Live badge */}
            <div
              style={{
                background: "rgba(10,6,26,0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 16,
                padding: 20,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: "#fff", marginBottom: 4 }}>Show LIVE Badge</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
                    Display a LIVE badge on your canvas when you are broadcasting.
                  </div>
                </div>
                <button
                  onClick={() => setShowLiveBadge((p) => !p)}
                  style={{
                    width: 44,
                    height: 24,
                    borderRadius: 12,
                    background: showLiveBadge ? FUCHSIA : "rgba(255,255,255,0.1)",
                    border: "none",
                    cursor: "pointer",
                    position: "relative",
                    flexShrink: 0,
                    transition: "background 0.2s",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 3,
                      left: showLiveBadge ? 22 : 3,
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: "#fff",
                      transition: "left 0.2s",
                    }}
                  />
                </button>
              </div>
            </div>

            {/* Canvas permalink */}
            <div
              style={{
                background: "rgba(10,6,26,0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 16,
                padding: 20,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 900, color: "#fff", marginBottom: 4 }}>Canvas Permalink</div>
              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  fontSize: 11,
                  color: CYAN,
                  fontFamily: "monospace",
                  wordBreak: "break-all",
                }}
              >
                themusiciansindex.com/performers/{slug}
              </div>
            </div>

            {/* Save button */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              {saveStatus && (
                <div
                  style={{
                    background: `${GREEN}22`,
                    border: `1px solid ${GREEN}`,
                    borderRadius: 8,
                    padding: "10px 16px",
                    color: GREEN,
                    fontSize: 11,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  ✓ {saveStatus}
                </div>
              )}
              <button
                onClick={handleSaveSettings}
                style={{
                  background: `linear-gradient(135deg, ${CYAN}22, ${FUCHSIA}22)`,
                  border: `2px solid ${CYAN}`,
                  borderRadius: 12,
                  padding: "12px 28px",
                  color: CYAN,
                  fontSize: 12,
                  fontWeight: 900,
                  cursor: "pointer",
                  letterSpacing: "0.08em",
                }}
              >
                SAVE SETTINGS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
