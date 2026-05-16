import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Platform Status | TMI",
  description: "Current activation status for TMI launch systems.",
};

const STATUS_ITEMS = [
  { area: "Homepages 1-5", status: "LIVE PREVIEW", detail: "Public investor preview enabled." },
  { area: "Magazine", status: "PARTIAL", detail: "Rendering live; issue automation in progress." },
  { area: "Messaging", status: "SOFT LIVE", detail: "Inbox and thread shells available." },
  { area: "Auth", status: "PARTIAL", detail: "Core routes active; role hardening in progress." },
  { area: "Payments", status: "PARTIAL", detail: "Surfaces visible; production Stripe mapping in progress." },
  { area: "Booking", status: "PARTIAL", detail: "Core routes and UI live; full data pipeline in progress." },
  { area: "Admin", status: "PARTIAL", detail: "Dashboards available; full observability in progress." },
  { area: "Bots", status: "PARTIAL", detail: "Registry and duties available; full automation in progress." },
];

const BADGE_COLOR: Record<string, string> = {
  "LIVE PREVIEW": "#00f6a5",
  "SOFT LIVE": "#71f4ff",
  PARTIAL: "#ffd166",
};

export default function PlatformStatusPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0e0a1a 0%, #030306 90%)",
        color: "#fff",
        padding: "30px 20px 56px",
      }}
    >
      <section style={{ maxWidth: 980, margin: "0 auto" }}>
        <h1 style={{ margin: "0 0 8px", fontSize: 34 }}>Platform Status</h1>
        <p style={{ marginTop: 0, color: "rgba(255,255,255,0.8)" }}>
          Live build activation board for investor previews and launch sequencing.
        </p>

        <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
          {STATUS_ITEMS.map((item) => (
            <article
              key={item.area}
              style={{
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: 12,
                background: "rgba(255,255,255,0.03)",
                padding: "12px 14px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                <h2 style={{ margin: 0, fontSize: 18 }}>{item.area}</h2>
                <span
                  style={{
                    borderRadius: 999,
                    border: `1px solid ${BADGE_COLOR[item.status] ?? "#aaa"}`,
                    color: BADGE_COLOR[item.status] ?? "#aaa",
                    padding: "3px 10px",
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.03em",
                  }}
                >
                  {item.status}
                </span>
              </div>
              <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.78)" }}>{item.detail}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
