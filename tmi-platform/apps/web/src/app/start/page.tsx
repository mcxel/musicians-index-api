"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STEPS = [
  {
    num: "01",
    title: "Complete Your Profile",
    body: "Add your photo, bio, city, and genre. A complete profile gets discovered. An empty one gets skipped.",
    cta: "Edit Profile →",
    href: "/settings",
    color: "#00FFFF",
    icon: "🎨",
  },
  {
    num: "02",
    title: "Go Live. Get Seen.",
    body: "Every time you broadcast live on TMI, your name appears on the Billboard Wall — a real-time discovery feed that fans and sponsors are actively watching. You cannot be found if you are not live.",
    cta: "Go Live Now →",
    href: "/live/go",
    color: "#FF2DAA",
    icon: "🔴",
  },
  {
    num: "03",
    title: "Land Your First Sponsor",
    body: "TMI's sponsor system is built for artists with no label, no manager, and no budget. Start local — a barbershop, a sneaker store, a restaurant near you. They promote you. You promote them. Real income starts here.",
    cta: "Find Sponsors →",
    href: "/profile/sponsor/soundwave-audio",
    color: "#FFD700",
    icon: "🤝",
  },
  {
    num: "04",
    title: "Enter Battles & Cyphers",
    body: "Battles are how the TMI community decides who's next. Win a battle, move up the rankings. Rise high enough and sponsors start contacting you — not the other way around.",
    cta: "Enter a Battle →",
    href: "/rooms/cypher",
    color: "#AA2DFF",
    icon: "⚔️",
  },
  {
    num: "05",
    title: "Build Toward 20 Sponsors",
    body: "Twenty active sponsors is our platform's benchmark for a self-sustaining artist career. Each sponsor contributes to your income and promotion in exchange for visibility through your channel. Local sponsors first. Major sponsors follow the numbers.",
    cta: "See Sponsor Tiers →",
    href: "/pricing",
    color: "#00FF88",
    icon: "🏆",
  },
];

const SPONSOR_FACTS = [
  { label: "Local sponsors pay", value: "$50–$500/mo", color: "#FFD700" },
  { label: "Major sponsors pay", value: "$1k–$10k/mo", color: "#00FFFF" },
  { label: "Target sponsors", value: "20 active", color: "#00FF88" },
  { label: "Billboard exposure", value: "Every live session", color: "#FF2DAA" },
];

export default function StartPage() {
  const [role, setRole] = useState<string>("artist");

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include", cache: "no-store" })
      .then((r) => r.ok ? r.json() : {})
      .then((d: { user?: { role?: string } }) => {
        if (d.user?.role) setRole(d.user.role.toLowerCase());
      })
      .catch(() => {});
  }, []);

  const dashHref = (() => {
    const map: Record<string, string> = {
      artist: "/hub/performer",
      performer: "/hub/performer",
      fan: "/hub/fan",
      sponsor: "/hub/sponsor",
      advertiser: "/hub/advertiser",
      venue: "/hub/venue",
      writer: "/hub/writer",
      promoter: "/hub/fan",
    };
    return map[role] ?? "/hub/fan";
  })();

  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #040412 0%, #06041a 50%, #040412 100%)",
      color: "#fff",
      fontFamily: "'Inter', sans-serif",
      paddingBottom: 80,
    }}>

      {/* Hero — mission statement */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 24px 48px", textAlign: "center" }}>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.35em", color: "#FF2DAA", marginBottom: 14, textTransform: "uppercase" }}>
          Welcome to The Musician's Index
        </div>
        <h1 style={{ fontSize: "clamp(28px,5vw,52px)", fontWeight: 900, lineHeight: 1.1, margin: "0 0 20px", letterSpacing: "-0.01em" }}>
          This Is Your<br />
          <span style={{ color: "#00FFFF" }}>Promotion Company.</span>
        </h1>
        <p style={{ fontSize: "clamp(13px,2vw,16px)", color: "rgba(255,255,255,0.55)", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 32px" }}>
          TMI exists to promote you, your music, and your brand — worldwide —
          without judgment based on how much money you have. Here, your fans
          decide your value. Your talent earns your rank.
        </p>
        <p style={{ fontSize: "clamp(13px,2vw,15px)", color: "rgba(255,255,255,0.4)", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 36px" }}>
          We built a system where local sponsors help fund your journey while you
          grow, and major sponsors find you when the numbers prove you're ready.
          You are not alone in this. TMI is your team.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/live/go" style={{
            padding: "14px 28px", borderRadius: 8, background: "#FF2DAA",
            color: "#050510", fontSize: 13, fontWeight: 900, letterSpacing: "0.1em",
            textDecoration: "none",
          }}>
            🔴 GO LIVE NOW
          </Link>
          <Link href={dashHref} style={{
            padding: "14px 28px", borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.05)",
            color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 700,
            textDecoration: "none",
          }}>
            My Dashboard →
          </Link>
        </div>
      </div>

      {/* Step-by-step guide */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px 48px" }}>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.3em", color: "rgba(255,255,255,0.3)", marginBottom: 24, textTransform: "uppercase" }}>
          Your First 5 Moves
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {STEPS.map((step) => (
            <div key={step.num} style={{
              display: "flex", gap: 20, alignItems: "flex-start",
              padding: "22px 24px",
              background: `${step.color}06`,
              border: `1px solid ${step.color}22`,
              borderRadius: 14,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 10, flexShrink: 0,
                background: `${step.color}14`, border: `1px solid ${step.color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22,
              }}>
                {step.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 8, fontWeight: 900, color: step.color, letterSpacing: "0.2em" }}>
                    STEP {step.num}
                  </span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 6 }}>
                  {step.title}
                </div>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, margin: "0 0 12px" }}>
                  {step.body}
                </p>
                <Link href={step.href} style={{
                  fontSize: 11, fontWeight: 800, color: step.color,
                  letterSpacing: "0.08em", textDecoration: "none",
                  padding: "6px 14px", borderRadius: 6,
                  border: `1px solid ${step.color}40`,
                  background: `${step.color}0c`,
                  display: "inline-block",
                }}>
                  {step.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sponsor income breakdown */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px 48px" }}>
        <div style={{
          padding: "28px 28px",
          background: "rgba(255,215,0,0.04)",
          border: "1px solid rgba(255,215,0,0.2)",
          borderRadius: 16,
        }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.3em", color: "#FFD700", marginBottom: 6, textTransform: "uppercase" }}>
            The Sponsor Income Model
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 8px" }}>
            20 Sponsors = Your Career Foundation
          </h2>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, margin: "0 0 20px" }}>
            Most artists have zero income from their art. TMI fixes that with a sponsor system
            designed to match artists with local and major brands who benefit from their audience.
            You promote them. They pay you. You both win.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 12, marginBottom: 20 }}>
            {SPONSOR_FACTS.map((f) => (
              <div key={f.label} style={{
                padding: "14px 16px",
                background: `${f.color}08`,
                border: `1px solid ${f.color}22`,
                borderRadius: 10,
              }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: f.color, marginBottom: 4 }}>{f.value}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{f.label}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", margin: 0, lineHeight: 1.6 }}>
            Start local. A barbershop, a clothing store, a restaurant in your city.
            They see your audience growing. They sponsor you. As your numbers rise,
            so does your sponsor tier. TMI tracks it all.
          </p>
        </div>
      </div>

      {/* Billboard exposure callout */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px 48px" }}>
        <div style={{
          padding: "28px 28px",
          background: "rgba(255,45,170,0.05)",
          border: "1px solid rgba(255,45,170,0.25)",
          borderRadius: 16,
          display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap",
        }}>
          <div style={{ fontSize: 40 }}>📡</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.3em", color: "#FF2DAA", marginBottom: 6, textTransform: "uppercase" }}>
              The Billboard Wall
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 900, margin: "0 0 8px" }}>
              Go Live → Get Featured → Get Found
            </h2>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, margin: "0 0 14px" }}>
              Every time you go live on TMI, your profile appears on the live Billboard Wall —
              a real-time discovery feed that fans, sponsors, and promoters are watching.
              The more you broadcast, the more times you get featured. The more you get featured,
              the faster your audience grows.
            </p>
            <Link href="/live/go" style={{
              fontSize: 12, fontWeight: 900, color: "#050510",
              textDecoration: "none", padding: "10px 22px",
              borderRadius: 8, background: "#FF2DAA", display: "inline-block",
            }}>
              🔴 Start Broadcasting →
            </Link>
          </div>
        </div>
      </div>

      {/* Footer links */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 24, display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { label: "My Dashboard", href: dashHref, color: "#00FFFF" },
            { label: "Go Live",      href: "/live/go",        color: "#FF2DAA" },
            { label: "Battles",      href: "/rooms/cypher",   color: "#AA2DFF" },
            { label: "Sponsors",     href: "/pricing",        color: "#FFD700" },
            { label: "Billboard",    href: "/live/audience",  color: "#00FF88" },
          ].map((l) => (
            <Link key={l.href} href={l.href} style={{
              padding: "8px 16px", borderRadius: 8, fontSize: 11, fontWeight: 800,
              border: `1px solid ${l.color}33`, background: `${l.color}09`,
              color: l.color, textDecoration: "none", letterSpacing: "0.08em",
            }}>
              {l.label} →
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
