"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface SponsorAsset {
  id: string;
  name: string;
  logoUrl?: string;
  tagline?: string;
  primaryColor?: string;
  promoUrl?: string;
}

interface SponsorGhostPanelProps {
  sponsors: SponsorAsset[];
  isOpen: boolean;
  onClose?: () => void;
  autoDismissMs?: number; // default 8000
}

let cssInjected = false;
const GHOST_CSS = `
@keyframes ghostSlideIn {
  from { transform: translateX(-110%); opacity: 0; }
  to   { transform: translateX(0);     opacity: 1; }
}
@keyframes ghostSlideOut {
  from { transform: translateX(0);     opacity: 1; }
  to   { transform: translateX(-110%); opacity: 0; }
}
@keyframes ghostBreath {
  0%,100% { opacity: 0.85; }
  50%      { opacity: 0.65; }
}
`;

export default function SponsorGhostPanel({
  sponsors,
  isOpen,
  onClose,
  autoDismissMs = 8000,
}: SponsorGhostPanelProps) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!cssInjected && typeof document !== "undefined") {
      cssInjected = true;
      const s = document.createElement("style");
      s.textContent = GHOST_CSS;
      document.head.appendChild(s);
    }
  }, []);

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => { setVisible(false); setExiting(false); onClose?.(); }, 420);
  }, [onClose]);

  useEffect(() => {
    if (isOpen && sponsors.length > 0) {
      setVisible(true);
      setExiting(false);
      setActive(0);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(dismiss, autoDismissMs);
    } else if (!isOpen && visible) {
      dismiss();
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isOpen, sponsors.length, autoDismissMs, dismiss, visible]);

  if (!visible || sponsors.length === 0) return null;

  const sponsor = sponsors[active % sponsors.length];
  const color = sponsor?.primaryColor ?? "#00e5ff";

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 7500,
        width: 180,
        animation: exiting ? "ghostSlideOut 0.4s ease-in forwards" : "ghostSlideIn 0.4s ease-out",
      }}
    >
      <div
        style={{
          background: "rgba(0,0,0,0.22)",
          backdropFilter: "blur(14px)",
          border: `1px solid ${color}33`,
          borderLeft: "none",
          borderRadius: "0 12px 12px 0",
          padding: "14px 16px 14px 20px",
          animation: "ghostBreath 4s ease-in-out infinite",
        }}
      >
        {/* Sponsor card */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", fontWeight: 800, letterSpacing: "0.2em", marginBottom: 6 }}>
            SPONSOR
          </div>
          {sponsor?.logoUrl ? (
            <img src={sponsor.logoUrl} alt={sponsor.name} style={{ maxWidth: 100, maxHeight: 36, objectFit: "contain", filter: "brightness(1.2)" }} />
          ) : (
            <div style={{ color, fontWeight: 900, fontSize: 13 }}>{sponsor?.name}</div>
          )}
          {sponsor?.tagline && (
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 9, marginTop: 4, lineHeight: 1.4 }}>
              {sponsor.tagline}
            </div>
          )}
        </div>

        {/* Multi-sponsor dots */}
        {sponsors.length > 1 && (
          <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
            {sponsors.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                style={{
                  width: i === active % sponsors.length ? 16 : 6,
                  height: 6,
                  borderRadius: 3,
                  border: "none",
                  background: i === active % sponsors.length ? color : "rgba(255,255,255,0.2)",
                  cursor: "pointer",
                  transition: "width 0.2s, background 0.2s",
                  padding: 0,
                }}
              />
            ))}
          </div>
        )}

        {/* Next / Dismiss */}
        <div style={{ display: "flex", gap: 6 }}>
          {sponsors.length > 1 && (
            <button
              onClick={() => setActive(a => a + 1)}
              style={{
                flex: 1, padding: "5px 0", fontSize: 9, fontWeight: 800,
                background: `${color}22`, border: `1px solid ${color}44`,
                borderRadius: 6, color, cursor: "pointer",
              }}
            >
              Next ›
            </button>
          )}
          <button
            onClick={dismiss}
            style={{
              flex: 1, padding: "5px 0", fontSize: 9, fontWeight: 800,
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 6, color: "rgba(255,255,255,0.4)", cursor: "pointer",
            }}
          >
            Hide
          </button>
        </div>
      </div>
    </div>
  );
}
