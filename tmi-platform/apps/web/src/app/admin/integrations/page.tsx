import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Integrations | TMI Admin" };

const INTEGRATIONS = [
  { name: "Stripe",         purpose: "Payments, payouts, subscriptions",         status: "CONNECTED", icon: "💳", color: "#00FF88", env: "STRIPE_SECRET_KEY" },
  { name: "Supabase",       purpose: "Database, auth, realtime subscriptions",    status: "CONNECTED", icon: "🟢", color: "#00FF88", env: "DATABASE_URL" },
  { name: "Mux",            purpose: "Video streaming infrastructure",            status: "PENDING",   icon: "📹", color: "#FFD700", env: "MUX_TOKEN_ID" },
  { name: "Agora",          purpose: "Real-time audio/video for rooms",           status: "PENDING",   icon: "🎙️", color: "#FFD700", env: "AGORA_APP_ID" },
  { name: "Resend",         purpose: "Transactional email (receipts, alerts)",    status: "CONNECTED", icon: "📧", color: "#00FFFF", env: "RESEND_API_KEY" },
  { name: "Cloudinary",     purpose: "Media uploads and image optimization",      status: "PENDING",   icon: "🖼️", color: "#FF9500", env: "CLOUDINARY_URL" },
  { name: "Pusher",         purpose: "WebSocket fallback for real-time events",   status: "PENDING",   icon: "⚡", color: "#AA2DFF", env: "PUSHER_APP_ID" },
];

const STATUS_COLOR: Record<string, string> = {
  CONNECTED: "#00FF88", PENDING: "#FFD700", ERROR: "#FF2DAA",
};

export default function AdminIntegrationsPage() {
  const connected = INTEGRATIONS.filter(i => i.status === "CONNECTED").length;

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
        <Link href="/admin" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← ADMIN</Link>
        <h1 style={{ fontSize: 24, fontWeight: 900, marginTop: 20, marginBottom: 4 }}>Integrations</h1>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 32 }}>
          Third-party service connections. Set env keys in Vercel or .env to activate pending integrations.
        </p>

        <div style={{ display: "flex", gap: 20, marginBottom: 36, flexWrap: "wrap" }}>
          <div style={{ background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 12, padding: "16px 24px" }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#00FF88" }}>{connected}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", fontWeight: 700 }}>CONNECTED</div>
          </div>
          <div style={{ background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 12, padding: "16px 24px" }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#FFD700" }}>{INTEGRATIONS.length - connected}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", fontWeight: 700 }}>PENDING</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {INTEGRATIONS.map(integration => (
            <div key={integration.name} style={{ display: "flex", gap: 16, alignItems: "center", background: "rgba(255,255,255,0.02)", border: `1px solid ${integration.color}14`, borderRadius: 12, padding: "18px 22px", flexWrap: "wrap" }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>{integration.icon}</span>
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 3 }}>{integration.name}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{integration.purpose}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", marginBottom: 4, letterSpacing: "0.08em" }}>{integration.env}</div>
                <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: STATUS_COLOR[integration.status] }}>
                  {integration.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 28, padding: "20px 24px", background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.15)", borderRadius: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#FFD700", marginBottom: 8 }}>PENDING INTEGRATIONS</div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
            Mux, Agora, Cloudinary, and Pusher require env keys to be set in Vercel (or .env.local for dev).
            These are Copilot / infrastructure tasks. Set the keys and redeploy to activate.
          </p>
        </div>
      </div>
    </main>
  );
}
