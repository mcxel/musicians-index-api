"use client";

import { useEffect, useState } from "react";

type CountdownPremiereCardProps = {
  label: string;
  minutesFromNow: number;
};

export default function CountdownPremiereCard({ label, minutesFromNow }: CountdownPremiereCardProps) {
  const [secondsLeft, setSecondsLeft] = useState(minutesFromNow * 60);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const mins = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, "0");
  const secs = (secondsLeft % 60).toString().padStart(2, "0");

  return (
    <div style={{ borderRadius: 12, border: "1px solid rgba(45,212,191,0.42)", padding: 12, background: "rgba(6,22,22,0.8)", display: "grid", gap: 6 }}>
      <div style={{ fontSize: 10, color: "#a7f3d0", textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 900 }}>Premiere Countdown</div>
      <div style={{ color: "#fff", fontWeight: 900, fontSize: 16 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 900, color: "#2dd4bf", letterSpacing: "0.08em" }}>{mins}:{secs}</div>
    </div>
  );
}
