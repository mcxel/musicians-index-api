"use client";
import { useState } from "react";
import Link from "next/link";

const ACCENT = "#38BDF8";

type MediaType = "IMAGE" | "VIDEO" | "AUDIO" | "BEAT";

interface MediaItem { id: string; name: string; type: MediaType; size: string; used: number; url: string; uploaded: string; }

const MEDIA: MediaItem[] = [
  { id: "m1",  name: "tmi-og-image.jpg",        type: "IMAGE", size: "248KB", used: 14, url: "/og-image.jpg",            uploaded: "May 28" },
  { id: "m2",  name: "home1-hero-bg.jpg",        type: "IMAGE", size: "1.2MB", used: 3,  url: "/assets/home1-hero.jpg",   uploaded: "May 30" },
  { id: "m3",  name: "battle-arena-bg.mp4",      type: "VIDEO", size: "14MB",  used: 2,  url: "/assets/arena.mp4",        uploaded: "Jun 1"  },
  { id: "m4",  name: "lobby-ambient.mp4",        type: "VIDEO", size: "8MB",   used: 1,  url: "/assets/lobby.mp4",        uploaded: "Jun 2"  },
  { id: "m5",  name: "night-protocol.mp3",       type: "BEAT",  size: "6.8MB", used: 892,url: "/beats/night-protocol.mp3",uploaded: "Jun 3"  },
  { id: "m6",  name: "pressure-wave.mp3",        type: "BEAT",  size: "5.4MB", used: 641,url: "/beats/pressure-wave.mp3", uploaded: "Jun 4"  },
  { id: "m7",  name: "tmi-logo-white.svg",       type: "IMAGE", size: "12KB",  used: 89, url: "/assets/logo-white.svg",   uploaded: "May 15" },
  { id: "m8",  name: "cypher-stage-bg.jpg",      type: "IMAGE", size: "890KB", used: 6,  url: "/assets/cypher-bg.jpg",    uploaded: "Jun 1"  },
  { id: "m9",  name: "magazine-cover-01.jpg",    type: "IMAGE", size: "620KB", used: 1,  url: "/assets/mag-cover-01.jpg", uploaded: "Jun 5"  },
  { id: "m10", name: "storm-season.mp3",         type: "BEAT",  size: "7.1MB", used: 512,url: "/beats/storm-season.mp3",  uploaded: "Jun 4"  },
];

const TYPE_COLOR: Record<MediaType, string> = { IMAGE: "#38BDF8", VIDEO: "#AA2DFF", AUDIO: "#00FF88", BEAT: "#FFD700" };
const TYPE_ICON: Record<MediaType, string>  = { IMAGE: "🖼️", VIDEO: "🎬", AUDIO: "🎵", BEAT: "🎹" };

export default function MediaDashboardPage() {
  const [filter, setFilter] = useState<"all" | MediaType>("all");
  const [toast, setToast] = useState("");

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  const visible = filter === "all" ? MEDIA : MEDIA.filter(m => m.type === filter);
  const totalSize = "47.2MB";

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ background: "rgba(0,0,0,0.85)", borderBottom: "1px solid rgba(56,189,248,0.25)", padding: "11px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.35em", color: ACCENT, fontWeight: 800 }}>ADMIN — MEDIA</div>
          <div style={{ fontSize: 14, fontWeight: 900 }}>🗂️ Media Library · {totalSize} used</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/beats/submit" style={{ fontSize: 10, fontWeight: 800, color: "#000", background: ACCENT, padding: "6px 16px", borderRadius: 6, textDecoration: "none", display: "inline-block" }}>+ UPLOAD</Link>
          <Link href="/dashboard/admin" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)", padding: "6px 12px", borderRadius: 6, textDecoration: "none", fontWeight: 700 }}>← Admin</Link>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px" }}>
        {/* Type summary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
          {(["IMAGE", "VIDEO", "BEAT", "AUDIO"] as const).map(t => {
            const count = MEDIA.filter(m => m.type === t).length;
            const tc = TYPE_COLOR[t];
            return (
              <div key={t} onClick={() => setFilter(t)} style={{ background: filter === t ? `${tc}15` : "rgba(255,255,255,0.02)", border: `1px solid ${filter === t ? tc + "40" : "rgba(255,255,255,0.06)"}`, borderRadius: 10, padding: "12px 14px", cursor: "pointer" }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{TYPE_ICON[t]}</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: tc }}>{count}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>{t}S</div>
              </div>
            );
          })}
        </div>

        {toast && <div style={{ marginBottom: 14, padding: "10px 16px", background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: 8, fontSize: 12, color: ACCENT }}>{toast}</div>}

        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {(["all", "IMAGE", "VIDEO", "BEAT", "AUDIO"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f as "all" | MediaType)} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 10, fontWeight: 800, cursor: "pointer", border: "none", background: filter === f ? ACCENT : "rgba(255,255,255,0.07)", color: filter === f ? "#000" : "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>{f}</button>
          ))}
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          {visible.map(m => {
            const tc = TYPE_COLOR[m.type];
            return (
              <div key={m.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 18px", display: "grid", gridTemplateColumns: "auto 1fr auto auto auto", gap: 14, alignItems: "center" }}>
                <span style={{ fontSize: 20 }}>{TYPE_ICON[m.type]}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 12 }}>{m.name}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                    <span style={{ color: tc, fontWeight: 700 }}>{m.type}</span> · {m.size} · Uploaded {m.uploaded}
                  </div>
                </div>
                <div style={{ textAlign: "right", minWidth: 60 }}>
                  <div style={{ fontSize: 11, fontWeight: 700 }}>{m.used.toLocaleString()}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>uses</div>
                </div>
                <button onClick={() => { navigator.clipboard.writeText(m.url).catch(() => {}); showToast(`Copied: ${m.url}`); }} style={{ padding: "5px 10px", fontSize: 9, fontWeight: 800, background: "transparent", border: "1px solid rgba(56,189,248,0.25)", color: ACCENT, borderRadius: 6, cursor: "pointer" }}>COPY URL</button>
                <button onClick={() => showToast(`Deleted: ${m.name}`)} style={{ padding: "5px 10px", fontSize: 9, fontWeight: 800, background: "transparent", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444", borderRadius: 6, cursor: "pointer" }}>DELETE</button>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
