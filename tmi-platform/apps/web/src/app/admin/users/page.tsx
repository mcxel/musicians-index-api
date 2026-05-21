import Link from "next/link";

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "#ef4444", ARTIST: "#00FFFF", PERFORMER: "#AA2DFF",
  FAN: "#FF2DAA", SPONSOR: "#FFD700", ADVERTISER: "#FFA500", VENUE: "#22c55e", STAFF: "#64748b",
};

const SEED_USERS = [
  { id: "u1", name: "Nova Cipher", email: "nova@tmi.live", role: "PERFORMER", status: "active", joined: "Jan 2026" },
  { id: "u2", name: "Ari Volt", email: "ari@tmi.live", role: "ARTIST", status: "active", joined: "Feb 2026" },
  { id: "u3", name: "Prime Wave Media", email: "brand@primemedia.com", role: "SPONSOR", status: "active", joined: "Mar 2026" },
  { id: "u4", name: "Fan_XR99", email: "xr99@fan.tmi", role: "FAN", status: "active", joined: "Apr 2026" },
  { id: "u5", name: "Cypher Arena", email: "ops@cypherarena.com", role: "VENUE", status: "suspended", joined: "Jan 2026" },
];

export default function AdminUsersPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <Link href="/admin" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Admin</Link>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28, gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 5, color: "#ef4444", fontWeight: 800, marginBottom: 4 }}>ADMIN · USERS</div>
            <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: 0 }}>User Management</h1>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/admin/roles" style={{ padding: "9px 18px", borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>Roles</Link>
            <Link href="/admin/invites" style={{ padding: "9px 18px", borderRadius: 8, background: "#ef4444", color: "#fff", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>Invite User</Link>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 10, marginBottom: 28 }}>
          {["Total Users", "Active", "Suspended", "New This Month"].map((label, i) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: ["#fff","#22c55e","#ef4444","#00FFFF"][i] }}>{["1,284","1,241","43","89"][i]}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 120px 100px 80px 80px", gap: 0, padding: "10px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            <span>Name</span><span>Email</span><span>Role</span><span>Status</span><span>Joined</span><span>Action</span>
          </div>
          {SEED_USERS.map((u) => (
            <div key={u.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 120px 100px 80px 80px", gap: 0, padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center", fontSize: 12 }}>
              <span style={{ fontWeight: 700 }}>{u.name}</span>
              <span style={{ color: "rgba(255,255,255,0.45)" }}>{u.email}</span>
              <span style={{ fontSize: 9, fontWeight: 800, color: ROLE_COLORS[u.role] ?? "#fff", letterSpacing: "0.1em", textTransform: "uppercase" }}>{u.role}</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: u.status === "active" ? "#22c55e" : "#ef4444", textTransform: "uppercase", letterSpacing: "0.1em" }}>{u.status}</span>
              <span style={{ color: "rgba(255,255,255,0.35)" }}>{u.joined}</span>
              <Link href={`/admin/users/${u.id}`} style={{ fontSize: 10, color: "#00FFFF", textDecoration: "none", fontWeight: 700 }}>View →</Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}