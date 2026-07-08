'use client';
import { useEffect, useState } from "react";
import Link from "next/link";
import { useTmiSession } from "@/hooks/SessionContext";
import FanHQShell from "@/components/fan/FanHQShell";
import { OnboardingMissionDock } from "@/components/onboarding/OnboardingMissionCard";
import { useOnboardingMissions } from "@/components/onboarding/useOnboardingMissions";

export default function FanHubPage() {
  const { userId, userName } = useTmiSession();
  const { missions, dismiss } = useOnboardingMissions();
  const [userTier, setUserTier] = useState<string>("");
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d: { authenticated?: boolean; user?: { tier?: string } }) => {
        if (d.authenticated && d.user?.tier) setUserTier(d.user.tier.toUpperCase());
      })
      .catch(() => {});
  }, []);

  return (
    <>
      {userTier === "FREE" && !bannerDismissed && (
        <div style={{ background: "linear-gradient(90deg, #FF2DAA, #AA2DFF)", padding: "12px 24px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", position: "relative", zIndex: 100 }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", letterSpacing: "0.04em" }}>
              ❤️ Become a Pro Fan for only $2.99/month
            </span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", marginLeft: 12 }}>
              Heart unlimited content · Priority chat · Exclusive articles · Early access
            </span>
          </div>
          <Link href="/account/subscription" style={{ padding: "8px 22px", borderRadius: 8, background: "#fff", color: "#FF2DAA", fontSize: 12, fontWeight: 900, textDecoration: "none", letterSpacing: "0.06em", whiteSpace: "nowrap", boxShadow: "0 2px 12px rgba(0,0,0,0.25)", flexShrink: 0 }}>
            UPGRADE NOW
          </Link>
          <button onClick={() => setBannerDismissed(true)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", fontSize: 18, cursor: "pointer", padding: "0 4px", flexShrink: 0 }} aria-label="Dismiss">×</button>
        </div>
      )}
      <div style={{ padding: "10px 24px", display: "flex", gap: 10, flexWrap: "wrap", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(5,5,16,0.9)" }}>
        <Link href="/messages" style={{ fontSize: 11, fontWeight: 800, color: "#00FFFF", textDecoration: "none", border: "1px solid rgba(0,255,255,0.35)", borderRadius: 8, padding: "6px 10px", letterSpacing: "0.06em" }}>
          OPEN MESSAGES
        </Link>
        <Link href="/messages/new?subject=Join+me+on+TMI" style={{ fontSize: 11, fontWeight: 800, color: "#FFD700", textDecoration: "none", border: "1px solid rgba(255,215,0,0.35)", borderRadius: 8, padding: "6px 10px", letterSpacing: "0.06em" }}>
          INVITE FRIENDS
        </Link>
      </div>
      <FanHQShell fanId={userId} fanDisplayName={userName} />
      <OnboardingMissionDock missions={missions} onDismiss={dismiss} />
    </>
  );
}
