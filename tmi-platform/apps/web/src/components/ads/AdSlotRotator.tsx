"use client";
import React, { useEffect, useState } from "react";
import type { Ad, AdPlacement } from "@/lib/advertiser/AdRotationEngine";
import { ImageSlotWrapper } from '@/components/visual-enforcement';

interface AdSlotRotatorProps {
  ads: Ad[];
  placement: AdPlacement;
  rotationIntervalSec?: number;
  onImpression?: (adId: string) => void;
  onClickAd?: (ad: Ad) => void;
}

export function AdSlotRotator({
  ads,
  placement,
  rotationIntervalSec = 15,
  onImpression,
  onClickAd,
}: AdSlotRotatorProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [fading, setFading] = useState(false);

  const activeAds = ads.filter((a) => a.active && a.placement === placement);

  useEffect(() => {
    if (activeAds.length <= 1) return;

    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setCurrentIdx((prev) => (prev + 1) % activeAds.length);
        setFading(false);
      }, 300);
    }, rotationIntervalSec * 1000);

    return () => clearInterval(interval);
  }, [activeAds.length, rotationIntervalSec]);

  useEffect(() => {
    const current = activeAds[currentIdx];
    if (current) onImpression?.(current.adId);
  }, [currentIdx]);

  const current = activeAds[currentIdx];

  if (!current) {
    return null; // No ads for this slot
  }

  return (
    <div
      onClick={() => onClickAd?.(current)}
      style={{
        cursor: "pointer",
        opacity: fading ? 0 : 1,
        transition: "opacity 0.3s ease",
        position: "relative",
        overflow: "hidden",
        borderRadius: 10,
        border: "1px solid rgba(51,65,85,0.5)",
        background: "rgba(15,23,42,0.8)",
      }}
    >
      {current.media.type === "image" && (
        <ImageSlotWrapper imageId="img-6n3amn" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />
      )}

      {current.media.type === "html_embed" && (
        <div dangerouslySetInnerHTML={{ __html: current.media.url }} />
      )}

      <div
        style={{
          padding: "8px 12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>{current.title}</div>
          <div style={{ fontSize: 10, color: "#64748b" }}>Sponsored by {current.sponsorName}</div>
        </div>
        <div
          style={{
            background: "rgba(51,65,85,0.5)",
            padding: "2px 8px",
            borderRadius: 10,
            fontSize: 9,
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Ad
        </div>
      </div>

      {/* Dot indicators */}
      {activeAds.length > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: 6,
            right: 12,
            display: "flex",
            gap: 4,
          }}
        >
          {activeAds.map((_, i) => (
            <div
              key={i}
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: i === currentIdx ? "#00ff88" : "rgba(51,65,85,0.7)",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
