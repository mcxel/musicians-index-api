import Link from "next/link";

const showcaseCards = [
  { title: "Street Champion", tags: "Neon Mic | Arena Stage | Wave" },
  { title: "Studio Architect", tags: "Laptop Rig | Studio Alley | Idle" },
  { title: "Royal Headliner", tags: "Crown + Chain | Night Pulse | Champion" },
];

export default function AvatarShowcasePage() {
  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(165deg, #090412, #1a1030 45%, #080510)", padding: 20 }}>
      <section style={{ maxWidth: 1000, margin: "0 auto", border: "1px solid #5d3f86", borderRadius: 18, background: "#140c21", padding: 20 }}>
        <div style={{ color: "#9f7dd6", fontSize: 11, letterSpacing: 2 }}>Phase C1</div>
        <h1 style={{ color: "#f6eeff", margin: "4px 0 10px", fontSize: 30 }}>Avatar Showcase</h1>
        <p style={{ color: "#d3c3ea", marginTop: 0, fontSize: 14 }}>Saved presentation cards for live room identity and sponsor previews.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
          {showcaseCards.map((card) => (
            <article key={card.title} style={{ borderRadius: 12, border: "1px solid #6a4b96", background: "#1a1029", padding: 12 }}>
              <h2 style={{ margin: "0 0 6px", color: "#f3eaff", fontSize: 16 }}>{card.title}</h2>
              <p style={{ margin: 0, color: "#ccb7e8", fontSize: 12 }}>{card.tags}</p>
            </article>
          ))}
        </div>
        <div style={{ marginTop: 14 }}>
          <Link href="/avatar/build" style={{ color: "#bde7ff", textDecoration: "underline" }}>
            Back to Avatar Build
          </Link>
        </div>
      </section>
    </main>
  );
}
