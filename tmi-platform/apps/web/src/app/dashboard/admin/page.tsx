"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface MeUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  onboardingState: string;
}

interface MeResponse {
  authenticated: boolean;
  user?: MeUser;
}

const ADMIN_LINKS = [
  { label: "Users", href: "/admin/users", emoji: "👥" },
  { label: "Content", href: "/admin/content", emoji: "📄" },
  { label: "Stations", href: "/admin/stations", emoji: "📻" },
  { label: "Contests", href: "/admin/contests", emoji: "🏆" },
  { label: "Sponsors", href: "/admin/sponsors", emoji: "🤝" },
  { label: "Advertisers", href: "/admin/advertisers", emoji: "📢" },
  { label: "Moderation", href: "/admin/moderation", emoji: "🛡️" },
  { label: "System Health", href: "/admin/system", emoji: "⚙️" },
  { label: "Analytics", href: "/admin/analytics", emoji: "📊" },
  { label: "Feature Flags", href: "/admin/feature-flags", emoji: "🚩" },
  { label: "Bots", href: "/admin/bots", emoji: "🤖" },
  { label: "Payouts", href: "/admin/payouts", emoji: "💸" },
];

const ADMIN_ROLES = ["ADMIN", "STAFF"];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/users/me", { cache: "no-store", credentials: "include" });
        if (res.status === 401 || res.status === 403) {
          router.replace("/auth");
          return;
        }
        const data = (await res.json()) as MeResponse;
        if (!data.authenticated || !data.user) {
          router.replace("/auth");
          return;
        }
        if (!ADMIN_ROLES.includes(data.user.role)) {
          router.replace("/dashboard");
          return;
        }
        setUser(data.user);
      } catch {
        router.replace("/auth");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [router]);

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#0a0a0f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "system-ui, sans-serif" }}>Loading…</p>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0a0a0f",
        color: "#fff",
        padding: "48px 20px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p
            style={{
              fontSize: 12,
              letterSpacing: 2,
              color: "#ff6b35",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Admin Command Center
          </p>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: "0 0 6px" }}>
            Platform Control
          </h1>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 15 }}>
            The Musician&apos;s Index — administrative dashboard
          </p>
        </div>

        {/* Admin links grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 16,
            marginBottom: 40,
          }}
        >
          {ADMIN_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "18px 20px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                color: "#fff",
                textDecoration: "none",
                fontSize: 15,
                fontWeight: 500,
              }}
            >
              <span style={{ fontSize: 22 }}>{link.emoji}</span>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Account status panel */}
        <div
          style={{
            padding: "24px 28px",
            background: "rgba(255,107,53,0.06)",
            border: "1px solid rgba(255,107,53,0.2)",
            borderRadius: 12,
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: "#ff6b35" }}>
            Session Info
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <StatusRow label="Role" value={user.role} />
            <StatusRow label="Email" value={user.email} />
            {user.name && <StatusRow label="Name" value={user.name} />}
            <StatusRow label="User ID" value={user.id} />
          </div>
        </div>
      </div>
    </main>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 12, fontSize: 14 }}>
      <span style={{ color: "rgba(255,255,255,0.45)", minWidth: 110 }}>{label}</span>
      <span style={{ color: "#fff", fontWeight: 500, wordBreak: "break-all" }}>{value}</span>
    </div>
  );
}
