import Link from "next/link";

const SEED_APPROVALS = [
  { id: "ap1", type: "Artist Registration", name: "FlowState.J", submitted: "May 18, 2026", status: "pending" },
  { id: "ap2", type: "Sponsor Application", name: "NeonBrand LLC", submitted: "May 17, 2026", status: "pending" },
  { id: "ap3", type: "Venue Onboard", name: "The Warehouse", submitted: "May 16, 2026", status: "review" },
  { id: "ap4", type: "Beat Upload", name: "Yung Mako - Beat #14", submitted: "May 15, 2026", status: "approved" },
];

const ST_COLOR: Record<string, string> = { pending: "#FFD700", review: "#00FFFF", approved: "#22c55e", rejected: "#ef4444" };

export default function AdminApprovalsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <Link href="/admin" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Admin</Link>
        </div>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#FFD700", fontWeight: 800, marginBottom: 4 }}>ADMIN · APPROVALS</div>
        <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 28px" }}>Approval Queue</h1>
        <div style={{ display: "grid", gap: 12 }}>
          {SEED_APPROVALS.map((a) => (
            <div key={a.id} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${ST_COLOR[a.status]}22`, borderRadius: 12, padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div>
                <div style={{ fontSize: 9, fontWeight: 800, color: ST_COLOR[a.status], letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>{a.type}</div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{a.name}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>Submitted {a.submitted}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {a.status === "pending" || a.status === "review" ? (
                  <>
                    <button style={{ padding: "8px 16px", borderRadius: 8, background: "#22c55e22", border: "1px solid #22c55e44", color: "#22c55e", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>Approve</button>
                    <button style={{ padding: "8px 16px", borderRadius: 8, background: "#ef444422", border: "1px solid #ef444444", color: "#ef4444", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>Reject</button>
                  </>
                ) : (
                  <span style={{ fontSize: 9, fontWeight: 800, color: ST_COLOR[a.status], letterSpacing: "0.12em", textTransform: "uppercase" }}>{a.status}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}