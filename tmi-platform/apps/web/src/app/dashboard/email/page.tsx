import Link from "next/link";
export default function Page() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-6 py-10">
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}><Link href="/dashboard" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Dashboard</Link></div>
        <h1 style={{ fontSize: "clamp(22px,4vw,34px)", fontWeight: 900, color: "#34D399", margin: "0 0 10px" }}>Email System</h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginBottom: 32 }}>Manage transactional email templates, bulk announcements, and delivery stats.</p>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "32px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
          Live data will appear here. Connect your data source to populate this dashboard.
        </div>
      </div>
    </main>
  );
}
