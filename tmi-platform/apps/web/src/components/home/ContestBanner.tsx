"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import SectionTitle from "@/components/ui/SectionTitle";
import Link from "next/link";

const DEFAULT_END_MS = Date.now() + 7 * 24 * 60 * 60 * 1000;

const DEFAULT_PRIZES = [
  { place: "1st", prize: "Featured Artist Spotlight + $500 Studio Credit" },
  { place: "2nd", prize: "Magazine Feature + Distribution Deal" },
  { place: "3rd", prize: "Crown Badge + Community Boost" },
];

function useCountdown(targetMs: number) {
  const [rem, setRem] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, targetMs - Date.now());
      setRem({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetMs]);
  return rem;
}

function Digit({ value, label }: { value: number; label: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <motion.div
        key={value}
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
        style={{
          fontSize: 36, fontWeight: 900, color: "#FFD700", lineHeight: 1,
          textShadow: "0 0 20px rgba(255,215,0,0.7), 0 0 40px rgba(255,215,0,0.3)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {String(value).padStart(2, "0")}
      </motion.div>
      <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.2em", color: "rgba(255,215,0,0.5)", textTransform: "uppercase", marginTop: 4 }}>
        {label}
      </div>
    </div>
  );
}

export default function ContestBanner() {
  const [endMs, setEndMs] = useState(DEFAULT_END_MS);
  const [title, setTitle] = useState("Weekly Crown Contest");
  const [prizes, setPrizes] = useState(DEFAULT_PRIZES);

  useEffect(() => {
    fetch("/api/homepage/contest")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: unknown) => {
        if (!data || typeof data !== "object") return;
        const d = data as {
          title?: string;
          endDate?: string | null;
          prizes?: Array<{ place: string; prize: string }>;
        };
        if (d.title) setTitle(d.title);
        if (d.endDate) setEndMs(new Date(d.endDate).getTime());
        if (Array.isArray(d.prizes) && d.prizes.length > 0) setPrizes(d.prizes);
      })
      .catch(() => {});
  }, []);

  const { d, h, m, s } = useCountdown(endMs);

  return (
    <div style={{
      background: "linear-gradient(135deg, #0F0900 0%, #120A00 50%, #0A0A1A 100%)",
      border: "1px solid rgba(255,215,0,0.25)",
      borderRadius: 12,
      padding: "28px 32px",
      marginBottom: 20,
      position: "relative",
      overflow: "hidden",
      boxShadow: "0 0 60px rgba(255,215,0,0.06), 0 0 120px rgba(255,45,170,0.03)",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 18, height: 18, borderTop: "2px solid #FFD700", borderLeft: "2px solid #FFD700" }} />
      <div style={{ position: "absolute", top: 0, right: 0, width: 18, height: 18, borderTop: "2px solid #FFD700", borderRight: "2px solid #FFD700" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, width: 18, height: 18, borderBottom: "2px solid #FFD700", borderLeft: "2px solid #FFD700" }} />
      <div style={{ position: "absolute", bottom: 0, right: 0, width: 18, height: 18, borderBottom: "2px solid #FFD700", borderRight: "2px solid #FFD700" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 400, height: 200, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(255,215,0,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

      <SectionTitle title={title} subtitle="Compete, win, get crowned" accent="gold" badge="OPEN NOW" />

      <div style={{ display: "flex", alignItems: "center", gap: 40, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.2em", color: "rgba(255,215,0,0.5)", textTransform: "uppercase", marginBottom: 12 }}>
            CONTEST CLOSES IN
          </div>
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
            <Digit value={d} label="Days" />
            <div style={{ fontSize: 28, fontWeight: 900, color: "#FFD700", opacity: 0.6, marginTop: 4 }}>:</div>
            <Digit value={h} label="Hours" />
            <div style={{ fontSize: 28, fontWeight: 900, color: "#FFD700", opacity: 0.6, marginTop: 4 }}>:</div>
            <Digit value={m} label="Mins" />
            <div style={{ fontSize: 28, fontWeight: 900, color: "#FFD700", opacity: 0.6, marginTop: 4 }}>:</div>
            <Digit value={s} label="Secs" />
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.2em", color: "rgba(255,215,0,0.5)", textTransform: "uppercase", marginBottom: 10 }}>
            PRIZE POOL
          </div>
          {prizes.map(({ place, prize }) => (
            <div key={place} style={{ display: "flex", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 9, fontWeight: 800, color: "#FFD700", minWidth: 24 }}>{place}</span>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.6)" }}>{prize}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/contest"
              style={{
                display: "block", padding: "14px 32px", fontSize: 11, fontWeight: 900,
                letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none",
                background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                color: "#000", borderRadius: 8,
                boxShadow: "0 0 20px rgba(255,215,0,0.4), 0 4px 20px rgba(0,0,0,0.4)",
                textAlign: "center",
              }}
            >
              Enter Now
            </Link>
          </motion.div>
          <Link href="/winners" style={{ fontSize: 9, color: "rgba(255,215,0,0.6)", textDecoration: "none", textAlign: "center", letterSpacing: "0.1em" }}>
            View Past Winners
          </Link>
        </div>
      </div>
    </div>
  );
}
