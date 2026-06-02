"use client";
/**
 * HeroCard — Displays a TMI hero character with XP tier, signature move, and evolution progress.
 * Drop into any profile page, venue sidebar, or audience scene overlay.
 */

import Link from "next/link";
import { getHeroById, resolveEvolutionTier, getXpToNextTier } from "@/lib/avatar/HeroRegistry";
import { TIER_CONFIG as TC } from "@/lib/avatar/AvatarEvolutionEngine";

interface Props {
  heroId:  string;
  xp?:     number;
  compact?: boolean;
  showXp?:  boolean;
}

export default function HeroCard({ heroId, xp = 0, compact = false, showXp = true }: Props) {
  const hero = getHeroById(heroId);
  if (!hero) return null;

  const tier = resolveEvolutionTier(xp);
  const { needed, percent } = getXpToNextTier(xp);
  const tierCfg = TC[tier];

  if (compact) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: `${hero.accentColor}10`, border: `1px solid ${hero.accentColor}33`, borderRadius: 10 }}>
        <span style={{ fontSize: 20 }}>{hero.emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: hero.accentColor }}>{hero.displayName}</div>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)" }}>{hero.role.toUpperCase()} · {hero.signatureMove}</div>
        </div>
        <span style={{ fontSize: 7, fontWeight: 900, color: tierCfg.color, background: tierCfg.bg, padding: "2px 8px", borderRadius: 10 }}>
          {tierCfg.emoji} {tierCfg.label}
        </span>
      </div>
    );
  }

  return (
    <div style={{ background: `linear-gradient(135deg, ${hero.accentColor}10, rgba(5,5,16,0.98))`, border: `2px solid ${hero.accentColor}44`, borderRadius: 18, padding: "20px", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: `${hero.accentColor}22`, border: `2px solid ${hero.accentColor}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>
          {hero.emoji}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 900, lineHeight: 1.2 }}>{hero.displayName}</div>
          <div style={{ fontSize: 9, color: hero.accentColor, fontWeight: 800, letterSpacing: "0.15em", marginTop: 2 }}>
            {hero.role.toUpperCase()} · {hero.rarity.toUpperCase()}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 4, lineHeight: 1.5 }}>{hero.description}</div>
        </div>
      </div>

      {/* Tier badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, padding: "8px 12px", background: tierCfg.bg, border: `1px solid ${tierCfg.color}44`, borderRadius: 10 }}>
        <span style={{ fontSize: 18 }}>{tierCfg.emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: tierCfg.color }}>{tierCfg.label}</div>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)" }}>{xp.toLocaleString()} XP total</div>
        </div>
        {tier !== "Icon" && (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)" }}>{needed.toLocaleString()} to next</div>
          </div>
        )}
      </div>

      {/* XP progress bar */}
      {showXp && tier !== "Icon" && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", background: `linear-gradient(90deg, ${hero.accentColor}, ${hero.accentColor}88)`, borderRadius: 2, width: `${percent}%`, transition: "width 0.6s ease" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 7, color: "rgba(255,255,255,0.3)" }}>
            <span>{tierCfg.label}</span>
            <span>{percent}%</span>
          </div>
        </div>
      )}

      {/* Signature move */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, padding: "8px 12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8 }}>
        <div>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: "0.14em" }}>SIGNATURE MOVE</div>
          <div style={{ fontSize: 11, fontWeight: 800, color: hero.accentColor, marginTop: 2 }}>{hero.signatureMove}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: "0.14em" }}>HOME VENUE</div>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#fff", marginTop: 2 }}>{hero.homeVenue.replace(/-/g, " ").toUpperCase()}</div>
        </div>
      </div>

      {/* CTAs */}
      <div style={{ display: "flex", gap: 8 }}>
        <Link href={`/rooms/${hero.homeVenue}?autoSeat=1`} style={{ flex: 1, padding: "9px 0", borderRadius: 8, background: `linear-gradient(90deg, ${hero.accentColor}, ${hero.accentColor}88)`, color: "#000", fontWeight: 900, fontSize: 10, textDecoration: "none", textAlign: "center", letterSpacing: "0.08em" }}>
          ENTER VENUE →
        </Link>
        <Link href="/avatar-center" style={{ padding: "9px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontWeight: 800, fontSize: 10, textDecoration: "none" }}>
          CUSTOMIZE
        </Link>
      </div>
    </div>
  );
}
