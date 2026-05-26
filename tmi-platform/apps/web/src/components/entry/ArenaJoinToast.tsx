"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ArenaJoinToast() {
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (searchParams?.get("entered") === "1") {
      setVisible(true);
      const fadeTimer = setTimeout(() => setFading(true), 3200);
      const hideTimer = setTimeout(() => setVisible(false), 3800);
      return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer); };
    }
  }, [searchParams]);

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed",
      top: 20,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 9700,
      background: "rgba(5,5,16,0.97)",
      border: "1px solid rgba(0,200,255,0.35)",
      backdropFilter: "blur(12px)",
      padding: "12px 24px",
      display: "flex",
      alignItems: "center",
      gap: 12,
      fontFamily: "'Inter',sans-serif",
      boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,200,255,0.1)",
      opacity: fading ? 0 : 1,
      transition: "opacity 0.6s ease",
      whiteSpace: "nowrap",
    }}>
      <span style={{ fontSize: 18 }}>🎉</span>
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, color: "#00C8FF", letterSpacing: "0.04em" }}>
          You&apos;re in the Arena
        </div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", letterSpacing: "0.08em", marginTop: 2 }}>
          Welcome to the stage · You&apos;re live with the crowd
        </div>
      </div>
      <span style={{
        width: 7, height: 7, borderRadius: "50%",
        background: "#00C896",
        display: "inline-block",
        boxShadow: "0 0 6px #00C896",
        flexShrink: 0,
      }} />
    </div>
  );
}
