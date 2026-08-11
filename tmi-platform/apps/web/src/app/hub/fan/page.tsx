"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FanHQShell from "@/components/fan/FanHQShell";

interface SessionUser {
  id: string;
  name?: string;
  email?: string;
  role?: string;
}

export default function FanHubPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((d: { authenticated?: boolean; user?: SessionUser }) => {
        if (cancelled) return;
        if (!d.authenticated || !d.user) {
          router.replace("/auth?next=/hub/fan");
          return;
        }
        setUser(d.user);
      })
      .catch(() => {
        if (!cancelled) router.replace("/auth?next=/hub/fan");
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
    <FanHQShell
      fanId={user.id}
      fanDisplayName={user.name?.trim() || "Fan"}
    />
  );
}
