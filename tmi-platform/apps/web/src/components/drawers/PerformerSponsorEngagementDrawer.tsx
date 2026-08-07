"use client";

/**
 * PerformerSponsorEngagementDrawer — Sponsor & Live Control Deck.
 * Sponsor logos are real (SponsorRegistry). Video thumbnails are real
 * (/api/user/content). Go Live routes to the real /live/go flow.
 * "Gift to Crowd" / "Promoter Messages" have no real backend anywhere in
 * the codebase (Rule 24's Sponsor Prize Distribution Engine is explicitly
 * documented as not-yet-built) — shown as honest "not live yet" rather
 * than dead buttons pretending to work (Rule 14/20).
 */

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import UniversalDrawerBase from "./UniversalDrawerBase";
import { HOUSE_SPONSORS } from "@/lib/commerce/DualStreamSponsorshipEngine";

interface PerformerSponsorEngagementDrawerProps {
  open: boolean;
  onClose: () => void;
  displayName?: string;
  performerId?: string;
}

interface ApiVideo {
  id: string;
  title: string;
  thumbnailUrl?: string | null;
}

type HuntedSponsor = {
  id: string;
  name: string;
  tagline: string;
  liveEnabled: boolean;
};

type PayoutSnap = {
  state: string;
  message: string;
  availableBalanceCents: number;
  connectReady: boolean;
};

export default function PerformerSponsorEngagementDrawer({
  open,
  onClose,
  displayName,
  performerId,
}: PerformerSponsorEngagementDrawerProps) {
  const [videos, setVideos] = useState<ApiVideo[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [hunted, setHunted] = useState<HuntedSponsor[]>([]);
  const [payout, setPayout] = useState<PayoutSnap | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/user/content", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data = await res.json() as { videos?: ApiVideo[] };
        setVideos((data.videos ?? []).slice(0, 3));
      } catch {
        /* honest fallback: empty video strip */
      } finally {
        if (!cancelled) setLoadingVideos(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !performerId) return;
    let cancelled = false;
    (async () => {
      try {
        const [spRes, payRes] = await Promise.all([
          fetch(`/api/performer/sponsors/dual-stream?performerId=${encodeURIComponent(performerId)}`, {
            cache: "no-store",
          }),
          fetch(`/api/artist/payout-status?userId=${encodeURIComponent(performerId)}`, { cache: "no-store" }),
        ]);
        if (!cancelled && spRes.ok) {
          const sp = (await spRes.json()) as { hunted?: HuntedSponsor[] };
          setHunted(sp.hunted ?? []);
        }
        if (!cancelled && payRes.ok) {
          setPayout((await payRes.json()) as PayoutSnap);
        }
      } catch {
        /* honest empty */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, performerId]);

  async function toggleHunted(sponsorId: string, enabled: boolean) {
    if (!performerId) return;
    const res = await fetch("/api/performer/sponsors/dual-stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ performerId, sponsorId, enabled }),
    });
    if (!res.ok) return;
    const sp = (await res.json()) as { hunted?: HuntedSponsor[] };
    setHunted(sp.hunted ?? []);
  }

  return (
    <UniversalDrawerBase
      open={open}
      animationId="hologram"
      title="SPONSOR & LIVE ENGAGEMENT DECK"
      subtitle={displayName ? `${displayName} · sponsor placements & go-live controls` : "Sponsor placements & go-live controls"}
      onClose={onClose}
      accentColor="#00FFFF"
      mode="overlay"
      overlayHeight="min(92vh, 880px)"
    >
      <div
        style={{
          flex: 1,
          padding: 14,
          background: "rgba(3,2,14,0.96)",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          overflowY: "auto",
          fontFamily: "'Inter', sans-serif",
          color: "#fff",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1.2fr", gap: 12, flex: 1 }}>
          {/* LEFT PANEL: Promoted content / recent videos */}
          <div style={deckCard("#00FFFF")}>
            <div style={cardHeader("#00FFFF")}>YOUR RECENT VIDEOS</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 10, flex: 1 }}>
              {loadingVideos ? (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: 10, padding: 20 }}>
                  Loading…
                </div>
              ) : videos.length === 0 ? (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: 10, padding: 20 }}>
                  No videos uploaded yet.
                </div>
              ) : (
                videos.map((v) => (
                  <Link key={v.id} href="/hub/performer?drawer=media_locker" style={{ ...vlogThumb("#AA2DFF"), textDecoration: "none" }}>
                    <span>📹</span>
                    <span style={{ fontSize: 8, fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>
                      {v.title}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* CENTER PANEL: SPONSOR CANISTER + LIVE PANEL */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={deckCard("#00FFFF")}>
              <div style={cardHeader("#00FFFF")}>HOUSE SPONSORS (auto on go-live)</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                {HOUSE_SPONSORS.map((sp) => (
                  <div
                    key={sp.id}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(0,0,0,0.4)", padding: "4px 8px", borderRadius: 6, border: `1px solid ${sp.accent}44` }}
                  >
                    <span style={{ fontSize: 9, fontWeight: 900, color: sp.accent }}>{sp.name}</span>
                    <span style={{ fontSize: 8, color: "rgba(255,255,255,0.4)" }}>{sp.tagline}</span>
                  </div>
                ))}
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                  Hunted brands (toggle when approved):
                </div>
                {hunted.length === 0 ? (
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>
                    No approved hunter campaigns yet — empty until real PerformerSponsorRegistry relations exist.
                  </div>
                ) : (
                  hunted.map((sp) => (
                    <button
                      key={sp.id}
                      type="button"
                      onClick={() => void toggleHunted(sp.id, !sp.liveEnabled)}
                      style={{
                        ...btnSmall(sp.liveEnabled ? "#00FF88" : "#AA2DFF"),
                        textAlign: "left",
                        width: "100%",
                      }}
                    >
                      {sp.liveEnabled ? "ON" : "OFF"} · {sp.name}
                    </button>
                  ))
                )}
                <Link href="/sponsors/advertise" style={{ ...btnSmall("#FFD700"), textAlign: "center", marginTop: 4, textDecoration: "none" }}>
                  Advertise / sell a placement →
                </Link>
              </div>
            </div>

            <div style={deckCard("#00FF88")}>
              <div style={cardHeader("#00FF88")}>GO LIVE</div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <Link href="/live/go" style={{ ...largeCalloutBtn("#00FF88"), flex: 1, textAlign: "center", textDecoration: "none" }}>
                  ▶ GO LIVE
                </Link>
              </div>
            </div>
          </div>

          {/* Earnings / payout — Rule 20 four-states */}
          <div style={deckCard("#FFD700")}>
            <div style={cardHeader("#FFD700")}>EARNINGS / PAYOUT</div>
            <div style={{ background: "rgba(0,0,0,0.4)", padding: 10, borderRadius: 8, marginTop: 8, flex: 1, fontSize: 9, lineHeight: 1.5 }}>
              {!performerId ? (
                <span style={{ color: "rgba(255,255,255,0.4)" }}>Sign in as performer to load payout status.</span>
              ) : !payout ? (
                <span style={{ color: "rgba(255,255,255,0.4)" }}>Loading payout status…</span>
              ) : payout.state === "error" ? (
                <span style={{ color: "#FF4444" }}>{payout.message}</span>
              ) : payout.state === "empty" ? (
                <span style={{ color: "rgba(255,255,255,0.45)" }}>{payout.message}</span>
              ) : (
                <>
                  <div style={{ color: "#FFD700", fontWeight: 800 }}>
                    Available: ${(payout.availableBalanceCents / 100).toFixed(2)}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{payout.message}</div>
                  <div style={{ color: payout.connectReady ? "#00FF88" : "#FFD700", marginTop: 4 }}>
                    Connect: {payout.connectReady ? "ready" : "onboarding incomplete"}
                  </div>
                </>
              )}
              <div style={{ color: "rgba(255,255,255,0.35)", marginTop: 8 }}>
                Sponsor-funded crowd gifts: not live yet (Rule 24) — no fake drops.
              </div>
            </div>
          </div>
        </div>
      </div>
    </UniversalDrawerBase>
  );
}

function deckCard(color: string): CSSProperties {
  return {
    background: "rgba(8,5,22,0.85)",
    border: `1px solid ${color}44`,
    borderRadius: 12,
    padding: 12,
    display: "flex",
    flexDirection: "column",
    boxShadow: `0 0 15px ${color}12`,
  };
}

function cardHeader(color: string): CSSProperties {
  return {
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: "0.12em",
    color,
    paddingBottom: 4,
    borderBottom: `1px solid ${color}22`,
  };
}

function vlogThumb(color: string): CSSProperties {
  return {
    background: `${color}15`,
    border: `1px solid ${color}44`,
    borderRadius: 8,
    padding: 8,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    textAlign: "center",
    color: "#fff",
  };
}

function largeCalloutBtn(color: string): CSSProperties {
  return {
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: "0.1em",
    padding: "10px 14px",
    borderRadius: 8,
    border: `1.5px solid ${color}`,
    background: `linear-gradient(135deg, ${color}30, ${color}10)`,
    color: "#fff",
    cursor: "pointer",
    boxShadow: `0 0 15px ${color}40`,
    display: "inline-block",
  };
}

function btnSmall(color: string): CSSProperties {
  return {
    fontSize: 8,
    fontWeight: 900,
    padding: "4px 8px",
    borderRadius: 4,
    border: `1px solid ${color}`,
    background: `${color}20`,
    color,
    cursor: "pointer",
  };
}
