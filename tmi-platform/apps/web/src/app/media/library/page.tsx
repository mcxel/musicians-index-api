import Link from "next/link";

const SEED_LIBRARY = [
  { id: "l1", name: "Cypher Session — May 18",     type: "Video", size: "248 MB", date: "May 18", status: "Public" },
  { id: "l2", name: "Beat Pack Vol. 3",             type: "Audio", size: "34 MB",  date: "May 12", status: "Public" },
  { id: "l3", name: "Profile Photo — Spring 26",   type: "Image", size: "2.1 MB", date: "May 10", status: "Public" },
  { id: "l4", name: "Freestyle Practice #7",        type: "Video", size: "112 MB", date: "May 8",  status: "Private" },
  { id: "l5", name: "Cover Art — EP 'Dusk Wave'",  type: "Image", size: "1.8 MB", date: "May 3",  status: "Public" },
];

const TYPE_ICONS: Record<string, string> = { Video: "🎬", Audio: "🎵", Image: "🖼️" };
const STATUS_COLORS: Record<string, string> = { Public: "#00FFAA", Private: "rgba(255,255,255,0.3)" };

export default function MediaLibraryPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#060410", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <div style={{ padding: "32px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/media" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← MEDIA</Link>
        <Link href="/media/upload" style={{ fontSize: 11, fontWeight: 700, color: "#00FFCF", textDecoration: "none" }}>Upload New →</Link>
      </div>
      <div style={{ maxWidth: 720, margin: "40px auto", padding: "0 24px" }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#00FFFF", textTransform: "uppercase", marginBottom: 8 }}>MEDIA</div>
        <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 6px" }}>My Library</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "0 0 28px" }}>{SEED_LIBRARY.length} files uploaded</p>

        <div style={{ display: "grid", gap: 10 }}>
          {SEED_LIBRARY.map((f) => (
            <div key={f.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 18px", display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ fontSize: 22 }}>{TYPE_ICONS[f.type] ?? "📄"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 3 }}>{f.name}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{f.type} · {f.size} · {f.date}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: STATUS_COLORS[f.status] ?? "#fff", padding: "3px 10px", border: `1px solid ${STATUS_COLORS[f.status] ?? "rgba(255,255,255,0.1)"}`, borderRadius: 20 }}>{f.status}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
