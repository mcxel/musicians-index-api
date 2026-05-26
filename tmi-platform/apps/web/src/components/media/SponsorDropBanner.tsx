"use client";

interface DropInfo {
  sponsorName: string;
  prizeName: string;
  triggerDesc: string;
  dropId: string;
  userId?: string;
}

interface SponsorDropBannerProps {
  drop: DropInfo | null;
}

export default function SponsorDropBanner({ drop }: SponsorDropBannerProps) {
  if (!drop) return null;

  async function handleEnter() {
    await fetch("/api/drops/enter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dropId: drop!.dropId, userId: drop!.userId ?? "guest" }),
    });
  }

  return (
    <div style={{
      background: "linear-gradient(135deg, #1a1200, #0a0a00)",
      border: "1px solid #FFD700",
      padding: "14px 20px",
      display: "flex",
      alignItems: "center",
      gap: 16,
      fontFamily: "'Inter',sans-serif",
      boxShadow: "0 0 24px rgba(255,215,0,0.25), 0 0 0 1px rgba(255,215,0,0.1)",
      animation: "dropBannerIn 0.4s ease-out",
    }}>
      <style>{`
        @keyframes dropBannerIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dropGlow {
          0%, 100% { box-shadow: 0 0 24px rgba(255,215,0,0.25); }
          50%       { box-shadow: 0 0 40px rgba(255,215,0,0.5); }
        }
      `}</style>

      <span style={{ fontSize: 20 }}>⚡</span>

      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 8, fontWeight: 900, letterSpacing: "0.4em",
          color: "#FFD700", textTransform: "uppercase", marginBottom: 3,
        }}>
          PRIZE DROP · {drop.sponsorName}
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>
          {drop.prizeName}
        </div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
          {drop.triggerDesc}
        </div>
      </div>

      <button
        onClick={handleEnter}
        style={{
          padding: "9px 20px",
          background: "linear-gradient(135deg, #FFD700, #FF9500)",
          color: "#050510",
          fontFamily: "'Bebas Neue','Impact',sans-serif",
          fontSize: 14,
          letterSpacing: "0.08em",
          border: "none",
          cursor: "pointer",
          fontWeight: 900,
          flexShrink: 0,
        }}
      >
        ENTER NOW
      </button>
    </div>
  );
}
