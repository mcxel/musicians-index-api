"use client";

import type { CSSProperties } from "react";
import type { StudioOverlayKind } from "@/lib/yopho/YoPhoStudioStylePresets";

interface Props {
  kind: StudioOverlayKind;
  displayName?: string;
  dateStamp?: string;
}

const ANIM = `
@keyframes tmi-leak-drift {
  0% { transform: translateX(-8%) rotate(-6deg); opacity: 0.35; }
  50% { transform: translateX(12%) rotate(4deg); opacity: 0.7; }
  100% { transform: translateX(-8%) rotate(-6deg); opacity: 0.35; }
}
@keyframes tmi-float-head {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-6px) scale(1.03); }
}
`;

export default function YoPhoStudioStyleOverlay({
  kind,
  displayName = "",
  dateStamp,
}: Props) {
  if (kind === "none") return null;
  const stamp = dateStamp ?? new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" });

  const base: CSSProperties = {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    zIndex: 8,
  };

  return (
    <div style={base} data-yopho-style={kind} aria-hidden>
      <style>{ANIM}</style>

      {kind === "olan_float" ? (
        <div
          style={{
            position: "absolute",
            inset: "8% 12%",
            borderRadius: "50% 50% 42% 42%",
            boxShadow: "0 0 40px rgba(255,215,0,0.35), inset 0 0 60px rgba(255,45,170,0.25)",
            border: "2px solid rgba(255,215,0,0.45)",
            animation: "tmi-float-head 3.5s ease-in-out infinite",
            background:
              "radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.12) 0%, transparent 55%)",
          }}
        />
      ) : null}

      {kind === "wine_glass" ? (
        <svg viewBox="0 0 100 120" style={{ position: "absolute", inset: "4% 18%", width: "64%", height: "92%" }}>
          <defs>
            <clipPath id="yopho-snifter">
              <path d="M20 18 C18 50 22 72 50 78 C78 72 82 50 80 18 Z M48 78 L48 102 L35 110 L65 110 L52 102 L52 78" />
            </clipPath>
          </defs>
          <rect x="0" y="0" width="100" height="120" fill="rgba(5,5,16,0.55)" />
          <rect x="0" y="0" width="100" height="120" fill="url(#)" clipPath="url(#yopho-snifter)" style={{ fill: "transparent" }} />
          <path
            d="M20 18 C18 50 22 72 50 78 C78 72 82 50 80 18 Z M48 78 L48 102 L35 110 L65 110 L52 102 L52 78"
            fill="none"
            stroke="#FFD700"
            strokeWidth="1.5"
            opacity="0.85"
          />
          <ellipse cx="50" cy="28" rx="22" ry="6" fill="rgba(0,229,255,0.15)" />
        </svg>
      ) : null}

      {kind === "vaseline" ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at center, transparent 35%, rgba(5,5,16,0.75) 100%)",
            backdropFilter: "blur(1.5px)",
            boxShadow: "inset 0 0 60px rgba(255,255,255,0.12)",
          }}
        />
      ) : null}

      {kind === "neon_grid" ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(0,229,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,45,170,0.14) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            mixBlendMode: "screen",
            boxShadow: "inset 0 0 40px rgba(0,229,255,0.25)",
          }}
        />
      ) : null}

      {kind === "glamour" ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 50% 35%, rgba(255,255,255,0.22) 0%, transparent 40%), radial-gradient(circle at 50% 80%, rgba(255,45,170,0.2) 0%, transparent 50%)",
            filter: "saturate(1.15)",
          }}
        />
      ) : null}

      {kind === "border_white" ? (
        <div style={{ position: "absolute", inset: 8, border: "10px solid #f5f5f5", boxShadow: "inset 0 0 0 1px #ccc" }} />
      ) : null}

      {kind === "border_date" ? (
        <>
          <div style={{ position: "absolute", inset: 6, border: "3px solid rgba(255,215,0,0.5)" }} />
          <div
            style={{
              position: "absolute",
              bottom: 10,
              right: 12,
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.12em",
              color: "#FFD700",
              textTransform: "uppercase",
              textShadow: "0 1px 2px #000",
            }}
          >
            {stamp}
          </div>
        </>
      ) : null}

      {kind === "border_magazine" ? (
        <>
          <div style={{ position: "absolute", inset: 0, border: "4px solid #FFD700", boxShadow: "inset 0 0 0 2px #FF2DAA" }} />
          <div
            style={{
              position: "absolute",
              top: 8,
              left: 10,
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: "0.22em",
              color: "#00FFFF",
            }}
          >
            THE MUSICIAN&apos;S INDEX
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 8,
              left: 10,
              right: 10,
              fontSize: 11,
              fontWeight: 900,
              color: "#FFD700",
              textTransform: "uppercase",
            }}
          >
            {displayName || "COVER STAR"}
          </div>
        </>
      ) : null}

      {kind === "border_calendar" ? (
        <>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 28,
              background: "linear-gradient(90deg,#FF2DAA,#AA2DFF)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: "0.16em",
              color: "#fff",
            }}
          >
            {stamp.toUpperCase()}
          </div>
          <div style={{ position: "absolute", inset: "28px 0 0", border: "2px solid rgba(255,255,255,0.2)" }} />
        </>
      ) : null}

      {kind === "prism" ? (
        <>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                inset: `${10 + i * 4}% ${8 + i * 6}%`,
                border: "1px solid rgba(0,229,255,0.35)",
                transform: `rotate(${(i - 1) * 4}deg)`,
                boxShadow: `0 0 12px rgba(255,45,170,${0.15 + i * 0.1})`,
                mixBlendMode: "screen",
              }}
            />
          ))}
        </>
      ) : null}

      {kind === "mask_heart" || kind === "mask_keyhole" || kind === "mask_oval" ? (
        <svg viewBox="0 0 100 120" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <defs>
            <mask id={`yopho-mask-${kind}`}>
              <rect width="100" height="120" fill="#000" />
              {kind === "mask_heart" ? (
                <path
                  d="M50 98 C20 72 8 52 8 36 C8 20 20 12 32 12 C42 12 48 20 50 28 C52 20 58 12 68 12 C80 12 92 20 92 36 C92 52 80 72 50 98 Z"
                  fill="#fff"
                />
              ) : null}
              {kind === "mask_keyhole" ? (
                <>
                  <circle cx="50" cy="42" r="22" fill="#fff" />
                  <path d="M38 58 L30 105 L70 105 L62 58 Z" fill="#fff" />
                </>
              ) : null}
              {kind === "mask_oval" ? <ellipse cx="50" cy="58" rx="34" ry="46" fill="#fff" /> : null}
            </mask>
          </defs>
          <rect width="100" height="120" fill="rgba(5,5,16,0.88)" mask={`url(#yopho-mask-${kind})`} style={{ mask: `url(#yopho-mask-${kind})` }} />
          {/* Dim outside: invert via overlay ring */}
          <rect width="100" height="120" fill="rgba(5,5,16,0.72)" style={{ mixBlendMode: "multiply" }} />
          {kind === "mask_heart" ? (
            <path d="M50 98 C20 72 8 52 8 36 C8 20 20 12 32 12 C42 12 48 20 50 28 C52 20 58 12 68 12 C80 12 92 20 92 36 C92 52 80 72 50 98 Z" fill="none" stroke="#FF2DAA" strokeWidth="1.2" />
          ) : null}
          {kind === "mask_oval" ? (
            <ellipse cx="50" cy="58" rx="34" ry="46" fill="none" stroke="#FFD700" strokeWidth="1.2" />
          ) : null}
          {kind === "mask_keyhole" ? (
            <>
              <circle cx="50" cy="42" r="22" fill="none" stroke="#00E5FF" strokeWidth="1.2" />
              <path d="M38 58 L30 105 L70 105 L62 58 Z" fill="none" stroke="#00E5FF" strokeWidth="1.2" />
            </>
          ) : null}
        </svg>
      ) : null}

      {kind === "twin_split" ? (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "8%",
            bottom: "8%",
            width: 2,
            background: "linear-gradient(180deg,transparent,#00E5FF,#FF2DAA,transparent)",
            boxShadow: "0 0 12px #00E5FF",
          }}
        />
      ) : null}

      {kind === "minilab" ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(255,180,80,0.18), rgba(255,80,40,0.12))",
            mixBlendMode: "color",
          }}
        />
      ) : null}

      {kind === "light_leak" ? (
        <div
          style={{
            position: "absolute",
            top: "-10%",
            left: "-20%",
            width: "60%",
            height: "140%",
            background:
              "linear-gradient(105deg, transparent 30%, rgba(255,120,40,0.45) 48%, rgba(255,215,0,0.35) 52%, transparent 70%)",
            animation: "tmi-leak-drift 4.5s ease-in-out infinite",
            mixBlendMode: "screen",
          }}
        />
      ) : null}
    </div>
  );
}
