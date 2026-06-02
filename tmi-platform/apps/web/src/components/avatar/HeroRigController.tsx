"use client";
/**
 * HeroRigController — Asset manager bridging HeroRegistry to the renderer.
 *
 * P11A: Manages CSS/emoji-based representation with signature animation states.
 * P12: Swap renderHero() to load GLB rig from CDN via Three.js / @react-three/fiber.
 *
 * Used by AvatarVenueAnchor and AudienceScene to render hero characters
 * with the correct visual identity.
 */

import { useEffect, useState, useCallback } from "react";
import { getHeroById, type HeroCharacter } from "@/lib/avatar/HeroRegistry";
import { getPresenceForVenue, setHeroAnimState, triggerVenueCelebration } from "@/lib/avatar/HeroPresenceRegistry";

// ── Animation state machine ───────────────────────────────────────────────────
export type HeroAnimState = "idle" | "wave" | "celebrate" | "dance" | "signature_move";

const ANIM_CSS: Record<HeroAnimState, string> = {
  idle:           "heroCtrl_idle 4s ease-in-out infinite",
  wave:           "heroCtrl_wave 1.5s ease-in-out 1",
  celebrate:      "heroCtrl_celebrate 0.4s ease-in-out infinite",
  dance:          "heroCtrl_dance 0.8s ease-in-out infinite",
  signature_move: "heroCtrl_sig 0.6s cubic-bezier(0.34,1.56,0.64,1) 1",
};

// ── Rendered hero unit ────────────────────────────────────────────────────────
export interface RenderedHero {
  hero:      HeroCharacter;
  animState: HeroAnimState;
  size:      number;
  showLabel: boolean;
}

export function renderHero(heroId: string, animState: HeroAnimState = "idle", size = 32): RenderedHero | null {
  const hero = getHeroById(heroId);
  if (!hero) return null;
  return { hero, animState, size, showLabel: false };
}

// ── HeroRigController component ───────────────────────────────────────────────
interface Props {
  heroId:       string;
  venueSlug:    string;
  size?:        number;
  showLabel?:   boolean;
  onAnimate?:   (state: HeroAnimState) => void;
}

export default function HeroRigController({ heroId, venueSlug, size = 40, showLabel = false, onAnimate }: Props) {
  const hero = getHeroById(heroId);
  const [anim, setAnim] = useState<HeroAnimState>("idle");
  const [hovered, setHovered] = useState(false);

  // Sync anim state from presence registry
  useEffect(() => {
    const presences = getPresenceForVenue(venueSlug);
    const p = presences.find(p => p.heroId === heroId);
    if (p) setAnim(p.animState as HeroAnimState);
  }, [heroId, venueSlug]);

  const triggerSignature = useCallback(() => {
    setAnim("signature_move");
    setHeroAnimState(venueSlug, heroId, "signature_move");
    onAnimate?.("signature_move");
    setTimeout(() => {
      setAnim("idle");
      setHeroAnimState(venueSlug, heroId, "idle");
    }, 1500);
  }, [heroId, venueSlug, onAnimate]);

  const triggerCelebrate = useCallback(() => {
    setAnim("celebrate");
    triggerVenueCelebration(venueSlug);
    setTimeout(() => setAnim("idle"), 3000);
  }, [venueSlug]);

  if (!hero) return null;

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <style>{`
        @keyframes heroCtrl_idle      { 0%,100%{transform:scale(1)}    50%{transform:scale(1.05)} }
        @keyframes heroCtrl_wave      { 0%{transform:rotate(0)}       25%{transform:rotate(18deg)} 75%{transform:rotate(-8deg)} 100%{transform:rotate(0)} }
        @keyframes heroCtrl_celebrate { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes heroCtrl_dance     { 0%{transform:rotate(-8deg)}   50%{transform:rotate(8deg)} 100%{transform:rotate(-8deg)} }
        @keyframes heroCtrl_sig       { 0%{transform:scale(0.8) rotate(-10deg)} 60%{transform:scale(1.15) rotate(4deg)} 100%{transform:scale(1) rotate(0)} }
      `}</style>

      {/* Hero body */}
      <button
        onClick={triggerSignature}
        onDoubleClick={triggerCelebrate}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title={`${hero.displayName} · ${hero.signatureMove}`}
        style={{
          position: "relative", width: size, height: size,
          borderRadius: "50%", border: "none", cursor: "pointer",
          background: `radial-gradient(circle, ${hero.accentColor}30, rgba(5,5,16,0.9))`,
          outline: `2px solid ${hovered ? hero.accentColor : hero.accentColor + "44"}`,
          boxShadow: `0 0 ${hovered ? 18 : 8}px ${hero.accentColor}66`,
          transition: "all 0.2s",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: size * 0.55,
          animation: ANIM_CSS[anim],
        }}
      >
        {hero.emoji}
      </button>

      {/* Label */}
      {showLabel && (
        <div style={{ fontSize: 8, fontWeight: 800, color: hero.accentColor, letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
          {hero.shortName}
        </div>
      )}

      {/* Signature move badge */}
      {hovered && (
        <div style={{ position: "absolute", bottom: "110%", left: "50%", transform: "translateX(-50%)", background: `${hero.accentColor}CC`, color: "#000", fontSize: 7, fontWeight: 900, padding: "2px 8px", borderRadius: 10, letterSpacing: "0.08em", whiteSpace: "nowrap", pointerEvents: "none" }}>
          {hero.signatureMove}
        </div>
      )}
    </div>
  );
}
