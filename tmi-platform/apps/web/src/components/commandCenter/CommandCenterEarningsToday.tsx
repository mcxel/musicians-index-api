"use client";

/**
 * Status-bar "earned today" indicator — sits immediately left of the
 * Monitor 1/2 selector (Marcel, 2026-09-16 voice note). Real data only
 * (GET /api/account/earnings-today, backed by Wallet/WalletTransaction) —
 * an honest $0.00 until real tips/sales land, never a fabricated number.
 */

import { useEffect, useRef, useState } from "react";

const GREEN = "#00FF88";

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function CommandCenterEarningsToday() {
  const [cents, setCents] = useState<number | null>(null);
  const [displayCents, setDisplayCents] = useState(0);
  const [popup, setPopup] = useState<string | null>(null);
  const hasLoadedOnce = useRef(false);
  const popupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch("/api/account/earnings-today", {
          cache: "no-store",
          credentials: "include",
        });
        const data = await res.json();
        if (cancelled || !data?.authenticated) return;
        setCents((prev) => {
          const next = typeof data.todayCents === "number" ? data.todayCents : 0;
          if (prev != null && next > prev && hasLoadedOnce.current) {
            setPopup(`Today you've made ${formatCents(next)}`);
            if (popupTimer.current) clearTimeout(popupTimer.current);
            popupTimer.current = setTimeout(() => setPopup(null), 3800);
          }
          hasLoadedOnce.current = true;
          return next;
        });
      } catch {
        // silent — honest last-known value stays, no fake update
      }
    };

    poll();
    const interval = setInterval(poll, 45000);
    return () => {
      cancelled = true;
      clearInterval(interval);
      if (popupTimer.current) clearTimeout(popupTimer.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Count-up fill animation from the previously displayed value to the new one.
  useEffect(() => {
    if (cents == null) return;
    const start = displayCents;
    const end = cents;
    if (start === end) return;
    const duration = 700;
    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayCents(Math.round(start + (end - start) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cents]);

  if (cents == null) return null;

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      <div
        title="Earned today"
        data-testid="hub-earnings-today"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 3,
          background: "rgba(0,255,136,0.08)",
          border: `1px solid ${GREEN}44`,
          borderRadius: 6,
          padding: "3px 7px",
          fontFamily: "'Orbitron', sans-serif",
        }}
      >
        <span style={{ fontSize: 9, fontWeight: 900, color: GREEN }}>{formatCents(displayCents)}</span>
      </div>
      {popup ? (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            whiteSpace: "nowrap",
            background: "rgba(5,10,8,0.95)",
            border: `1px solid ${GREEN}66`,
            borderRadius: 6,
            padding: "5px 10px",
            fontSize: 10,
            fontWeight: 700,
            color: GREEN,
            zIndex: 50,
            animation: "tmiEarningsPopupIn 0.25s ease",
            pointerEvents: "none",
          }}
        >
          {popup}
          <style jsx>{`
            @keyframes tmiEarningsPopupIn {
              from { opacity: 0; transform: translateY(-4px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      ) : null}
    </div>
  );
}
