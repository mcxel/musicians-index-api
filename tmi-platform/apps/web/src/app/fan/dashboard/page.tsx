"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FanHubShell from "@/components/fan/FanHubShell";
import type { FanSubscriptionTier } from "@/components/fan/FanTierSkinEngine";

interface MeUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  onboardingState: string;
  tier?: string;
  fanPoints?: number;
}

interface MeResponse {
  authenticated: boolean;
  user?: MeUser;
}

function toFanTier(raw?: string): FanSubscriptionTier {
  if (raw === "diamond")       return "diamond";
  if (raw === "gold-platinum") return "gold-platinum";
  if (raw === "pro-bronze")    return "pro-bronze";
  return "free";
}

export default function FanDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);

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
      <main style={{ minHeight: "100vh", background: "#05060c", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.3)", fontFamily: "monospace", letterSpacing: "0.14em", textTransform: "uppercase", fontSize: 11 }}>
          Loading hub…
        </p>
      </main>
    );
  }

  if (!user) return null;

  const displayName    = user.name ?? user.email.split("@")[0] ?? "Fan";
  const fanSlug        = user.id;
  const tier           = toFanTier(user.tier);
  const startingPoints = user.fanPoints ?? 0;
  const tagline        = `${user.email} · ${tier === "free" ? "Free Tier" : tier} · Welcome back`;

  return (
    <FanHubShell
      fanSlug={fanSlug}
      displayName={displayName}
      tier={tier}
      tagline={tagline}
      startingPoints={startingPoints}
    />
  );
}
