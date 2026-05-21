import Link from "next/link";

export default function MediaPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#060410", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <div style={{ padding: "32px 24px 0" }}>
        <Link href="/home/1" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← HOME</Link>
      </div>
      <div style={{ maxWidth: 860, margin: "40px auto", padding: "0 24px" }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#00FFFF", textTransform: "uppercase", marginBottom: 8 }}>TMI MEDIA</div>
        <h1 style={{ fontSize: "clamp(24px,5vw,40px)", fontWeight: 900, margin: "0 0 12px" }}>Media Center</h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: "0 0 32px", lineHeight: 1.6 }}>Browse clips, shows, beats, and editorial content from the TMI platform.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 12, marginBottom: 32 }}>
          {[
            { title: "Clips",      desc: "Short video clips & highlights",  href: "/clips",         icon: "📱", color: "#FF2DAA" },
            { title: "Shows",      desc: "Live & replay performances",       href: "/shows",         icon: "🎬", color: "#00FFFF" },
            { title: "Beats",      desc: "Producer beat library",            href: "/beats",         icon: "🎵", color: "#FFD700" },
            { title: "Magazine",   desc: "Editorial & music culture",        href: "/magazine",      icon: "📰", color: "#A855F7" },
            { title: "Upload",     desc: "Submit your content to TMI",       href: "/media/upload",  icon: "⬆️", color: "#00FFAA" },
            { title: "Library",    desc: "Your uploaded media",              href: "/media/library", icon: "📂", color: "#ff6b35" },
          ].map((item) => (
            <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
              <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${item.color}28`, borderRadius: 14, padding: "20px", transition: "border-color 0.2s" }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{item.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: item.color, marginBottom: 5 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/shows" style={{ fontSize: 11, color: "#00FFFF", textDecoration: "none" }}>Shows →</Link>
          <Link href="/clips" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Clips →</Link>
          <Link href="/beats" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Beats →</Link>
        </div>
      </div>
    </main>
  );
}
