"use client";

/**
 * Performer money display. Totals come from GET /api/account/earnings-today
 * (completed WalletTransaction credits, UTC day). The roll animates toward
 * that server total and never adds a local balance.
 */

import { useEffect, useRef, useState } from "react";

const GREEN = "#00FF88";

type Newest = { id: string; netAmount: number; category: string; createdAt: string };
type LastEarnings = { cents: number; date: string };
type Mode = "empty" | "last" | "today";

type Payload = {
  authenticated?: boolean;
  todayCents?: number;
  lastEarnings?: LastEarnings | null;
  newestToday?: Newest | null;
};

function formatCents(cents: number): string {
  return `$${(Math.max(0, cents) / 100).toFixed(2)}`;
}

function sourceLabel(category: string): string {
  if (category === "CREDIT_TIP") return "TIP";
  if (category === "CREDIT_BEAT_SALE") return "SALE";
  return category.replace(/^CREDIT_/, "").replace(/_/g, " ");
}

function periodLabel(isoDate: string): string {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  if (isoDate === yesterday.toISOString().slice(0, 10)) return "Yesterday";
  const [, month, day] = isoDate.split("-").map(Number);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[(month ?? 1) - 1]} ${day ?? ""}`.trim();
}

function DigitRoll({ value, reduce }: { value: string; reduce: boolean }) {
  return (
    <span aria-hidden style={{ display: "inline-flex", alignItems: "flex-end" }}>
      {value.split("").map((char, index) => {
        const digit = /\d/.test(char) ? Number(char) : null;
        if (digit == null || reduce) {
          return <span key={`${index}-${char}`}>{char}</span>;
        }
        return (
          <span key={index} style={{ display: "inline-block", height: "1em", overflow: "hidden", lineHeight: 1 }}>
            <span style={{ display: "block", transform: `translateY(-${digit}em)`, transition: "transform 280ms linear" }}>
              {"0123456789".split("").map((n) => (
                <span key={n} style={{ display: "block", height: "1em" }}>{n}</span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}

export default function CommandCenterEarningsToday() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [shownCents, setShownCents] = useState(0);
  const [dateLabel, setDateLabel] = useState<string | null>(null);
  const [incoming, setIncoming] = useState<string | null>(null);
  const [rolling, setRolling] = useState(false);
  const [reduce, setReduce] = useState(false);
  const applied = useRef<{ mode: Mode; cents: number; newestId: string | null } | null>(null);
  const popupTimer = useRef<number | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch("/api/account/earnings-today", { cache: "no-store", credentials: "include" });
        const data = (await res.json()) as Payload;
        if (cancelled || !data.authenticated) return;
        const todayCents = typeof data.todayCents === "number" ? data.todayCents : 0;
        const last = data.lastEarnings ?? null;
        const newest = data.newestToday ?? null;
        const nextMode: Mode = todayCents > 0 ? "today" : last ? "last" : "empty";
        const prev = applied.current;
        const staticCents = nextMode === "today" ? todayCents : nextMode === "last" && last ? last.cents : 0;

        if (!prev || nextMode !== "today") {
          setMode(nextMode);
          setShownCents(staticCents);
          setDateLabel(nextMode === "last" && last ? periodLabel(last.date) : null);
          setRolling(false);
          if (nextMode !== "today") setIncoming(null);
          applied.current = { mode: nextMode, cents: staticCents, newestId: nextMode === "today" ? newest?.id ?? null : null };
          return;
        }

        const sameTick = prev.cents === todayCents && prev.newestId === (newest?.id ?? null);
        if (sameTick) return;

        const startingPeriod = prev.mode !== "today";
        const from = startingPeriod ? 0 : prev.cents;
        const delta = todayCents - from;
        const single = Boolean(newest && newest.netAmount === delta);
        if (delta > 0 && newest && prev.newestId !== newest.id) {
          setIncoming(single ? `${sourceLabel(newest.category)} +${formatCents(newest.netAmount)}` : `+${formatCents(delta)}`);
          if (popupTimer.current) window.clearTimeout(popupTimer.current);
          popupTimer.current = window.setTimeout(() => setIncoming(null), 2800);
        }
        setMode("today");
        setDateLabel(null);
        applied.current = { mode: "today", cents: todayCents, newestId: newest?.id ?? null };
        if (reduce) {
          setRolling(false);
          setShownCents(todayCents);
          return;
        }
        setRolling(true);
        if (startingPeriod) setShownCents(0);
        window.requestAnimationFrame(() => setShownCents(todayCents));
        window.setTimeout(() => setRolling(false), 360);
      } catch {
        /* keep the last server total */
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 45000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      if (popupTimer.current) window.clearTimeout(popupTimer.current);
    };
  }, [reduce]);

  if (mode == null) return null;

  const label = mode === "today" ? "MADE TODAY" : mode === "last" ? "LAST EARNINGS" : "No earnings yet";
  const amount = mode === "empty" ? null : formatCents(shownCents);

  return (
    <>
      <a
        href="/dashboard/performer/earnings"
        data-testid="hub-earnings-today"
        data-earnings-mode={mode}
        data-earnings-rolling={rolling ? "1" : "0"}
        title={mode === "today" ? "Made today. Not withdrawable cash." : label}
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(0,255,136,0.08)",
          border: `1px solid ${GREEN}44`,
          borderRadius: 6,
          padding: "3px 7px",
          color: GREEN,
          cursor: "pointer",
          fontFamily: "inherit",
          pointerEvents: "auto",
          textDecoration: "none",
          boxShadow: rolling ? `0 0 10px ${GREEN}88` : "none",
          transition: "box-shadow 280ms linear",
        }}
      >
        <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.08em" }}>{label}</span>
        {dateLabel ? <span style={{ fontSize: 8, fontWeight: 700 }}>{dateLabel}</span> : null}
        {amount ? <DigitRoll value={amount} reduce={reduce || !rolling} /> : null}
        <span className="sr-only" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}>
          {amount ?? label}
        </span>
        {incoming ? (
          <span
            data-testid="hub-earnings-incoming"
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              whiteSpace: "nowrap",
              background: "rgba(5,10,8,0.95)",
              border: `1px solid ${GREEN}66`,
              borderRadius: 6,
              padding: "4px 8px",
              fontSize: 10,
              fontWeight: 800,
              zIndex: 5,
              pointerEvents: "none",
            }}
          >
            {incoming}
          </span>
        ) : null}
      </a>
    </>
  );
}
