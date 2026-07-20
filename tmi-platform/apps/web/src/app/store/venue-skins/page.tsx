"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

/**
 * Real venue skin store — purchase (Stripe), season-pass unlock awareness,
 * and per-owner color customization with save. The skin visual/config data
 * (VENUE_SKINS) already existed; this page is the missing commerce layer.
 * Cheap, impulse-buy pricing per direction ("cheap as Fortnite skins").
 */

interface SkinConfig {
  id: string;
  name: string;
  description: string;
  backgroundImage: string;
  defaultColors: Record<string, string>;
  tags: string[];
}
interface OwnershipInfo {
  skinId: string;
  owned: boolean;
  customColors: Record<string, string> | null;
  priceCents: number;
  rarity: "common" | "rare" | "epic";
}

const RARITY_COLOR: Record<string, string> = { common: "#00FF88", rare: "#00FFFF", epic: "#FFD700" };
const COLOR_FIELDS = ["primary", "accent", "floor", "crowd", "ui", "glow", "text"] as const;

export default function VenueSkinStorePage() {
  const [skins, setSkins] = useState<SkinConfig[]>([]);
  const [ownership, setOwnership] = useState<Record<string, OwnershipInfo>>({});
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingSkin, setEditingSkin] = useState<string | null>(null);
  const [draftColors, setDraftColors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/venue-skins", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((d: { skins: SkinConfig[]; ownership: Record<string, OwnershipInfo>; authenticated: boolean }) => {
        setSkins(d.skins);
        setOwnership(d.ownership);
        setAuthenticated(d.authenticated);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const buy = async (skinId: string) => {
    setPurchasing(skinId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ product: "VENUE_SKIN", skinId }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) window.location.href = data.url;
      else alert(data.error ?? "Checkout failed");
    } finally {
      setPurchasing(null);
    }
  };

  const startEditing = (skin: SkinConfig, info?: OwnershipInfo) => {
    setEditingSkin(skin.id);
    setDraftColors(info?.customColors ?? skin.defaultColors);
  };

  const saveColors = async (skinId: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/venue-skins", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ skinId, customColors: draftColors }),
      });
      if (res.ok) {
        setEditingSkin(null);
        load();
      } else {
        const d = await res.json() as { error?: string };
        alert(d.error ?? "Save failed");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "52px 24px 32px" }}>
        <Link href="/store" style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textDecoration: "none", display: "inline-block", marginBottom: 20 }}>← Back to Store</Link>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#AA2DFF", fontWeight: 800, marginBottom: 10 }}>VENUE SKINS</div>
        <h1 style={{ fontSize: "clamp(1.8rem,4vw,3rem)", fontWeight: 900, margin: "0 0 12px" }}>Customize Your Venue.</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", maxWidth: 600, lineHeight: 1.7 }}>
          Buy a venue skin, then recolor it to make it yours — save your custom palette and it follows you into every live room.
          Included free with any active Season Pass.
        </p>
        {!authenticated && (
          <div style={{ marginTop: 16, fontSize: 11, color: "#FFD700", background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 8, padding: "10px 14px" }}>
            Sign in to purchase or customize venue skins.
          </div>
        )}
      </section>

      {loading ? (
        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", padding: 40 }}>Loading…</div>
      ) : (
        <section style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {skins.map((skin) => {
              const info = ownership[skin.id];
              const owned = info?.owned ?? false;
              const activeColors = info?.customColors ?? skin.defaultColors;
              const isEditing = editingSkin === skin.id;
              const rarity = info?.rarity ?? "common";

              return (
                <div key={skin.id} style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${activeColors.primary}30`, display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.02)" }}>
                  <div style={{ height: 90, background: `linear-gradient(135deg, ${activeColors.primary}22, ${activeColors.floor})`, position: "relative" }}>
                    {owned && (
                      <div style={{ position: "absolute", top: 10, right: 10, fontSize: 8, fontWeight: 900, color: "#050310", background: "#00FF88", borderRadius: 20, padding: "3px 8px" }}>OWNED</div>
                    )}
                    <div style={{ position: "absolute", top: 10, left: 10, fontSize: 8, fontWeight: 900, color: RARITY_COLOR[rarity], border: `1px solid ${RARITY_COLOR[rarity]}55`, borderRadius: 20, padding: "3px 8px", textTransform: "uppercase" }}>
                      {rarity}
                    </div>
                  </div>

                  <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 800 }}>{skin.name}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.5, flex: 1 }}>{skin.description}</div>

                    {isEditing ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
                        {COLOR_FIELDS.map((field) => (
                          <div key={field} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", textTransform: "capitalize" }}>{field}</span>
                            <input
                              type="color"
                              value={draftColors[field] ?? "#ffffff"}
                              onChange={(e) => setDraftColors((c) => ({ ...c, [field]: e.target.value }))}
                              style={{ width: 32, height: 22, border: "none", borderRadius: 4, cursor: "pointer", background: "none" }}
                            />
                          </div>
                        ))}
                        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                          <button onClick={() => saveColors(skin.id)} disabled={saving} style={{ flex: 1, padding: "8px 0", fontSize: 9, fontWeight: 900, background: "#00FF88", color: "#050310", border: "none", borderRadius: 6, cursor: saving ? "wait" : "pointer" }}>
                            {saving ? "SAVING…" : "SAVE COLORS"}
                          </button>
                          <button onClick={() => setEditingSkin(null)} style={{ padding: "8px 12px", fontSize: 9, fontWeight: 900, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", border: "none", borderRadius: 6, cursor: "pointer" }}>
                            CANCEL
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                        {owned ? (
                          <button onClick={() => startEditing(skin, info)} style={{ flex: 1, padding: "9px 0", fontSize: 9, fontWeight: 900, letterSpacing: "0.06em", background: "rgba(255,255,255,0.06)", color: "#fff", border: `1px solid ${activeColors.primary}55`, borderRadius: 6, cursor: "pointer" }}>
                            CUSTOMIZE COLORS
                          </button>
                        ) : (
                          <>
                            <div style={{ fontSize: 18, fontWeight: 900, color: RARITY_COLOR[rarity] }}>
                              ${((info?.priceCents ?? 499) / 100).toFixed(2)}
                            </div>
                            <button
                              onClick={() => buy(skin.id)}
                              disabled={!authenticated || purchasing === skin.id}
                              style={{ padding: "9px 18px", fontSize: 9, fontWeight: 900, letterSpacing: "0.06em", background: authenticated ? RARITY_COLOR[rarity] : "rgba(255,255,255,0.1)", color: "#050310", border: "none", borderRadius: 6, cursor: authenticated ? "pointer" : "not-allowed" }}
                            >
                              {purchasing === skin.id ? "…" : "BUY"}
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
