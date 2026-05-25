"use client";

import { useEffect, useState } from "react";
import { getReferralStats, isLaunchWindow, TIER_XP } from "@/lib/referral/ReferralEngine";
import type { ReferralStats } from "@/lib/referral/ReferralEngine";
import XPToast from "@/components/ui/XPToast";

interface Props {
  userId: string;
}

const MILESTONE_BONUS = 5_000;

export default function InviteRewardPanel({ userId }: Props) {
  const [refUrl,   setRefUrl]   = useState<string>("");
  const [stats,    setStats]    = useState<ReferralStats | null>(null);
  const [copied,   setCopied]   = useState(false);
  const [toast,    setToast]    = useState<{ xp: number; reason: string } | null>(null);
  const inLaunch = isLaunchWindow();

  // Generate referral link on mount
  useEffect(() => {
    fetch("/api/referral/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ fanId: userId, roomId: "lobby" }),
    })
      .then((r) => r.json())
      .then((d: unknown) => {
        const data = d as { url?: string };
        if (data.url) setRefUrl(data.url);
      })
      .catch(() => {});

    // Fetch stats
    fetch(`/api/referral/stats?userId=${encodeURIComponent(userId)}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d: unknown) => {
        const data = d as ReferralStats | null;
        if (data) setStats(data);
      })
      .catch(() => setStats({ pending: 0, qualified: 0, totalPoints: 0, milestoneUnlocked: false }));
  }, [userId]);

  async function handleCopy() {
    if (!refUrl) return;
    try {
      await navigator.clipboard.writeText(refUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback — select the input text
    }
  }

  const XP_PER_INVITE = inLaunch ? TIER_XP.free * 2 : TIER_XP.free;

  return (
    <div style={{ position: "relative" }}>
      {toast && (
        <XPToast
          xp={toast.xp}
          reason={toast.reason}
          onDismiss={() => setToast(null)}
        />
      )}

      <div style={{ background: "rgba(170,45,255,0.06)", border: "1px solid rgba(170,45,255,0.2)", borderRadius: 14, padding: "24px 20px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#AA2DFF", fontWeight: 800, marginBottom: 6 }}>
              INVITE &amp; EARN
            </div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#fff" }}>
              Bring Your People — Get Rewarded
            </h2>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
              Earn XP instantly. Use points to boost your profile, sponsor artists, enter battles, or unlock features.
            </p>
          </div>
          {inLaunch && (
            <div style={{ background: "rgba(255,215,0,0.12)", border: "1px solid rgba(255,215,0,0.35)", borderRadius: 8, padding: "6px 12px", textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontSize: 8, color: "#FFD700", letterSpacing: "0.15em", fontWeight: 900 }}>LAUNCH BONUS</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#FFD700" }}>2× XP</div>
            </div>
          )}
        </div>

        {/* XP reward tier cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Invite Sent",      icon: "📨", xp: 5,   color: "#00FFFF",  desc: "Your link shared" },
            { label: "Friend Signs Up",  icon: "🎉", xp: inLaunch ? 1_000 : 500, color: "#AA2DFF", desc: "Qualified join" },
            { label: "Friend Goes Live", icon: "🚀", xp: inLaunch ? 100 : 50, color: "#00FF88", desc: "First action taken" },
          ].map((r) => (
            <div key={r.label} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${r.color}22`, borderRadius: 10, padding: "12px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{r.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: r.color }}>+{r.xp.toLocaleString()} XP</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 2, letterSpacing: "0.08em" }}>{r.label}</div>
            </div>
          ))}
        </div>

        {/* Milestone banner */}
        <div style={{ background: "rgba(255,215,0,0.06)", border: "1px dashed rgba(255,215,0,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 20 }}>🏆</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#FFD700" }}>
              {stats?.milestoneUnlocked ? "MILESTONE UNLOCKED!" : `5-Invite Milestone: +${MILESTONE_BONUS.toLocaleString()} XP BONUS`}
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
              {stats ? `${stats.qualified} / 5 qualified invites` : "Loading..."}
            </div>
          </div>
        </div>

        {/* Stats row */}
        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Pending",       value: stats.pending.toString(),                color: "#00FFFF" },
              { label: "Qualified",     value: stats.qualified.toString(),              color: "#00FF88" },
              { label: "Total XP",      value: stats.totalPoints.toLocaleString(),      color: "#AA2DFF" },
            ].map((s) => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", marginTop: 2 }}>{s.label.toUpperCase()}</div>
              </div>
            ))}
          </div>
        )}

        {/* Invite link */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>YOUR INVITE LINK</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              readOnly
              value={refUrl || "Generating your link..."}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8,
                padding: "10px 14px",
                color: refUrl ? "#fff" : "rgba(255,255,255,0.3)",
                fontSize: 12,
                fontFamily: "monospace",
                minWidth: 0,
              }}
              onFocus={(e) => e.target.select()}
            />
            <button
              onClick={handleCopy}
              disabled={!refUrl}
              style={{
                padding: "10px 18px",
                background: copied
                  ? "linear-gradient(135deg,#00FF88,#00CCAA)"
                  : "linear-gradient(135deg,#AA2DFF,#7B1FBB)",
                border: "none",
                borderRadius: 8,
                color: copied ? "#050510" : "#fff",
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "0.1em",
                cursor: refUrl ? "pointer" : "not-allowed",
                whiteSpace: "nowrap",
                transition: "all 0.2s",
              }}
            >
              {copied ? "✓ COPIED" : "🔗 COPY"}
            </button>
          </div>
        </div>

        {/* CTA */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`🎵 Join me on The Musician's Index — battles, beats, live concerts. Free to join. ${refUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ flex: 1, padding: "10px 16px", background: "rgba(29,161,242,0.12)", border: "1px solid rgba(29,161,242,0.3)", borderRadius: 8, color: "#1DA1F2", fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textDecoration: "none", textAlign: "center" }}
          >
            𝕏 SHARE ON X
          </a>
          <a
            href={`sms:?body=${encodeURIComponent(`Yo, join me on TMI — free battles, live music, cash prizes. ${refUrl}`)}`}
            style={{ flex: 1, padding: "10px 16px", background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.25)", borderRadius: 8, color: "#00FF88", fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textDecoration: "none", textAlign: "center" }}
          >
            📱 TEXT YOUR CREW
          </a>
        </div>
      </div>
    </div>
  );
}
