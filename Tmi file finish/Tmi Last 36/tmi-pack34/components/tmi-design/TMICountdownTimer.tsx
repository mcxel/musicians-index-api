// apps/web/src/components/tmi-design/TMICountdownTimer.tsx
"use client";
import { useEffect, useState } from "react";

interface Props { targetDate?: Date; label?: string; }

function pad(n: number) { return String(n).padStart(2, "0"); }

export function TMICountdownTimer({ targetDate, label = "COUNTDOWN" }: Props) {
  const [display, setDisplay] = useState("00:00:00:00");

  useEffect(() => {
    const tick = () => {
      if (targetDate) {
        const diff = Math.max(0, targetDate.getTime() - Date.now());
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setDisplay(`${pad(d)}:${pad(h)}:${pad(m)}:${pad(s)}`);
      } else {
        const now = new Date();
        const ms = String(Math.floor(now.getMilliseconds() / 10)).padStart(2, "0");
        setDisplay(`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}:${ms}`);
      }
    };
    tick();
    const t = setInterval(tick, targetDate ? 1000 : 100);
    return () => clearInterval(t);
  }, [targetDate]);

  return (
    <div>
      <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 10, color: "#7A5F9A", letterSpacing: 2, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 36, color: "#00E5FF", letterSpacing: 4, lineHeight: 1 }}>{display}</div>
      <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 9, color: "#7A5F9A", letterSpacing: 1, marginTop: 2 }}>DD · HH · MM · SS</div>
    </div>
  );
}
