import Link from "next/link";
import { getAllUsers, getUserCount } from "@/lib/auth/UserStore";

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "#ef4444", ARTIST: "#00FFFF", PERFORMER: "#AA2DFF",
  FAN: "#FF2DAA", SPONSOR: "#FFD700", ADVERTISER: "#FFA500", VENUE: "#00FF88",
  WRITER: "#FF2DAA", PROMOTER: "#AA2DFF", USER: "#64748b", STAFF: "#64748b",
  DIAMOND: "#00FF88", PLATINUM: "#AA2DFF", GOLD: "#FFD700", SILVER: "#C0C0C0",
};

export const dynamic = "force-dynamic";

export default function AdminUsersPage() {
  const users = getAllUsers(100);
  const total = getUserCount();

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

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 10, marginBottom: 28 }}>
          {[
            { label: "Total Users",    value: String(total),                              color: "#fff" },
            { label: "This Session",   value: String(users.length),                       color: "#22c55e" },
            { label: "Diamond",        value: String(users.filter(u => u.tier === "DIAMOND").length),  color: "#00FF88" },
            { label: "Admin",          value: String(users.filter(u => u.tier === "ADMIN").length),    color: "#ef4444" },
          ].map((s) => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* User table */}
        {users.length === 0 ? (
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "40px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
            No registered users yet. Users appear here after signing up.
          </div>
        ) : (
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px 80px 80px 80px", gap: 0, padding: "10px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              <span>Display Name</span><span>Email</span><span>Role</span><span>Tier</span><span>Joined</span><span>Action</span>
            </div>
            {users.map((u) => (
              <div key={u.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px 80px 80px 80px", gap: 0, padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center", fontSize: 12 }}>
                <span style={{ fontWeight: 700 }}>{u.displayName}</span>
                <span style={{ color: "rgba(255,255,255,0.45)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 11 }}>{u.email}</span>
                <span style={{ fontSize: 9, fontWeight: 800, color: ROLE_COLORS[u.role?.toUpperCase() as keyof typeof ROLE_COLORS] ?? "#00FFFF", letterSpacing: "0.08em", textTransform: "uppercase" }}>{u.role}</span>
                <span style={{ fontSize: 9, fontWeight: 800, color: ROLE_COLORS[u.tier] ?? "#aaa", letterSpacing: "0.08em", textTransform: "uppercase" }}>{u.tier}</span>
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>{new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", year: "2-digit" })}</span>
                <Link href={`/admin/users/${u.id}`} style={{ fontSize: 10, color: "#00FFFF", textDecoration: "none", fontWeight: 700 }}>View →</Link>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 16, fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
          Showing {users.length} of {total} registered users. Emails hidden for privacy. Connect DATABASE_URL to persist users across restarts.
        </div>
      </div>
    </main>
  );
}
