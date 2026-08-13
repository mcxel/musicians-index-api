"use client";

export const dynamic = "force-dynamic";

/**
 * Performer Hub — matching Command Center shell (shared with Fan).
 * Drawer: Media Locker / YoPho / Beat Lab / Bookings / Stage — never Fan Lobby ownership.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PerformerCommandCenter from "@/components/performer/PerformerCommandCenter";

interface SessionUser {
  id: string;
  name?: string;
  email?: string;
  role?: string;
}

export default function PerformerHubPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((d: { authenticated?: boolean; user?: SessionUser }) => {
        if (cancelled) return;
        if (!d.authenticated || !d.user) {
          router.replace("/auth?next=/hub/performer");
          return;
        }
        const role = (d.user.role ?? "").toUpperCase();
        if (!["PERFORMER", "ARTIST", "BAND", "ADMIN", "STAFF", "SUPERADMIN"].includes(role)) {
          router.replace("/hub/fan");
          return;
        }
        setUser(d.user);
      })
      .catch(() => {
        if (!cancelled) router.replace("/auth?next=/hub/performer");
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!user) {
    return (
      <main style={{ minHeight: "100vh", background: "#050510", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, letterSpacing: "0.14em" }}>LOADING COMMAND CENTER…</p>
      </main>
    );
  }

  return (
    <PerformerCommandCenter
      performerId={user.id}
      displayName={user.name?.trim() || "Performer"}
    />
  );
}
