import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

const ROLE_HUB: Record<string, string> = {
  ARTIST:     "/hub/artist",
  PERFORMER:  "/hub/performer",
  FAN:        "/hub/fan",
  USER:       "/hub/fan",
  SPONSOR:    "/hub/sponsor",
  ADVERTISER: "/hub/advertiser",
  VENUE:      "/hub/venue",
  ADMIN:      "/admin",
  STAFF:      "/admin",
};

const HUB_LINKS = [
  { label: "Fan Hub",        href: "/hub/fan",        color: "#FF2DAA", icon: "🎵" },
  { label: "Artist Hub",     href: "/hub/artist",     color: "#00FFFF", icon: "🎤" },
  { label: "Performer Hub",  href: "/hub/performer",  color: "#AA2DFF", icon: "🎭" },
  { label: "Sponsor Hub",    href: "/hub/sponsor",    color: "#FFD700", icon: "🤝" },
  { label: "Advertiser Hub", href: "/hub/advertiser", color: "#FFA500", icon: "📢" },
  { label: "Venue Hub",      href: "/hub/venue",      color: "#22c55e", icon: "🏟️" },
  { label: "Admin",          href: "/admin",      color: "#94a3b8", icon: "⚙️" },
];

export const dynamic = "force-dynamic";

export default async function HubRouterPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("tmi_role")?.value?.toUpperCase();
  const session = cookieStore.get("tmi_session")?.value;

  // Redirect authenticated users to their hub
  if (session && role && ROLE_HUB[role]) {
    redirect(ROLE_HUB[role]);
  }

  // Unauthenticated — show the hub directory wall
  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "40px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>

        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.3em", color: "#00FFFF", textTransform: "uppercase", margin: "0 0 8px" }}>
            The Musician&apos;s Index
          </p>
          <h1 style={{ fontSize: "clamp(28px,5vw,48px)", fontWeight: 900, margin: "0 0 10px", letterSpacing: "-0.02em" }}>
            TMI Hub Directory
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", margin: 0 }}>
            Sign in to be routed directly to your hub, or select one below.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 36 }}>
          {HUB_LINKS.map((hub) => (
            <Link
              key={hub.href}
              href={hub.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "18px 20px",
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${hub.color}30`,
                borderRadius: 12,
                textDecoration: "none",
                color: "#fff",
                transition: "border-color 0.15s",
              }}
            >
              <span style={{ fontSize: 24 }}>{hub.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: hub.color }}>{hub.label}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>Enter →</div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 24, display: "flex", gap: 12 }}>
          <Link
            href="/auth"
            style={{
              padding: "12px 28px", borderRadius: 8, fontSize: 13, fontWeight: 800,
              background: "linear-gradient(135deg,#00FFFF,#AA2DFF)", color: "#05060c",
              textDecoration: "none", letterSpacing: "0.05em",
            }}
          >
            Sign In / Register
          </Link>
          <Link
            href="/home/1"
            style={{
              padding: "12px 28px", borderRadius: 8, fontSize: 13, fontWeight: 700,
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.7)", textDecoration: "none",
            }}
          >
            ← Home
          </Link>
        </div>
      </div>
    </main>
  );
}
