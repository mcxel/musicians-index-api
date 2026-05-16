"use client";

const VENUES = [
  { venueId: "neon-stage", name: "Neon Stage" },
  { venueId: "crown-theater", name: "Crown Theater" },
];

const CAMERA_TYPES = [
  { key: "stage", label: "Stage Cam", image: "/tmi-curated/venue-10.jpg", color: "#00FFFF" },
  { key: "crowd", label: "Crowd Cam", image: "/tmi-curated/venue-22.jpg", color: "#FF2DAA" },
  { key: "host", label: "Host Cam", image: "/tmi-curated/host-main.png", color: "#FFD700" },
  { key: "vip", label: "VIP Cam", image: "/tmi-curated/mag-58.jpg", color: "#AA2DFF" },
  { key: "lobby", label: "Lobby Cam", image: "/tmi-curated/home1.jpg", color: "#00FF88" },
];

export default function VenueMultiCamWall() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: 18 }}>
      <div style={{ maxWidth: 1500, margin: "0 auto", display: "grid", gap: 18 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.28em", color: "#00FF88", textTransform: "uppercase", fontWeight: 800 }}>Venue Multi-Cam Wall</div>
          <h1 style={{ margin: "6px 0 0", fontSize: 30 }}>Stage, crowd, host, VIP, and lobby camera monitoring</h1>
        </div>

        {VENUES.map((venue) => (
          <section key={venue.venueId} style={{ display: "grid", gap: 12 }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{venue.name}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
              {CAMERA_TYPES.map((camera) => (
                <article key={`${venue.venueId}-${camera.key}`} style={{ border: `1px solid ${camera.color}30`, borderRadius: 14, overflow: "hidden", background: "rgba(0,0,0,0.32)" }}>
                  <div style={{ aspectRatio: "16/9", backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.45)), url('${camera.image}')`, backgroundSize: "cover", backgroundPosition: "center" }} />
                  <div style={{ padding: 12, display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 800 }}>{camera.label}</div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.42)" }}>{venue.name}</div>
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 800, color: camera.color }}>LIVE</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}