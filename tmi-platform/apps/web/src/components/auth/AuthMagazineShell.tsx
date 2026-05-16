"use client";

// Auth Magazine Shell — wraps login/signup forms in TMI magazine visual canon.
// Neon trim, animated border, article-card form surface. NOT generic SaaS.

import { type ReactNode, useState, useEffect } from "react";
import Link from "next/link";

type AuthMode = "login" | "signup";

interface AuthMagazineShellProps {
  mode: AuthMode;
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthMagazineShell({
  mode,
  children,
  title,
  subtitle,
}: AuthMagazineShellProps) {
  const [glowPhase, setGlowPhase] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setGlowPhase((p) => (p + 1) % 3), 1600);
    return () => clearInterval(id);
  }, []);

  const accent = mode === "login" ? "#00FFFF" : "#FF2DAA";
  const glowOpacity = [0.08, 0.14, 0.06][glowPhase] ?? 0.08;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at 28% 35%, rgba(0,255,255,0.07), transparent 48%)," +
          "radial-gradient(circle at 78% 65%, rgba(255,45,170,0.06), transparent 44%)," +
          "linear-gradient(160deg, #06070d 0%, #040516 55%, #07030f 100%)",
        padding: "24px 16px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* ── Magazine masthead ── */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Link
            href="/home/1"
            style={{
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: "0.35em",
              color: accent,
              textTransform: "uppercase",
              textDecoration: "none",
              display: "inline-block",
              marginBottom: 8,
            }}
          >
            TMI Magazine
          </Link>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 900,
              color: "#fff",
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: "6px 0 0" }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* ── Form card ── */}
        <div
          style={{
            borderRadius: 16,
            border: `1px solid ${accent}${Math.round(glowOpacity * 255).toString(16).padStart(2, "0")}`,
            background: "rgba(6,7,13,0.82)",
            boxShadow: `0 0 40px ${accent}${Math.round(glowOpacity * 255).toString(16).padStart(2, "0")}, 0 24px 60px rgba(0,0,0,0.6)`,
            backdropFilter: "blur(20px)",
            overflow: "hidden",
            transition: "box-shadow 800ms ease, border-color 800ms ease",
          }}
        >
          {/* Accent top stripe */}
          <div
            style={{
              height: 3,
              background: `linear-gradient(90deg, transparent, ${accent}60, transparent)`,
            }}
          />

          {/* Mode switcher */}
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {(["login", "signup"] as const).map((m) => (
              <Link
                key={m}
                href={m === "login" ? "/login" : "/signup"}
                style={{
                  flex: 1,
                  padding: "12px 0",
                  textAlign: "center" as const,
                  fontSize: 9,
                  fontWeight: 900,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase" as const,
                  textDecoration: "none",
                  color: mode === m ? accent : "rgba(255,255,255,0.25)",
                  borderBottom: mode === m ? `2px solid ${accent}` : "2px solid transparent",
                  transition: "color 200ms ease",
                }}
              >
                {m === "login" ? "Sign In" : "Join TMI"}
              </Link>
            ))}
          </div>

          {/* Form area */}
          <div style={{ padding: "28px 28px 24px" }}>{children}</div>

          {/* Bottom trim */}
          <div
            style={{
              height: 2,
              background: `linear-gradient(90deg, transparent, ${accent}30, transparent)`,
            }}
          />
        </div>

        {/* ── Footer links ── */}
        <div
          style={{
            textAlign: "center",
            marginTop: 20,
            display: "flex",
            gap: 16,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "Privacy", href: "/legal/privacy" },
            { label: "Terms", href: "/legal/terms" },
            { label: "Home", href: "/home/1" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                fontSize: 8,
                fontWeight: 700,
                color: "rgba(255,255,255,0.2)",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                textDecoration: "none",
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
