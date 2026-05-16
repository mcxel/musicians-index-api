"use client";

import { useState } from "react";
import Link from "next/link";
import {
  registerSponsorGift,
  claimSponsorGift,
  getActiveSponsorGifts,
  type SponsorGift,
  type GiftClaim,
  type SponsorGiftType,
} from "@/lib/commerce/SponsorGiftCommerceEngine";

const GIFT_ICON: Record<SponsorGiftType, string> = {
  cash_prize: "💵",
  merch: "👕",
  experience: "🎤",
  subscription_credit: "⭐",
  nft_drop: "🖼️",
  beat_credit: "🎵",
};

const GIFT_COLOR: Record<SponsorGiftType, string> = {
  cash_prize: "#FFD700",
  merch: "#00FFFF",
  experience: "#FF2DAA",
  subscription_credit: "#AA2DFF",
  nft_drop: "#00FF88",
  beat_credit: "#FF6B35",
};

const TIER_COST: Record<string, number> = {
  "cash_prize": 500,
  "experience": 300,
  "nft_drop": 200,
  "merch": 150,
  "subscription_credit": 100,
  "beat_credit": 75,
};

let _seeded = false;
function ensureSeeded() {
  if (_seeded) return;
  registerSponsorGift("prz-001", "TMI Platform", "cash_prize", "$1,000 Crown Cash Prize", "Win $1,000 cash — drawn from the top 10 Crown Point holders at season end.", 100000, 1, { isTaxable: true });
  registerSponsorGift("prz-002", "BeatCo", "beat_credit", "$100 Beat Credit — Producer Pack", "$100 in beat credits for the TMI Marketplace. Redeem for any license type.", 10000, 20);
  registerSponsorGift("prz-003", "NeonCollect", "nft_drop", "Legendary Season 1 NFT — 1 of 3", "Ultra-rare Season 1 legendary NFT. Only 3 exist. Crown Points entry required.", 49900, 3);
  registerSponsorGift("prz-004", "VinylDrop", "merch", "Artist Merch Bundle — Signed", "Signed hoodie + cap + exclusive poster from top Season 1 artist.", 12500, 8);
  registerSponsorGift("prz-005", "LiveXP", "experience", "VIP Backstage — Any Season 1 Show", "Full backstage access to any scheduled Season 1 performance. Worldwide.", 35000, 5);
  registerSponsorGift("prz-006", "TMI Platform", "subscription_credit", "6-Month VIP Pass", "6 months of VIP Pass subscription — all perks, all features.", 29994, 15);
  _seeded = true;
}

type ClaimResult = { gift: SponsorGift; claim: GiftClaim } | { gift: SponsorGift; error: string };

export default function PrizeRoomPage() {
  if (!_seeded && typeof window !== "undefined") ensureSeeded();

  const [crownPoints] = useState(850);
  const [prizes, setPrizes] = useState<SponsorGift[]>(() => {
    if (typeof window !== "undefined") {
      if (!_seeded) ensureSeeded();
      return getActiveSponsorGifts();
    }
    return [];
  });
  const [claims, setClaims] = useState<ClaimResult[]>([]);
  const [claiming, setClaiming] = useState<string | null>(null);

  function enterDraw(prize: SponsorGift) {
    if (claiming) return;
    const cost = TIER_COST[prize.giftType] ?? 100;
    if (crownPoints < cost) return;
    setClaiming(prize.id);
    setTimeout(() => {
      const result = claimSponsorGift(prize.id, "current-user");
      setClaims((prev) => [
        "claimId" in result ? { gift: prize, claim: result } : { gift: prize, error: result.error },
        ...prev,
      ]);
      setPrizes(getActiveSponsorGifts());
      setClaiming(null);
    }, 1400);
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/games" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textDecoration: "none", letterSpacing: "0.2em" }}>← GAMES</Link>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FFD700", fontWeight: 800 }}>TMI GAMES</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0, letterSpacing: 2 }}>PRIZE ROOM</h1>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>YOUR CROWN POINTS</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#FFD700" }}>{crownPoints.toLocaleString()}</div>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 24px" }}>

        {/* Header callout */}
        <div style={{ padding: "20px 22px", border: "1px solid rgba(255,215,0,0.25)", borderRadius: 12, background: "rgba(255,215,0,0.04)", marginBottom: 28 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#FFD700", letterSpacing: "0.12em", marginBottom: 6 }}>👑 CROWN POINTS UNLOCK PRIZE ENTRIES</div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, margin: 0 }}>
            Spend Crown Points to enter prize draws. The more rare the prize, the higher the entry cost. Earn points by winning battles, streaming live, and completing challenges.
          </p>
        </div>

        {/* Recent claims */}
        {claims.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            {claims.slice(0, 3).map((result, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 14px", marginBottom: 6, border: "claimId" in result ? "1px solid rgba(0,255,136,0.3)" : "1px solid rgba(255,68,68,0.3)", borderRadius: 8, background: "claimId" in result ? "rgba(0,255,136,0.06)" : "rgba(255,68,68,0.06)" }}>
                <span style={{ fontSize: 18 }}>{GIFT_ICON[result.gift.giftType]}</span>
                <div style={{ flex: 1 }}>
                  {"claimId" in result
                    ? <span style={{ fontSize: 11, fontWeight: 800, color: "#00FF88" }}>✓ Entry submitted for &ldquo;{result.gift.title}&rdquo;</span>
                    : <span style={{ fontSize: 11, fontWeight: 800, color: "#FF4444" }}>✗ {(result as { gift: SponsorGift; error: string }).error} — {result.gift.title}</span>
                  }
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Prize grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {prizes.map((prize) => {
            const color = GIFT_COLOR[prize.giftType];
            const cost = TIER_COST[prize.giftType] ?? 100;
            const canEnter = crownPoints >= cost;
            const remaining = prize.totalSupply - prize.claimedCount;
            const isClaiming = claiming === prize.id;
            return (
              <div
                key={prize.id}
                style={{ border: `1px solid ${color}25`, borderRadius: 14, background: `${color}06`, overflow: "hidden" }}
              >
                <div style={{ padding: "18px 18px 14px", borderBottom: `1px solid ${color}12` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <span style={{ fontSize: 24 }}>{GIFT_ICON[prize.giftType]}</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color }}>{prize.valueDisplay}</div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{remaining} left</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, marginTop: 10, marginBottom: 6 }}>{prize.title}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{prize.description}</div>
                </div>
                <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", marginBottom: 2 }}>ENTRY COST</div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: canEnter ? "#FFD700" : "#FF4444" }}>👑 {cost.toLocaleString()} pts</div>
                  </div>
                  <button
                    onClick={() => enterDraw(prize)}
                    disabled={!canEnter || isClaiming || remaining === 0}
                    style={{
                      padding: "10px 18px", fontSize: 9, fontWeight: 900, letterSpacing: "0.1em",
                      borderRadius: 8, border: "none", cursor: canEnter && remaining > 0 && !isClaiming ? "pointer" : "default",
                      background: remaining === 0 ? "rgba(255,255,255,0.06)" : !canEnter ? "rgba(255,68,68,0.15)" : isClaiming ? `${color}50` : color,
                      color: !canEnter || remaining === 0 ? "rgba(255,255,255,0.3)" : "#050510",
                    }}
                  >
                    {remaining === 0 ? "SOLD OUT" : !canEnter ? "NEED MORE PTS" : isClaiming ? "ENTERING…" : "ENTER →"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Earn points callout */}
        <div style={{ marginTop: 40, padding: "20px 22px", border: "1px solid rgba(170,45,255,0.2)", borderRadius: 12, background: "rgba(170,45,255,0.04)" }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#AA2DFF", marginBottom: 10, letterSpacing: "0.1em" }}>EARN MORE CROWN POINTS</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
            {[
              { action: "Win a Cypher Round", pts: "+150" },
              { action: "Dirty Dozens Champion", pts: "+120" },
              { action: "Stream 30 min live", pts: "+40" },
              { action: "Vote in 5 polls", pts: "+25" },
              { action: "Refer a new user", pts: "+80" },
              { action: "Complete an Academy module", pts: "+60" },
            ].map(({ action, pts }) => (
              <div key={action} style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(255,255,255,0.55)", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span>{action}</span>
                <span style={{ color: "#FFD700", fontWeight: 800 }}>{pts}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
