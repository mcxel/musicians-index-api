import { redirect } from "next/navigation";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import AdminComplimentaryTierPanel from "@/components/admin/AdminComplimentaryTierPanel";
import AdminAssignRolesPanel from "@/components/admin/AdminAssignRolesPanel";

export default async function UserManagementPage() {
  const auth = await getTmiAuth();
  if (!auth || auth.user.role !== "ADMIN") {
    redirect("/admin");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 10% 0%, rgba(255,215,0,0.06), transparent 40%)," +
          "radial-gradient(circle at 90% 100%, rgba(170,45,255,0.06), transparent 40%)," +
          "#06070d",
        color: "#e2e8f0",
        fontFamily: "'Inter', sans-serif",
        padding: "24px",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <a
          href="/admin"
          style={{
            fontSize: 10,
            color: "#555",
            textDecoration: "none",
            letterSpacing: "0.08em",
          }}
        >
          ← BACK TO ADMIN HUB
        </a>
        <h1
          style={{
            fontSize: 16,
            fontWeight: 900,
            letterSpacing: "0.14em",
            color: "#FFD700",
            margin: "10px 0 4px",
          }}
        >
          USER MANAGEMENT
        </h1>
        <p style={{ fontSize: 11, color: "#555", margin: 0 }}>
          Grant complimentary tiers and assign multi-role access to any account.
        </p>
      </div>

      {/* Two-column layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          maxWidth: 960,
        }}
      >
        {/* Tier grants */}
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: "#666",
              marginBottom: 10,
            }}
          >
            COMPLIMENTARY TIER GRANTS
          </div>
          <AdminComplimentaryTierPanel />
        </div>

        {/* Role assignment */}
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: "#666",
              marginBottom: 10,
            }}
          >
            MULTI-ROLE ASSIGNMENT
          </div>
          <AdminAssignRolesPanel />
        </div>
      </div>
    </main>
  );
}
