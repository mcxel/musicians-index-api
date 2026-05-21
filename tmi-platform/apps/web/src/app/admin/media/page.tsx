import Link from "next/link";

const SEED_MEDIA = [
  { id: "m1", title: "BXRN OUT — Cypher 2026",    type: "Video", size: "248 MB", uploader: "artist_bxrn", status: "Approved", date: "May 18" },
  { id: "m2", title: "Beat Vol. 22 Showcase",     type: "Audio", size: "12 MB",  uploader: "producer_lxrd", status: "Approved", date: "May 17" },
  { id: "m3", title: "Spring Cypher Highlights",  type: "Video", size: "502 MB", uploader: "admin",        status: "Approved", date: "May 16" },
  { id: "m4", title: "Freestyle Friday #44 Reel", type: "Clip",  size: "84 MB",  uploader: "fan_042",      status: "Review",   date: "May 20" },
  { id: "m5", title: "Magazine Cover Art May",    type: "Image", size: "4.1 MB", uploader: "editorial",    status: "Approved", date: "May 15" },
  { id: "m6", title: "DJ Mix — Trap Zone Live",   type: "Audio", size: "67 MB",  uploader: "dj_sunrize",   status: "Review",   date: "May 20" },
];

const TYPE_ICONS: Record<string, string> = { Video: "🎬", Audio: "🎵", Clip: "📱", Image: "🖼️" };
const STATUS_COLORS: Record<string, string> = { Approved: "#00FFAA", Review: "#FFD700" };

export default function AdminMediaPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-6 py-10">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#ff6b35", textTransform: "uppercase", marginBottom: 4 }}>ADMIN</div>
          <h1 className="text-3xl font-bold text-[#ff6b35]">Media Library</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{SEED_MEDIA.length} assets · {SEED_MEDIA.filter(m => m.status === "Review").length} pending review</p>
        </div>
        <Link href="/media/upload" style={{ padding: "9px 18px", background: "#ff6b35", color: "#fff", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>Upload Media →</Link>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {SEED_MEDIA.map((m) => (
          <div key={m.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 18px", display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ fontSize: 24 }}>{TYPE_ICONS[m.type] ?? "📄"}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 3 }}>{m.title}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{m.type} · {m.size} · by {m.uploader} · {m.date}</div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: STATUS_COLORS[m.status] ?? "rgba(255,255,255,0.3)", padding: "3px 10px", border: `1px solid ${STATUS_COLORS[m.status] ?? "rgba(255,255,255,0.1)"}`, borderRadius: 20 }}>{m.status}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
        <Link href="/admin" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Admin</Link>
        <Link href="/media/library" style={{ fontSize: 12, color: "#ff6b35", textDecoration: "none" }}>Media Library →</Link>
      </div>
    </main>
  );
}
