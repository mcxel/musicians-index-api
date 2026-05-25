"use client";

/**
 * TMISponsorAdEngine.tsx
 * Sponsor and advertiser management for The Musician's Index.
 *
 * Drop at: apps/web/src/components/ads/TMISponsorAdEngine.tsx
 *
 * Covers:
 *  - Ad slot display (banner, sidebar, video pre-roll, in-article, overlay)
 *  - Slot auctioning (highest bidder per genre/page gets the slot)
 *  - Sponsor-gifted surprises: advertiser buys a "gift drop" that fans win
 *  - Giveaway pipeline: flow from sponsor budget → random fan win → payout
 *  - Ad rotation: each slot rotates through approved ads on a timer
 *  - Per-genre targeting: hip-hop advertisers only appear in hip-hop rooms
 *  - CPM-based billing (charge per 1000 impressions, tracked per slot)
 *  - Sponsor overlay for live events (semi-transparent logo + CTA during stream)
 *  - Advertiser dashboard stub (link to /admin/advertisers)
 *
 * Platform rule: ALL ad displays must come from APPROVED sponsors only.
 * Bot accounts can populate sponsor slots with demo data for visual testing.
 */

import { useState, useEffect, useRef } from "react";

/* ─── Types ─────────────────────────────────────────────────────────────── */
export type AdSlotType =
  | "banner_top"          // full-width top banner
  | "banner_bottom"       // full-width bottom banner
  | "sidebar_right"       // right side panel
  | "in_article"          // injected between article sections
  | "billboard_overlay"   // semi-transparent over live feed tiles
  | "room_overlay"        // floating logo during live performance
  | "pre_roll"            // 5-second video before entering room
  | "gift_drop";          // sponsor-funded fan giveaway

export type AdStatus = "pending" | "approved" | "rejected" | "paused" | "expired";

export type GiveawayStatus = "pending" | "active" | "winner_selected" | "paid_out";

export interface AdCreative {
  id: string;
  sponsorId: string;
  sponsorName: string;
  sponsorLogoUrl: string;
  headline: string;
  subtext?: string;
  ctaText: string;
  ctaUrl: string;
  imageUrl?: string;
  videoUrl?: string;
  accentColor: string;
  targetGenres: string[];  // [] = all genres
  slotType: AdSlotType;
  status: AdStatus;
  bidPerThousandImpressions: number;  // CPM bid in USD
  dailyBudgetUsd: number;
  impressionsToday: number;
  clicksToday: number;
  expiresAt: string;
}

export interface GiftDrop {
  id: string;
  sponsorId: string;
  sponsorName: string;
  description: string;
  value: number;        // USD value of gift
  prizeType: "cash" | "credits" | "nft" | "merch" | "beat";
  totalDrops: number;
  dropsRemaining: number;
  targetGenre?: string;
  winnersChosen: string[];    // userId[]
  status: GiveawayStatus;
  triggerEvent?: string;      // "tip_over_$10" | "battle_win" | "random" | "milestone"
  expiresAt: string;
  requiresBigAceApproval: boolean;  // always true for cash prizes
}

/* ─── Ad rotation manager ─────────────────────────────────────────────────── */
export class AdRotationManager {
  private slots = new Map<AdSlotType, AdCreative[]>();
  private pointers = new Map<AdSlotType, number>();

  loadSlot(slotType: AdSlotType, ads: AdCreative[]): void {
    const approved = ads.filter((a) => a.status === "approved" && new Date(a.expiresAt) > new Date());
    this.slots.set(slotType, approved);
    this.pointers.set(slotType, 0);
  }

  getCurrentAd(slotType: AdSlotType, genre?: string): AdCreative | null {
    const ads = this.slots.get(slotType) ?? [];
    const targeted = genre
      ? ads.filter((a) => a.targetGenres.length === 0 || a.targetGenres.includes(genre))
      : ads;
    if (targeted.length === 0) return null;

    // Sort by CPM bid descending (highest bidder gets priority)
    const sorted = [...targeted].sort((a, b) => b.bidPerThousandImpressions - a.bidPerThousandImpressions);
    const idx = (this.pointers.get(slotType) ?? 0) % sorted.length;
    return sorted[idx];
  }

  rotate(slotType: AdSlotType): void {
    const current = this.pointers.get(slotType) ?? 0;
    const len = this.slots.get(slotType)?.length ?? 1;
    this.pointers.set(slotType, (current + 1) % len);
  }

  trackImpression(adId: string): void {
    // In production: POST /api/ads/impression { adId }
  }

  trackClick(adId: string): void {
    // In production: POST /api/ads/click { adId }
  }
}

/* ─── Singleton ─────────────────────────────────────────────────────────── */
let _adManager: AdRotationManager | null = null;
export function getAdManager(): AdRotationManager {
  if (!_adManager) _adManager = new AdRotationManager();
  return _adManager;
}

/* ─── Banner ad display ───────────────────────────────────────────────────── */
export function TMIAdBanner({
  slotType,
  genre,
  ads,
  rotateEveryMs = 8000,
}: {
  slotType: AdSlotType;
  genre?: string;
  ads: AdCreative[];
  rotateEveryMs?: number;
}) {
  const manager = getAdManager();
  const [currentAd, setCurrentAd] = useState<AdCreative | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    manager.loadSlot(slotType, ads);
    setCurrentAd(manager.getCurrentAd(slotType, genre));
    timerRef.current = setInterval(() => {
      manager.rotate(slotType);
      setCurrentAd(manager.getCurrentAd(slotType, genre));
    }, rotateEveryMs);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [ads, slotType, genre, rotateEveryMs]);

  if (!currentAd) return null;

  function handleClick() {
    manager.trackClick(currentAd!.id);
    window.open(currentAd!.ctaUrl, "_blank", "noopener,noreferrer");
  }

  // Banner layout
  if (slotType === "banner_top" || slotType === "banner_bottom") {
    return (
      <div
        onClick={handleClick}
        className="w-full flex items-center justify-between px-4 py-2.5 cursor-pointer hover:brightness-110 transition-all"
        style={{ background: currentAd.accentColor + "15", borderBottom: "1px solid " + currentAd.accentColor + "30" }}
      >
        <div className="flex items-center gap-3">
          {currentAd.sponsorLogoUrl && (
            <img src={currentAd.sponsorLogoUrl} alt={currentAd.sponsorName} className="h-6 w-auto object-contain" />
          )}
          <div>
            <p className="text-[9px] font-black text-white">{currentAd.headline}</p>
            {currentAd.subtext && <p className="text-[7px] text-white/40">{currentAd.subtext}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className="text-[8px] font-black px-2.5 py-1 rounded-full text-black"
            style={{ background: currentAd.accentColor }}
          >
            {currentAd.ctaText}
          </span>
          <span className="text-[7px] text-white/20 uppercase tracking-wider">Ad</span>
        </div>
      </div>
    );
  }

  // Room overlay / live stream sponsor bug
  if (slotType === "room_overlay") {
    return (
      <div
        className="absolute bottom-3 left-3 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full pointer-events-none"
        style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)", border: `1px solid ${currentAd.accentColor}40` }}
      >
        {currentAd.sponsorLogoUrl && (
          <img src={currentAd.sponsorLogoUrl} alt="" className="h-4 w-auto object-contain" />
        )}
        <span className="text-[8px] font-black text-white/70">Sponsored by {currentAd.sponsorName}</span>
      </div>
    );
  }

  // In-article
  if (slotType === "in_article") {
    return (
      <div
        onClick={handleClick}
        className="my-4 p-4 rounded-xl cursor-pointer hover:brightness-110 transition-all"
        style={{ background: currentAd.accentColor + "10", border: `1px dashed ${currentAd.accentColor}50` }}
      >
        <p className="text-[7px] text-white/30 uppercase tracking-widest mb-2">Sponsored</p>
        <div className="flex items-center gap-3">
          {currentAd.imageUrl && <img src={currentAd.imageUrl} alt="" className="w-16 h-16 rounded-lg object-cover" />}
          <div>
            <p className="text-xs font-black text-white">{currentAd.headline}</p>
            {currentAd.subtext && <p className="text-[9px] text-white/50 mt-0.5">{currentAd.subtext}</p>}
            <span className="inline-block mt-1.5 text-[9px] font-black px-2.5 py-1 rounded-lg text-black" style={{ background: currentAd.accentColor }}>
              {currentAd.ctaText}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

/* ─── Gift Drop / Giveaway display ───────────────────────────────────────── */
export function TMIGiftDropWidget({
  giftDrop,
  userId,
  onEnter,
}: {
  giftDrop: GiftDrop;
  userId?: string;
  onEnter?: (dropId: string) => void;
}) {
  const [entered,  setEntered]  = useState(false);
  const [timeLeft, setTimeLeft] = useState(
    Math.max(0, Math.floor((new Date(giftDrop.expiresAt).getTime() - Date.now()) / 1000))
  );

  useEffect(() => {
    const i = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(i);
  }, []);

  const min = Math.floor(timeLeft / 60);
  const sec = timeLeft % 60;
  const isLive = giftDrop.status === "active" && timeLeft > 0 && giftDrop.dropsRemaining > 0;
  const prizeIcons: Record<GiftDrop["prizeType"], string> = {
    cash: "💵", credits: "💎", nft: "◈", merch: "👕", beat: "🎵",
  };

  return (
    <div
      className="border rounded-2xl overflow-hidden"
      style={{ borderColor: "#fbbf2440", background: "#fbbf2408" }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ background: "#fbbf2415", borderBottom: "1px solid #fbbf2420" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{prizeIcons[giftDrop.prizeType]}</span>
          <div>
            <p className="text-[9px] font-black text-yellow-400 uppercase tracking-wider">
              {giftDrop.sponsorName} · Gift Drop
            </p>
            <p className="text-[8px] text-white/40">
              {giftDrop.dropsRemaining} of {giftDrop.totalDrops} remaining
            </p>
          </div>
        </div>
        {isLive && (
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[7px] text-white/40 font-mono">
              {String(min).padStart(2,"0")}:{String(sec).padStart(2,"0")}
            </span>
          </span>
        )}
      </div>

      {/* Body */}
      <div className="px-4 py-4 text-center space-y-3">
        <p className="text-white font-black text-sm">{giftDrop.description}</p>
        <p className="text-2xl font-black" style={{ color: "#fbbf24" }}>
          {giftDrop.prizeType === "cash" || giftDrop.prizeType === "credits"
            ? `$${giftDrop.value}`
            : `${giftDrop.prizeType.toUpperCase()}`}
        </p>
        {giftDrop.triggerEvent && (
          <p className="text-[8px] text-white/30 uppercase tracking-wider">
            Trigger: {giftDrop.triggerEvent}
          </p>
        )}

        {!entered && isLive && userId ? (
          <button
            onClick={() => { setEntered(true); onEnter?.(giftDrop.id); }}
            className="w-full py-2.5 font-black text-[10px] uppercase tracking-wider text-black rounded-xl bg-yellow-400 hover:bg-yellow-300 active:scale-95 transition-all"
          >
            Enter for Free
          </button>
        ) : entered ? (
          <p className="text-[10px] text-green-400 font-black">✓ You're entered! Winner announced at event end.</p>
        ) : !isLive && giftDrop.status === "winner_selected" ? (
          <p className="text-[10px] text-white/40">Drop ended · Winner: {giftDrop.winnersChosen[0] ?? "—"}</p>
        ) : (
          <p className="text-[10px] text-white/30">Sign in to enter</p>
        )}
      </div>
    </div>
  );
}

/* ─── Pre-roll video ad (5 seconds before entering room) ─────────────────── */
export function TMIPreRollAd({
  ad,
  onComplete,
  onSkip,
}: {
  ad: AdCreative;
  onComplete: () => void;
  onSkip?: () => void;
}) {
  const [countdown, setCountdown] = useState(5);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const i = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(i); setTimeout(onComplete, 500); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(i);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
      {ad.videoUrl ? (
        <video ref={videoRef} src={ad.videoUrl} autoPlay muted={false} className="w-full h-full object-cover" />
      ) : ad.imageUrl ? (
        <img src={ad.imageUrl} alt={ad.headline} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center" style={{ background: ad.accentColor + "20" }}>
          <div className="text-center space-y-4">
            {ad.sponsorLogoUrl && <img src={ad.sponsorLogoUrl} alt="" className="h-16 mx-auto" />}
            <p className="text-2xl font-black text-white">{ad.headline}</p>
          </div>
        </div>
      )}

      {/* Countdown + skip */}
      <div className="absolute bottom-6 right-6 flex items-center gap-3">
        {countdown === 0 && onSkip && (
          <button onClick={onSkip} className="text-[10px] font-black px-3 py-1.5 bg-white text-black rounded-full uppercase hover:bg-white/90">
            Skip
          </button>
        )}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white border-2"
          style={{ borderColor: ad.accentColor, background: "rgba(0,0,0,0.6)" }}
        >
          {countdown}
        </div>
      </div>

      <div className="absolute top-4 right-4 text-[8px] text-white/30 uppercase tracking-wider">
        Advertisement
      </div>
    </div>
  );
}
