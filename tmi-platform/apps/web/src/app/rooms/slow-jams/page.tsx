"use client";

/**
 * /rooms/slow-jams — Sunday Slow Jams official room.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import StageLoader from "@/components/eos/StageLoader";
import { SLOW_JAM_MOTION } from "@/lib/live/ExperiencePersonality";

type ScheduleSnap = { phase: string; label: string; joinable: boolean };

export default function SlowJamsRoomPage() {
  const [schedule, setSchedule] = useState<ScheduleSnap | null>(null);

  useEffect(() => {
    fetch("/api/slow-jams", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { schedule?: ScheduleSnap }) => setSchedule(d.schedule ?? null))
      .catch(() => setSchedule(null));
  }, []);

  const closed = schedule && schedule.phase !== "LIVE";

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 50% 0%, rgba(170,45,255,0.14), transparent 55%), #050510",
        color: "#fff",
        paddingBottom: 24,
      }}
    >
      <div
        style={{
          background: "rgba(0,0,0,0.9)",
          borderBottom: `1px solid ${SLOW_JAM_MOTION.accentPurple}`,
          padding: "10px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link
            href="/explore"
            style={{
              fontSize: 9,
              color: "rgba(255,255,255,0.3)",
              textDecoration: "none",
              letterSpacing: "0.1em",
            }}
          >
            ← EXPLORE
          </Link>
          <div
            style={{
              fontSize: 9,
              letterSpacing: "0.3em",
              fontWeight: 800,
              color: "#AA2DFF",
            }}
          >
            🌙 SUNDAY SLOW JAMS · UNDER THE STARS
          </div>
        </div>
        <Link
          href="/slow-jams/submit"
          style={{ fontSize: 9, color: "#FFD700", textDecoration: "none", fontWeight: 700 }}
        >
          Submit a slow song →
        </Link>
      </div>

      {closed ? (
        <div style={{ maxWidth: 560, margin: "48px auto", padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: 42, marginBottom: 12 }}>🌙</div>
          <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>
            {schedule?.phase === "SUBMIT_OPEN" ? "Recruiting for Sunday" : SLOW_JAM_MOTION.copyClosed}
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 20 }}>
            {schedule?.label ?? "All-day Sunday · America/New_York"}
          </p>
          <Link
            href="/slow-jams/submit"
            style={{
              display: "inline-block",
              padding: "10px 18px",
              borderRadius: 8,
              background: "rgba(170,45,255,0.25)",
              border: "1px solid rgba(170,45,255,0.5)",
              color: "#fff",
              fontSize: 11,
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            SUBMIT TO SUNDAY POOL
          </Link>
        </div>
      ) : (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 16px 0" }}>
          <StageLoader experienceId="slow-jams" roomId="slow-jams" venueId="slow-jams" role="fan" />
        </div>
      )}
    </main>
  );
}
