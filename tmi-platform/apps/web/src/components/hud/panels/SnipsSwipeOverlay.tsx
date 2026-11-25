"use client";

/**
 * SnipsSwipeOverlay — active swipe-up/down discovery (instant mode, not Video Shuffle).
 * Newest-first public catalog; Sponsored Snip via SponsoredSnipInsertionAuthority.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildSnipPool,
  nextSnip,
  prevSnip,
  type SnipReference,
} from "@/lib/discovery/SnipsDiscoveryRuntime";
import {
  decideSponsoredSnipInsertion,
  recordOrganicSnipConsumed,
  type SponsoredSnipCreative,
} from "@/lib/discovery/SponsoredSnipInsertionAuthority";
import SponsoredSnipCard from "@/components/discovery/SponsoredSnipCard";
import { castPlaylistToMonitor } from "@/lib/playlists/PlaylistMonitorCast";
import Link from "next/link";

const SNIPS_RETURN_INDEX_KEY = "tmi_snips_return_index";

export default function SnipsSwipeOverlay({ onClose }: { onClose: () => void }) {
  const pool = useMemo(() => buildSnipPool(), []);
  const [index, setIndex] = useState(0);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [sponsored, setSponsored] = useState<SponsoredSnipCreative | null>(null);
  const [eligibleCampaign, setEligibleCampaign] = useState<SponsoredSnipCreative | null>(null);
  const touchStartY = useRef<number | null>(null);

  const current = pool[index] ?? null;

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SNIPS_RETURN_INDEX_KEY);
      if (raw != null) {
        const restored = Math.max(0, Math.min(Number(raw) || 0, Math.max(pool.length - 1, 0)));
        setIndex(restored);
        sessionStorage.removeItem(SNIPS_RETURN_INDEX_KEY);
      }
    } catch {
      /* ignore */
    }
  }, [pool.length]);

  useEffect(() => {
    let alive = true;
    fetch("/api/ads/sponsored-snip")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!alive) return;
        setEligibleCampaign(data?.creative ?? null);
      })
      .catch(() => {
        if (alive) setEligibleCampaign(null);
      });
    return () => {
      alive = false;
    };
  }, []);

  const playSnip = useCallback((snip: SnipReference) => {
    castPlaylistToMonitor({
      playlistId: "snips-discovery",
      trackId: snip.id,
      title: snip.title,
      artist: snip.attribution,
      videoUrl: snip.videoUrl,
      coverUrl: snip.thumbnailUrl,
      targetMonitorId: "mon-a",
    });
  }, []);

  useEffect(() => {
    if (current && !sponsored) playSnip(current);
  }, [current, playSnip, sponsored]);

  const trySponsoredAfterOrganic = useCallback(() => {
    recordOrganicSnipConsumed();
    const decision = decideSponsoredSnipInsertion({
      hasAdConsent: true,
      eligibleCampaign,
    });
    if (decision.action === "INSERT_SPONSORED_SNIP") {
      setSponsored(decision.creative);
      return true;
    }
    setSponsored(null);
    return false;
  }, [eligibleCampaign]);

  const goNext = () => {
    if (sponsored) {
      setSponsored(null);
      return;
    }
    if (trySponsoredAfterOrganic()) return;
    const r = nextSnip(pool, index, recentIds);
    setIndex(r.index);
    setRecentIds(r.recentIds);
  };

  const goPrev = () => {
    if (sponsored) {
      setSponsored(null);
      return;
    }
    const r = prevSnip(pool, index);
    setIndex(r.index);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0]?.clientY ?? null;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartY.current;
    if (start == null) return;
    const end = e.changedTouches[0]?.clientY ?? start;
    const delta = start - end;
    if (delta > 40) goNext();
    else if (delta < -40) goPrev();
    touchStartY.current = null;
  };

  return (
    <div
      role="dialog"
      aria-label="Snips discovery"
      data-testid="snips-swipe-overlay"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9370,
        background: "rgba(2,4,12,0.92)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        fontFamily: "'Inter', sans-serif",
        color: "#fff",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          right: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 10, fontWeight: 900, color: "#FFD700", letterSpacing: "0.12em" }}>
          SNIPS · SWIPE ↑↓
        </span>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 8,
            color: "#fff",
            padding: "4px 10px",
            fontSize: 9,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          EXIT
        </button>
      </div>

      {sponsored ? (
        <div style={{ width: "100%", maxWidth: 360, maxHeight: "70dvh" }}>
          <SponsoredSnipCard
            creative={sponsored}
            onSkip={() => setSponsored(null)}
            onCtaIntentionalClick={() => {
              try {
                sessionStorage.setItem(SNIPS_RETURN_INDEX_KEY, String(index));
              } catch {
                /* ignore */
              }
            }}
          />
        </div>
      ) : pool.length === 0 ? (
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", textAlign: "center", maxWidth: 280 }}>
          No public snips available yet. Published member Snips appear here newest-first.
        </div>
      ) : current ? (
        <div style={{ textAlign: "center", maxWidth: 360, width: "100%" }}>
          <div
            style={{
              width: "100%",
              aspectRatio: "9/16",
              maxHeight: "50dvh",
              borderRadius: 12,
              border: "1px solid rgba(255,215,0,0.35)",
              background: current.thumbnailUrl
                ? `url(${current.thumbnailUrl}) center/cover`
                : "linear-gradient(135deg,#AA2DFF,#FF2DAA)",
              marginBottom: 12,
              boxShadow: "0 0 24px rgba(255,215,0,0.2)",
            }}
          />
          <div style={{ fontSize: 14, fontWeight: 900 }}>{current.title}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{current.subtitle}</div>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>{current.attribution}</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 14, flexWrap: "wrap" }}>
            <button type="button" onClick={goPrev} style={snipBtn("#00FFFF")}>
              ↑ PREV
            </button>
            <button type="button" onClick={goNext} style={snipBtn("#FFD700")}>
              ↓ NEXT
            </button>
            <Link href={current.destinationHref} style={{ ...snipBtn("#FF2DAA"), textDecoration: "none" }}>
              OPEN SOURCE
            </Link>
          </div>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", marginTop: 10 }}>
            {index + 1} / {pool.length} · newest first · permanent catalog
          </div>
        </div>
      ) : null}
    </div>
  );
}

function snipBtn(color: string): React.CSSProperties {
  return {
    fontSize: 8,
    fontWeight: 900,
    padding: "6px 12px",
    borderRadius: 8,
    border: `1px solid ${color}`,
    background: `${color}18`,
    color,
    cursor: "pointer",
  };
}
