import Link from "next/link";

const SEED_ARTICLES = [
  { id: "art1", title: "Nova Cipher: The 8-Streak Story", author: "TMI Staff", section: "Artist Feature", status: "published", date: "May 15, 2026" },
  { id: "art2", title: "TMI Season 2 Preview", author: "Editor Malik", section: "Magazine", status: "published", date: "May 10, 2026" },
  { id: "art3", title: "AI in Live Music", author: "Tech Desk", section: "News", status: "draft", date: "May 18, 2026" },
  { id: "art4", title: "Cypher Culture Deep Dive", author: "Community", section: "Culture", status: "review", date: "May 19, 2026" },
];

const ST_COLOR: Record<string, string> = { published: "#22c55e", draft: "#FFD700", review: "#00FFFF" };

export default function AdminEditorialPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <Link href="/admin" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Admin</Link>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28, gap: 16, flexWrap: "wrap" as const }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 5, color: "#00FFFF", fontWeight: 800, marginBottom: 4 }}>ADMIN · EDITORIAL</div>
            <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: 0 }}>Editorial Manager</h1>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/writers/submit" style={{ padding: "9px 18px", borderRadius: 8, background: "#00FFFF", color: "#05060c", fontSize: 12, fontWeight: 800, textDecoration: "none" }}>New Article</Link>
            <Link href="/magazine" style={{ padding: "9px 18px", borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>View Magazine</Link>
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 140px 80px 100px 80px", padding: "10px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>
            <span>Title</span><span>Author</span><span>Section</span><span>Status</span><span>Date</span><span>Action</span>
          </div>
          {SEED_ARTICLES.map((a) => (
            <div key={a.id} style={{ display: "grid", gridTemplateColumns: "1fr 120px 140px 80px 100px 80px", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center", fontSize: 12 }}>
              <span style={{ fontWeight: 700 }}>{a.title}</span>
              <span style={{ color: "rgba(255,255,255,0.45)" }}>{a.author}</span>
              <span style={{ color: "rgba(255,255,255,0.45)" }}>{a.section}</span>
              <span style={{ fontSize: 9, fontWeight: 800, color: ST_COLOR[a.status], letterSpacing: "0.1em", textTransform: "uppercase" as const }}>{a.status}</span>
              <span style={{ color: "rgba(255,255,255,0.35)" }}>{a.date}</span>
              <Link href={`/articles/${a.id}`} style={{ fontSize: 10, color: "#00FFFF", textDecoration: "none", fontWeight: 700 }}>Edit →</Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}