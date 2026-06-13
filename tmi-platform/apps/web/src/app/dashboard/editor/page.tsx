"use client";
import { useState } from "react";
import Link from "next/link";

const ACCENT = "#A78BFA";

const CONTENT_BLOCKS = [
  { id: "hero1",      surface: "Home #1 Hero",        type: "BANNER",    status: "live",  text: "THE MUSICIAN'S INDEX — GO LIVE FREE",       cta: "JOIN THE PLATFORM", href: "/auth" },
  { id: "ticker1",    surface: "Home #1 Ticker",       type: "TICKER",    status: "live",  text: "🔴 LIVE · Beat Battles · Cyphers · Concerts · NFT Drops", cta: "", href: "" },
  { id: "billboard1", surface: "Live Lobby Billboard", type: "BILLBOARD", status: "live",  text: "TMI ARENA — Live Music · Real Audience",    cta: "WATCH NOW", href: "/live/rooms" },
  { id: "promo1",     surface: "Magazine Promo Strip", type: "PROMO",     status: "draft", text: "TMI MAGAZINE — Issue 1 Available Now",       cta: "READ NOW", href: "/magazine" },
  { id: "cta1",       surface: "Dashboard Upgrade CTA",type: "CTA",       status: "live",  text: "Unlock your full artist toolkit with Gold",  cta: "UPGRADE →", href: "/subscribe" },
  { id: "spotlight1", surface: "Homepage Artist Spot", type: "SPOTLIGHT", status: "live",  text: "This Week: Big KazhDog — #1 Artist",        cta: "VIEW PROFILE", href: "/performers" },
];

const TYPE_COLOR: Record<string, string> = { BANNER: "#FF2DAA", TICKER: "#00FFFF", BILLBOARD: "#FFD700", PROMO: "#AA2DFF", CTA: "#34D399", SPOTLIGHT: "#FF9500" };
const STATUS_COLOR: Record<string, string> = { live: "#34D399", draft: "#FFD700" };

export default function ContentEditorPage() {
  const [blocks, setBlocks] = useState(CONTENT_BLOCKS);
  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [toast, setToast] = useState("");

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  function startEdit(id: string, text: string) { setEditing(id); setEditText(text); }
  function saveEdit(id: string) {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, text: editText } : b));
    setEditing(null);
    showToast("Content updated ✓");
  }
  function toggleStatus(id: string) {
    setBlocks(prev => prev.map(b => {
      if (b.id !== id) return b;
      const next = b.status === "live" ? "draft" : "live";
      showToast(`Block set to ${next}`);
      return { ...b, status: next };
    }));
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ background: "rgba(0,0,0,0.85)", borderBottom: "1px solid rgba(167,139,250,0.25)", padding: "11px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.35em", color: ACCENT, fontWeight: 800 }}>ADMIN — CONTENT</div>
          <div style={{ fontSize: 14, fontWeight: 900 }}>✏️ Content Editor</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => showToast("Publishing all live blocks")} style={{ fontSize: 10, fontWeight: 800, color: "#000", background: ACCENT, border: "none", padding: "6px 16px", borderRadius: 6, cursor: "pointer" }}>PUBLISH ALL</button>
          <Link href="/dashboard/admin" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)", padding: "6px 12px", borderRadius: 6, textDecoration: "none", fontWeight: 700 }}>← Admin</Link>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px" }}>
        {toast && <div style={{ marginBottom: 14, padding: "10px 16px", background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.25)", borderRadius: 8, fontSize: 12, color: ACCENT }}>{toast}</div>}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {blocks.map(b => {
            const tc = TYPE_COLOR[b.type] ?? "#888";
            const sc = STATUS_COLOR[b.status] ?? "#888";
            const isEditing = editing === b.id;
            return (
              <div key={b.id} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${isEditing ? ACCENT + "40" : "rgba(255,255,255,0.06)"}`, borderRadius: 12, padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 9, fontWeight: 900, padding: "2px 8px", borderRadius: 6, background: `${tc}15`, color: tc }}>{b.type}</span>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{b.surface}</span>
                    <span style={{ fontSize: 9, fontWeight: 900, padding: "2px 8px", borderRadius: 6, background: `${sc}15`, color: sc }}>{b.status.toUpperCase()}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => toggleStatus(b.id)} style={{ padding: "5px 10px", fontSize: 9, fontWeight: 800, background: "transparent", border: `1px solid ${sc}35`, color: sc, borderRadius: 6, cursor: "pointer" }}>
                      {b.status === "live" ? "UNPUBLISH" : "PUBLISH"}
                    </button>
                    {!isEditing && (
                      <button onClick={() => startEdit(b.id, b.text)} style={{ padding: "5px 10px", fontSize: 9, fontWeight: 800, background: "transparent", border: `1px solid ${ACCENT}35`, color: ACCENT, borderRadius: 6, cursor: "pointer" }}>EDIT</button>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div>
                    <input value={editText} onChange={e => setEditText(e.target.value)} style={{ width: "100%", background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.3)", color: "#fff", padding: "9px 12px", borderRadius: 8, fontSize: 12, boxSizing: "border-box", marginBottom: 8 }} />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => saveEdit(b.id)} style={{ padding: "7px 16px", fontSize: 10, fontWeight: 800, background: ACCENT, color: "#000", borderRadius: 6, border: "none", cursor: "pointer" }}>SAVE</button>
                      <button onClick={() => setEditing(null)} style={{ padding: "7px 12px", fontSize: 10, fontWeight: 700, background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.4)", borderRadius: 6, cursor: "pointer" }}>CANCEL</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginBottom: b.cta ? 6 : 0 }}>{b.text}</div>
                    {b.cta && (
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
                        CTA: <span style={{ color: tc, fontWeight: 700 }}>{b.cta}</span>
                        {b.href && <> → <Link href={b.href} style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>{b.href}</Link></>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
          <Link href="/editorial" style={{ padding: "10px 20px", borderRadius: 8, background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)", color: ACCENT, fontWeight: 800, fontSize: 11, textDecoration: "none" }}>Editorial Desk</Link>
          <Link href="/magazine" style={{ padding: "10px 20px", borderRadius: 8, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", fontWeight: 700, fontSize: 11, textDecoration: "none" }}>Magazine</Link>
        </div>
      </div>
    </main>
  );
}
