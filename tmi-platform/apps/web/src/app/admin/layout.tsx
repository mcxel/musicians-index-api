"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Roles that may access /admin/* — checked against live session before any child renders
const ADMIN_ROLES = new Set(["admin", "superadmin", "owner", "ADMIN"]);

type AuthStatus = "checking" | "authorized" | "denied";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<AuthStatus>("checking");

  useEffect(() => {
    let active = true;

    fetch("/api/auth/session", { cache: "no-store", credentials: "include" })
      .then(r => r.json())
      .then((d: unknown) => {
        if (!active) return;
        const data = d as { authenticated?: boolean; user?: { role?: string } | null };
        const authed = Boolean(data?.authenticated);
        const role   = data?.user?.role ?? "";
        setStatus(authed && ADMIN_ROLES.has(role) ? "authorized" : "denied");
      })
      .catch(() => {
        if (active) setStatus("denied");
      });

    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (status === "denied") {
      router.replace("/login?redirect=/admin");
    }
  }, [status, router]);

  if (status === "checking") {
    return (
      <div style={{
        minHeight: "100vh", background: "#07070f",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.35em", color: "#00FFFF", fontWeight: 800, marginBottom: 10 }}>
            ADMIN PANEL
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Verifying access…</div>
        </div>
      </div>
    );
  }

  // "denied" — null render; redirect fires in the effect above
  if (status === "denied") return null;

  return <>{children}</>;
}
