"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ArtistWorldShell from "@/components/artist/ArtistWorldShell";
import SplitStreamMatrix from "@/components/media/SplitStreamMatrix";
import RetinalHudChat from "@/components/media/RetinalHudChat";

interface MeUser {
  id: string;
  email: string;
  name?: string;
  role: string;
}

interface MeResponse {
  authenticated: boolean;
  user?: MeUser;
}

export default function ArtistDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBattle, setIsBattle] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/users/me", { cache: "no-store", credentials: "include" });
        if (res.status === 401 || res.status === 403) { router.replace("/auth"); return; }
        const data = (await res.json()) as MeResponse;
        if (!data.authenticated || !data.user) { router.replace("/auth"); return; }
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
      <main style={{ minHeight: "100vh", background: "#040614", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.3)", fontFamily: "monospace", letterSpacing: "0.14em", fontSize: 11 }}>
          LOADING STAGE…
        </p>
      </main>
    );
  }

  if (!user) return null;

  const displayName = user.name ?? user.email.split("@")[0] ?? "Artist";
  const slug = user.id;

  return (
    <ArtistWorldShell
      displayName={displayName}
      slug={slug}
      tagline={`${user.email} · Artist Dashboard`}
      isVerified
    >
      {/* Stream + HUD panel injected as children into the identity header area */}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginTop: 20, flexWrap: "wrap" }}>
        {/* Live stream controls */}
        <div style={{ flex: "1 1 360px", minWidth: 0 }}>
          <div style={{ fontSize: 8, letterSpacing: "0.18em", fontWeight: 800, color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>
            STREAM CONTROL
          </div>
          <SplitStreamMatrix
            mode="SPLIT"
            isBattle={isBattle}
            battleOpponentLabel="Challenger"
            onModeChange={() => {}}
          />
          <button
            onClick={() => setIsBattle(b => !b)}
            style={{
              marginTop: 10,
              padding: "7px 14px",
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.12em",
              border: `1px solid ${isBattle ? "rgba(255,45,170,0.4)" : "rgba(255,255,255,0.1)"}`,
              borderRadius: 6,
              background: isBattle ? "rgba(255,45,170,0.08)" : "transparent",
              color: isBattle ? "#FF2DAA" : "rgba(255,255,255,0.4)",
              cursor: "pointer",
            }}
          >
            {isBattle ? "⚔️ BATTLE MODE ON" : "ENABLE BATTLE MODE"}
          </button>
        </div>

        {/* Retinal HUD chat */}
        <div style={{ flexShrink: 0 }}>
          <RetinalHudChat />
        </div>
      </div>
    </ArtistWorldShell>
  );
}
