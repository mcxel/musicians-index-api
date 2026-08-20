"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FanHQShell from "@/components/fan/FanHQShell";

interface SessionUser {
  id: string;
  name?: string;
  email?: string;
  role?: string;
}

function LoadingScreen() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050510",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, letterSpacing: "0.14em" }}>
        LOADING COMMAND CENTER…
      </p>
    </main>
  );
}

export default function FanHubPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (let attempt = 0; attempt < 12 && !cancelled; attempt++) {
        try {
          const r = await fetch("/api/auth/session", {
            credentials: "include",
            cache: "no-store",
          });
          const d = (await r.json()) as {
            authenticated?: boolean;
            user?: SessionUser;
          };
          if (cancelled) return;
          if (d.authenticated && d.user) {
            setUser(d.user);
            return;
          }
        } catch {
          /* retry */
        }
        await new Promise((res) => setTimeout(res, 500 + attempt * 250));
      }
      if (!cancelled) router.replace("/auth?next=/hub/fan");
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!user) return <LoadingScreen />;

  return (
    <FanHQShell fanId={user.id} fanDisplayName={user.name?.trim() || "Fan"} />
  );
}
