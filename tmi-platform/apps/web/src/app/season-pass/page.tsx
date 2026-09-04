'use client';
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import TmiSeasonPassEngine from "@/components/pass/TmiSeasonPassEngine";
import { useGamificationEngine } from "@/hooks/useGamificationEngine";
import {
  listSeasonPassOffers,
  seasonPassCheckoutHref,
} from "@/lib/season/SeasonPassCatalog";

/** Always ASC by priceCents — Starter ($1.99) leads; VIP ($49.99) last. */
const TIERS = listSeasonPassOffers();

export default function SeasonPassPage() {
  const { totalXp, walletCredits, trackAction } = useGamificationEngine();
  const searchParams = useSearchParams();
  const notice = searchParams?.get('notice');

  useEffect(() => { trackAction('LOGIN_DAILY'); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const NOTICES: Record<string, { bg: string; border: string; color: string; text: string }> = {
    'stripe-paused': {
      bg: 'rgba(255,215,0,0.06)', border: 'rgba(255,215,0,0.3)', color: '#FFD700',
      text: 'Payments are temporarily processing — your request is saved and will be fulfilled shortly. Thank you for your patience.',
    },
    'stripe-pending': {
      bg: 'rgba(255,45,170,0.06)', border: 'rgba(255,45,170,0.3)', color: '#FF2DAA',
      text: 'Stripe is not yet configured. Add STRIPE_SECRET_KEY to Vercel to enable payments.',
    },
    'checkout-error': {
      bg: 'rgba(255,45,170,0.06)', border: 'rgba(255,45,170,0.3)', color: '#FF2DAA',
      text: 'Checkout encountered an issue. Please try again or contact support.',
    },
  };
  const activeNotice = notice ? NOTICES[notice] : null;

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      {activeNotice && (
        <div style={{ padding: '14px 24px', background: activeNotice.bg, borderBottom: `1px solid ${activeNotice.border}`, textAlign: 'center', fontSize: 12, color: activeNotice.color, fontWeight: 600 }}>
          {activeNotice.text}
        </div>
      )}
      <section style={{ textAlign: "center", padding: "56px 24px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FFD700", fontWeight: 800, marginBottom: 10 }}>TMI SEASON 1</div>
        <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.8rem)", fontWeight: 900, marginBottom: 12 }}>Season Pass</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", maxWidth: 460, margin: "0 auto" }}>
          Unlock the full TMI experience — start from ${TIERS[0]?.priceDisplay ?? "$1.99"} and climb when you&apos;re ready. Season passes are separate from monthly memberships.
        </p>
        <div style={{ display: "inline-flex", gap: 16, marginTop: 20, padding: "10px 20px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 30 }}>
          <span style={{ fontSize: 10, color: "#FFD700", fontWeight: 700 }}>{totalXp.toLocaleString()} XP</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>·</span>
          <span style={{ fontSize: 10, color: "#00FF88", fontWeight: 700 }}>{walletCredits.toLocaleString()} TM Credits</span>
        </div>
      </section>

      {/* Horizontal rail: scroll starts at low end (no auto-scroll to VIP). */}
      <section
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "48px 24px 0",
          display: "flex",
          gap: 16,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {TIERS.map(tier => (
          <div
            key={tier.id}
            style={{
              position: "relative",
              flex: "0 0 min(280px, 85vw)",
              scrollSnapAlign: "start",
              background: tier.popular || tier.entry ? `${tier.color}0A` : "rgba(255,255,255,0.02)",
              border: `1px solid ${tier.color}${tier.popular || tier.entry ? "40" : "20"}`,
              borderRadius: 16,
              padding: "28px 24px 24px",
              opacity: tier.available ? 1 : 0.55,
            }}
          >
            {tier.entry && (
              <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: tier.color, color: "#050510", fontSize: 7, fontWeight: 900, letterSpacing: "0.15em", padding: "3px 12px", borderRadius: 20 }}>START HERE</div>
            )}
            {tier.popular && !tier.entry && (
              <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: tier.color, color: "#050510", fontSize: 7, fontWeight: 900, letterSpacing: "0.15em", padding: "3px 12px", borderRadius: 20 }}>MOST POPULAR</div>
            )}
            {!tier.available && (
              <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: "rgba(255,255,255,0.2)", color: "#fff", fontSize: 7, fontWeight: 900, letterSpacing: "0.15em", padding: "3px 12px", borderRadius: 20 }}>UNAVAILABLE</div>
            )}
            <div style={{ fontSize: 11, fontWeight: 700, color: tier.color, letterSpacing: "0.08em", marginBottom: 8 }}>{tier.shortLabel.toUpperCase()}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
              <span style={{ fontSize: 32, fontWeight: 900, color: "#fff" }}>{tier.priceDisplay}</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>/ season</span>
            </div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: "0 0 16px", lineHeight: 1.45 }}>{tier.description}</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 8 }}>
              {tier.perks.map(perk => (
                <li key={perk} style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ color: tier.color, flexShrink: 0, fontSize: 10, marginTop: 1 }}>✓</span>
                  {perk}
                </li>
              ))}
            </ul>
            {tier.available ? (
              <Link
                href={seasonPassCheckoutHref(tier)}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "11px", minHeight: "44px", fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", color: tier.entry || tier.popular ? "#050510" : tier.color, background: tier.entry || tier.popular ? tier.color : "transparent", border: `1px solid ${tier.color}`, borderRadius: 8, textDecoration: "none" }}
              >
                GET {tier.shortLabel.toUpperCase()} →
              </Link>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "11px", minHeight: "44px", fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8 }}>
                CURRENTLY UNAVAILABLE
              </div>
            )}
          </div>
        ))}
      </section>

      <section style={{ maxWidth: 960, margin: "40px auto 0", padding: "0 24px" }}>
        <div style={{ fontSize: 9, color: "#FFD700", letterSpacing: "0.3em", fontWeight: 800, marginBottom: 14 }}>🎸 SEASON 1 REWARDS</div>
        <TmiSeasonPassEngine userXpFan={totalXp} userXpArtist={Math.floor(totalXp * 0.6)} />
      </section>

      <section style={{ maxWidth: 680, margin: "48px auto 0", padding: "0 24px", textAlign: "center" }}>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", lineHeight: 1.8 }}>
          Season passes are one-time for Season 1 (April 2026 – March 2027) — not the same as monthly account subscriptions.
          <br />
          Passes are non-transferable. Cancel anytime via account billing for memberships separately.
        </div>
        <div style={{ marginTop: 20, display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/account/subscription" style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>Monthly memberships →</Link>
          <Link href="/earnings" style={{ fontSize: 10, color: "#00FFFF", textDecoration: "none" }}>See how passes affect earnings →</Link>
        </div>
      </section>
    </main>
  );
}
