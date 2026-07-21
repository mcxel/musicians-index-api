"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  createDefaultYoPhoBlueprint,
  getPortraitEntitlement,
  type YoPhoPortraitBlueprint,
  type SubscriptionPortraitEntitlement,
} from "@/lib/yopho/YoPhoPortraitEngine";
import YoPhoPortraitStageCanvas from "@/components/yopho/YoPhoPortraitStageCanvas";

// Portrait editor is heavy — lazy load after auth resolves
const YoPhoPortraitEditorDrawer = dynamic(
  () => import("@/components/yopho/YoPhoPortraitEditorDrawer"),
  { ssr: false, loading: () => null }
);

// ── Palette ───────────────────────────────────────────────────────────────────
const BG      = "#050510";
const CYAN    = "#00FFFF";
const FUCHSIA = "#FF2DAA";
const GOLD    = "#FFD700";
const PURPLE  = "#AA2DFF";

interface SessionUser {
  id: string;
  name?: string;
  email: string;
  role: string;
  tier?: string;
}

// ── Tier badge colors ─────────────────────────────────────────────────────────
const TIER_COLORS: Record<string, string> = {
  FREE: "#888",
  PRO: "#00CCFF",
  RUBY: "#FF3366",
  SILVER: "#C0C0C0",
  GOLD: "#FFD700",
  PLATINUM: "#00FFC8",
  DIAMOND: "#AA2DFF",
};

export default function FanYoPhoCanvasPage() {
  const router = useRouter();
  const [user, setUser]                = useState<SessionUser | null>(null);
  const [loading, setLoading]          = useState(true);
  const [editorOpen, setEditorOpen]    = useState(false);
  const [blueprint, setBlueprint]      = useState<YoPhoPortraitBlueprint | null>(null);
  const [entitlement, setEntitlement]  = useState<SubscriptionPortraitEntitlement | null>(null);
  const [savedEditions, setSavedEditions] = useState<YoPhoPortraitBlueprint[]>([]);
  const [activeEditionIdx, setActiveEditionIdx] = useState(0);

  // ── Auth check ────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then((r) => r.json())
      .then((d: { authenticated?: boolean; user?: SessionUser }) => {
        if (!d.authenticated || !d.user) {
          router.replace("/auth");
          return;
        }
        if (d.user.role !== "FAN" && d.user.role !== "fan") {
          // Performers have their own canvas — redirect
          router.replace("/performer/canvas");
          return;
        }
        const tier = d.user.tier?.toUpperCase() ?? "FREE";
        setUser(d.user);
        const ent = getPortraitEntitlement(tier);
        setEntitlement(ent);

        // Load saved blueprints from localStorage
        try {
          const raw = localStorage.getItem("tmi_yopho_editions_fan");
          const parsed = raw ? (JSON.parse(raw) as YoPhoPortraitBlueprint[]) : [];
          if (parsed.length > 0) {
            setSavedEditions(parsed);
            setBlueprint(parsed[0]!);
          } else {
            const defaultBP = createDefaultYoPhoBlueprint("fan", d.user.name ?? d.user.email.split("@")[0] ?? "Fan");
            setSavedEditions([defaultBP]);
            setBlueprint(defaultBP);
          }
        } catch {
          const defaultBP = createDefaultYoPhoBlueprint("fan", d.user.name ?? "Fan");
          setSavedEditions([defaultBP]);
          setBlueprint(defaultBP);
        }

        setLoading(false);
      })
      .catch(() => router.replace("/auth"));
  }, [router]);

  // ── Save handler ──────────────────────────────────────────────────────────
  const handleSaveBlueprint = (saved: YoPhoPortraitBlueprint) => {
    setSavedEditions((prev) => {
      const updated = [...prev];
      updated[activeEditionIdx] = saved;
      try {
        localStorage.setItem("tmi_yopho_editions_fan", JSON.stringify(updated));
      } catch {/* quota */}
      return updated;
    });
    setBlueprint(saved);
    setEditorOpen(false);
  };

  // ── New edition ───────────────────────────────────────────────────────────
  const handleNewEdition = () => {
    if (!entitlement || !user) return;
    if (savedEditions.length >= entitlement.maxSavedEditions) return;
    const newBP = createDefaultYoPhoBlueprint("fan", user.name ?? user.email.split("@")[0] ?? "Fan");
    setSavedEditions((prev) => {
      const updated = [...prev, newBP];
      try { localStorage.setItem("tmi_yopho_editions_fan", JSON.stringify(updated)); } catch {/* */}
      return updated;
    });
    setActiveEditionIdx(savedEditions.length);
    setBlueprint(newBP);
    setEditorOpen(true);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: CYAN, fontSize: 13, fontWeight: 700, letterSpacing: "0.15em" }}>
          LOADING YOPHO STUDIO…
        </div>
      </div>
    );
  }

  if (!user || !blueprint || !entitlement) return null;

  const tier = user.tier?.toUpperCase() ?? "FREE";
  const tierColor = TIER_COLORS[tier] ?? "#888";
  const editionSlots = entitlement.maxSavedEditions;
  const canAddMore   = savedEditions.length < editionSlots;

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
          <Link href="/fan/dashboard" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: 11 }}>
            ← FAN HQ
          </Link>
          <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.15)" }} />
          <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.1em", color: "#fff" }}>
            🎭 YOPHO CANVAS
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
          {/* Edition count */}
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
            {savedEditions.length} / {editionSlots} EDITIONS
          </div>
        </div>
      </div>

      {/* ── HERO HEADER ───────────────────────────────────────────────────── */}
      <div
        style={{
          padding: "40px 24px 24px",
          background: `linear-gradient(180deg, rgba(170,45,255,0.12) 0%, transparent 100%)`,
          borderBottom: `1px solid ${PURPLE}33`,
          maxWidth: 1400,
          margin: "0 auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.2em",
                color: FUCHSIA,
                marginBottom: 8,
              }}
            >
              FAN EXCLUSIVE
            </div>
            <h1
              style={{
                fontSize: 32,
                fontWeight: 900,
                background: `linear-gradient(135deg, ${CYAN}, ${FUCHSIA})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              YOPHO PORTRAIT ENGINE
            </h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 8, maxWidth: 480 }}>
              Double exposure · Object masks · Hair edge refinement · Opposing poses · Multi-montage.
              Your identity, your art, your collection.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            {/* Open Editor button */}
            <button
              onClick={() => setEditorOpen(true)}
              style={{
                background: `linear-gradient(135deg, ${CYAN}22, ${FUCHSIA}22)`,
                border: `2px solid ${CYAN}`,
                borderRadius: 12,
                padding: "12px 24px",
                color: CYAN,
                fontSize: 12,
                fontWeight: 900,
                cursor: "pointer",
                letterSpacing: "0.08em",
              }}
            >
              ✏️ EDIT CURRENT EDITION
            </button>

            {/* New edition */}
            {canAddMore ? (
              <button
                onClick={handleNewEdition}
                style={{
                  background: `${FUCHSIA}22`,
                  border: `2px solid ${FUCHSIA}`,
                  borderRadius: 12,
                  padding: "12px 24px",
                  color: FUCHSIA,
                  fontSize: 12,
                  fontWeight: 900,
                  cursor: "pointer",
                  letterSpacing: "0.08em",
                }}
              >
                ＋ NEW EDITION
              </button>
            ) : (
              <Link
                href="/fan/settings?upgrade=true"
                style={{
                  background: `${GOLD}22`,
                  border: `2px solid ${GOLD}`,
                  borderRadius: 12,
                  padding: "12px 24px",
                  color: GOLD,
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: "0.08em",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                👑 UPGRADE FOR MORE
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 24px", display: "flex", gap: 32, flexWrap: "wrap" }}>

        {/* LEFT: Active Canvas Preview */}
        <div style={{ flex: "1 1 480px", minWidth: 320 }}>
          <div
            style={{
              background: "rgba(10,6,26,0.95)",
              border: `2px solid ${CYAN}33`,
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: `0 0 40px ${CYAN}18`,
            }}
          >
            {/* Canvas header */}
            <div
              style={{
                padding: "14px 20px",
                borderBottom: `1px solid rgba(255,255,255,0.08)`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(5,3,15,0.9)",
              }}
            >
              <div>
                <span style={{ fontSize: 11, fontWeight: 900, color: CYAN, letterSpacing: "0.1em" }}>
                  ACTIVE EDITION
                </span>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                  {blueprint.mode.replace(/_/g, " ").toUpperCase()} · {blueprint.texturePreset.replace(/_/g, " ").toUpperCase()}
                </div>
              </div>
              <button
                onClick={() => setEditorOpen(true)}
                style={{
                  background: `${CYAN}22`,
                  border: `1px solid ${CYAN}`,
                  borderRadius: 8,
                  padding: "6px 14px",
                  color: CYAN,
                  fontSize: 10,
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                ✏️ EDIT
              </button>
            </div>

            {/* Canvas stage preview */}
            <div style={{ padding: 20, background: "#030208" }}>
              <YoPhoPortraitStageCanvas
                blueprint={blueprint}
                width="100%"
                height={420}
                interactive={false}
              />
            </div>

            {/* Canvas metadata */}
            <div
              style={{
                padding: "14px 20px",
                borderTop: `1px solid rgba(255,255,255,0.06)`,
                display: "flex",
                gap: 20,
                background: "rgba(5,3,15,0.8)",
              }}
            >
              {[
                { label: "MODE", value: blueprint.mode.replace(/_/g, " ") },
                { label: "TEXTURE", value: blueprint.texturePreset.replace(/_/g, " ") },
                { label: "RESOLUTION", value: entitlement.maxResolution.toUpperCase() },
                { label: "ANIMATED", value: blueprint.isAnimated ? "YES" : "NO" },
              ].map((meta) => (
                <div key={meta.label}>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", marginBottom: 2, letterSpacing: "0.1em" }}>{meta.label}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#fff", textTransform: "uppercase" }}>{meta.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Saved Editions Gallery + Capabilities */}
        <div style={{ flex: "1 1 320px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Editions gallery */}
          <div
            style={{
              background: "rgba(10,6,26,0.95)",
              border: `1px solid rgba(255,255,255,0.1)`,
              borderRadius: 20,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "14px 20px",
                borderBottom: `1px solid rgba(255,255,255,0.08)`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 900, color: "#fff", letterSpacing: "0.1em" }}>
                MY EDITIONS
              </span>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>
                {savedEditions.length} / {editionSlots} SLOTS USED
              </span>
            </div>

            <div style={{ padding: 16, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {savedEditions.map((ed, idx) => (
                <button
                  key={ed.id}
                  onClick={() => { setActiveEditionIdx(idx); setBlueprint(ed); }}
                  style={{
                    position: "relative",
                    aspectRatio: "1",
                    borderRadius: 10,
                    background: idx === activeEditionIdx ? `${CYAN}22` : "rgba(255,255,255,0.04)",
                    border: idx === activeEditionIdx ? `2px solid ${CYAN}` : "1px solid rgba(255,255,255,0.1)",
                    cursor: "pointer",
                    overflow: "hidden",
                    padding: 0,
                  }}
                >
                  <div
                    style={{
                      inset: 0,
                      position: "absolute",
                      background: `linear-gradient(135deg, ${ed.colorPalette.primaryAccent}44, ${ed.colorPalette.secondaryAccent}44)`,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: "4px 6px",
                      background: "rgba(0,0,0,0.7)",
                      fontSize: 7,
                      color: "rgba(255,255,255,0.7)",
                      fontWeight: 700,
                      textAlign: "center",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {ed.mode.replace(/_/g, " ").toUpperCase()}
                  </div>
                  {idx === activeEditionIdx && (
                    <div
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: CYAN,
                        boxShadow: `0 0 6px ${CYAN}`,
                      }}
                    />
                  )}
                </button>
              ))}

              {/* Empty edition slots */}
              {Array.from({ length: Math.max(0, Math.min(6, editionSlots) - savedEditions.length) }).map((_, i) => (
                <button
                  key={`empty-${i}`}
                  onClick={canAddMore ? handleNewEdition : undefined}
                  style={{
                    aspectRatio: "1",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.02)",
                    border: "1px dashed rgba(255,255,255,0.15)",
                    cursor: canAddMore ? "pointer" : "default",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(255,255,255,0.25)",
                    fontSize: 18,
                  }}
                >
                  +
                </button>
              ))}
            </div>
          </div>

          {/* Tier capability summary */}
          <div
            style={{
              background: "rgba(10,6,26,0.95)",
              border: `1px solid rgba(255,255,255,0.1)`,
              borderRadius: 20,
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "14px 20px", borderBottom: `1px solid rgba(255,255,255,0.08)` }}>
              <span style={{ fontSize: 11, fontWeight: 900, color: "#fff", letterSpacing: "0.1em" }}>
                YOUR {tier} CAPABILITIES
              </span>
            </div>

            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Portrait Slots",     value: `${entitlement.maxActivePortraits} simultaneous`, ok: true },
                { label: "Saved Editions",     value: `${entitlement.maxSavedEditions} total`, ok: true },
                { label: "Double Exposure",    value: entitlement.allowDoubleExposure === true ? "Full Access" : entitlement.allowDoubleExposure === "preview" ? "Preview Only" : "Locked", ok: entitlement.allowDoubleExposure === true },
                { label: "Object Masks",       value: `${entitlement.objectMaskAccess.charAt(0).toUpperCase() + entitlement.objectMaskAccess.slice(1)} Access`, ok: entitlement.objectMaskAccess !== "basic" },
                { label: "Animated Comp.",     value: entitlement.allowAnimatedComposition === true ? "Full Access" : entitlement.allowAnimatedComposition === "limited" ? "Limited" : "Locked", ok: entitlement.allowAnimatedComposition !== false },
                { label: "Live Scene Placement", value: entitlement.liveScenePlacement === "none" ? "Locked" : entitlement.liveScenePlacement, ok: entitlement.liveScenePlacement !== "none" },
                { label: "Custom Masks",       value: entitlement.allowCustomMasks ? "Unlocked" : "Locked", ok: entitlement.allowCustomMasks },
                { label: "Export Resolution",  value: entitlement.maxResolution.toUpperCase(), ok: entitlement.maxResolution !== "standard" },
              ].map((cap) => (
                <div
                  key={cap.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 12px",
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>{cap.label}</span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: cap.ok ? "#00FF7F" : "rgba(255,255,255,0.3)",
                    }}
                  >
                    {cap.ok ? "✓ " : "✗ "}{cap.value}
                  </span>
                </div>
              ))}
            </div>

            {tier !== "DIAMOND" && (
              <div style={{ padding: "12px 16px", borderTop: `1px solid rgba(255,255,255,0.08)` }}>
                <Link
                  href="/fan/settings?upgrade=true"
                  style={{
                    display: "block",
                    textAlign: "center",
                    background: `linear-gradient(135deg, ${PURPLE}44, ${FUCHSIA}44)`,
                    border: `1px solid ${PURPLE}`,
                    borderRadius: 10,
                    padding: "10px",
                    color: PURPLE,
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: "0.1em",
                    textDecoration: "none",
                  }}
                >
                  👑 UNLOCK FULL PORTRAIT ENGINE
                </Link>
              </div>
            )}
          </div>

          {/* Share / export */}
          <div
            style={{
              background: "rgba(10,6,26,0.95)",
              border: `1px solid rgba(255,255,255,0.1)`,
              borderRadius: 20,
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 900, color: "#fff", letterSpacing: "0.1em", marginBottom: 4 }}>
              SHARE & DISPLAY
            </div>
            {[
              { label: "Set as Profile Portrait", icon: "👤", href: "/fan/profile" },
              { label: "Share to Memory Wall",    icon: "🧠", href: "/fan/memories" },
              { label: "Post to Fan Feed",         icon: "📢", href: "/fan/feed" },
              { label: "Download Edition",         icon: "⬇️",  href: "#download" },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 11,
                  fontWeight: 600,
                  textDecoration: "none",
                  transition: "background 0.15s",
                }}
              >
                <span>{action.icon}</span>
                <span>{action.label}</span>
                <span style={{ marginLeft: "auto", opacity: 0.4, fontSize: 10 }}>›</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── EDITOR OVERLAY ────────────────────────────────────────────────── */}
      {editorOpen && (
        <YoPhoPortraitEditorDrawer
          isOpen={editorOpen}
          onClose={() => setEditorOpen(false)}
          userRole="fan"
          userTier={tier}
          userName={user.name ?? user.email.split("@")[0] ?? "Fan"}
          initialBlueprint={blueprint}
          onSaveBlueprint={handleSaveBlueprint}
        />
      )}
    </div>
  );
}
