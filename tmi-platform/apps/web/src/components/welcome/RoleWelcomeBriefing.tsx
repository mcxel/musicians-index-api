"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useLivePrivacyState } from "@/lib/live/livePrivacyState";
import { gpsDestinationsForRole } from "@/lib/commandCenter/gpsReleaseAllowlist";
import {
  dismissWelcomeForVisit,
  setWelcomeAutoShow,
  welcomeAutoShowEnabled,
  welcomeDismissedThisVisit,
  welcomeVersionForRole,
  type WelcomeRole,
} from "@/lib/welcome/welcomeBriefingPreference";

const PERFORMER_SLIDES = [
  {
    kicker: "01 — YOUR STAGE",
    title: "Welcome to your stage",
    lead: "Don't perform for a viewer count. Perform for an audience.",
    body: "We're building TMI around a different idea of what performing online can be. Instead of fans simply watching a number on a screen, we're building interactive venues where your audience can actually be represented inside the experience. But the stage is only part of it.",
  },
  {
    kicker: "02 — ONE PLACE",
    title: "Everything you need. One place.",
    lead: "Your music. Your presentation. Your audience. Your promotion. Your business. Your way.",
    body: "TMI is being built so you don't need 50 different apps to manage your music career. Build your public presence. Release and sell your music. Promote yourself globally. Reach new fans. Go live. Perform inside interactive venues. Create content. Sell products and experiences. Grow your audience and build your business—all from one platform. These tools are coming together piece by piece. They are not all finished yet.",
  },
  {
    kicker: "03 — YOU'RE EARLY",
    title: "You're early",
    lead: "That's the point.",
    body: "Build with us, grow with us, and help shape what comes next.",
  },
];

const FAN_SLIDES = [
  {
    kicker: "01 — BE PART OF THE AUDIENCE",
    title: "Welcome to the experience",
    lead: "Don't just watch the show. Be part of the audience.",
    body: "We're building TMI so being a fan feels different. Instead of being another viewer number on a little screen by yourself, we're building interactive venues where you can actually be represented inside the audience.",
  },
  {
    kicker: "02 — ONE PLACE",
    title: "Everything you need. One place.",
    lead: "Discover. Follow. Enter their world. Be part of the audience.",
    body: "TMI is being built as one place to discover artists, follow them, enter their worlds, buy their music and products, support them, watch them live, and actually become part of the audience. These experiences are coming together piece by piece. They are not all finished yet.",
  },
  {
    kicker: "03 — YOU'RE EARLY",
    title: "You're early",
    lead: "That's the point.",
    body: "Grow with TMI as these tools and experiences come together. Explore what's already here, and help shape what comes next.",
  },
];

export default function RoleWelcomeBriefing({ role }: { role: WelcomeRole }) {
  const isLivePublished = useLivePrivacyState((s) => s.isLivePublished);
  const [open, setOpen] = useState(false);
  const [manual, setManual] = useState(false);
  const [step, setStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const slides = role === "performer" ? PERFORMER_SLIDES : FAN_SLIDES;
  const slide = slides[step] ?? slides[0]!;
  const optedOut = !welcomeAutoShowEnabled(role);
  const visibleDestinations = gpsDestinationsForRole(role).filter((item) => item.id !== "gps-guide");
  const youCan = visibleDestinations.filter((item) => item.state === "LIVE");
  const wereBuilding = visibleDestinations.filter((item) => item.state === "COMING_SOON");

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(media.matches);
    const onChange = () => setReducedMotion(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const onOpen = () => {
      setManual(true);
      setStep(0);
      setDontShowAgain(!welcomeAutoShowEnabled(role));
      setOpen(true);
    };
    window.addEventListener("tmi:open-welcome", onOpen);
    return () => window.removeEventListener("tmi:open-welcome", onOpen);
  }, [role]);

  useEffect(() => {
    if (manual) return;
    if (isLivePublished) {
      dismissWelcomeForVisit(role);
      setOpen(false);
      return;
    }
    if (welcomeDismissedThisVisit(role)) return;
    if (!welcomeAutoShowEnabled(role)) return;
    setOpen(true);
  }, [role, isLivePublished, manual]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      dismissWelcomeForVisit(role);
      setOpen(false);
      setManual(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, role]);

  function closeForVisit() {
    dismissWelcomeForVisit(role);
    setOpen(false);
    setManual(false);
  }

  function enterHub() {
    if (dontShowAgain) setWelcomeAutoShow(role, false);
    closeForVisit();
  }

  function showOnReturn() {
    setWelcomeAutoShow(role, true);
    setDontShowAgain(false);
  }

  if (!open) return null;

  return (
    <div
      data-testid="tmi-role-welcome"
      data-welcome-role={role}
      data-welcome-version={welcomeVersionForRole(role)}
      data-welcome-step={step + 1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tmi-welcome-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9450,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(2,4,10,0.72)",
        backdropFilter: reducedMotion ? undefined : "blur(10px)",
      }}
    >
      <section
        style={{
          width: "min(560px, 100%)",
          maxHeight: "min(720px, calc(100dvh - 32px))",
          overflow: "auto",
          borderRadius: 16,
          border: "1px solid rgba(198,214,230,0.28)",
          background: "linear-gradient(180deg, rgba(22,26,34,0.94) 0%, rgba(8,10,16,0.96) 100%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.16), 0 24px 60px rgba(0,0,0,0.45)",
          color: "#f4f7fb",
          padding: "22px 22px 18px",
          fontFamily: "Inter, Segoe UI, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
          <p style={{ margin: 0, fontSize: 11, letterSpacing: "0.16em", fontWeight: 700, color: "#8ee7ff" }}>
            {slide.kicker}
          </p>
          <button
            type="button"
            data-testid="tmi-welcome-not-now"
            aria-label="Not now"
            onClick={closeForVisit}
            style={quietButton}
          >
            ✕
          </button>
        </div>
        <h2 id="tmi-welcome-title" style={{ margin: "14px 0 8px", fontSize: 28, lineHeight: 1.15, fontWeight: 650, letterSpacing: "-0.02em" }}>
          {slide.title}
        </h2>
        <p style={{ margin: "0 0 12px", fontSize: 18, lineHeight: 1.35, color: "#f3d27a" }}>{slide.lead}</p>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: "rgba(244,247,251,0.86)" }}>{slide.body}</p>

        <div style={{ display: "flex", gap: 8, marginTop: 18 }} aria-hidden>
          {slides.map((_, index) => (
            <span
              key={index}
              style={{
                width: index === step ? 22 : 8,
                height: 8,
                borderRadius: 99,
                background: index === step ? "#7ee7ff" : "rgba(255,255,255,0.22)",
              }}
            />
          ))}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 18 }}>
          {step > 0 ? (
            <button type="button" onClick={() => setStep((value) => value - 1)} style={quietButton}>
              Back
            </button>
          ) : null}
          {step < slides.length - 1 ? (
            <button type="button" data-testid="tmi-welcome-next" onClick={() => setStep((value) => value + 1)} style={quietButton}>
              Next
            </button>
          ) : null}
          <button type="button" data-testid="tmi-welcome-enter" onClick={enterHub} style={enterButton}>
            Enter your Hub
          </button>
        </div>
        <p style={{ margin: "10px 0 0", fontSize: 12, letterSpacing: "0.04em", color: "rgba(244,247,251,0.62)" }}>
          You&apos;re early. That&apos;s the point. Welcome to the build.
        </p>
        <div data-testid="tmi-welcome-truth" style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={{ margin: 0, fontSize: 11, letterSpacing: "0.14em", fontWeight: 700, color: "#8ee7ff" }}>YOU CAN</p>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.45 }}>
            {youCan.map((item) => <li key={item.id}>{item.youCan}</li>)}
          </ul>
          <p style={{ margin: "6px 0 0", fontSize: 11, letterSpacing: "0.14em", fontWeight: 700, color: "#f3d27a" }}>WE&apos;RE BUILDING</p>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.45 }}>
            {wereBuilding.map((item) => <li key={item.id}>{item.building}</li>)}
          </ul>
        </div>

        <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 16, fontSize: 13, color: "rgba(244,247,251,0.78)" }}>
          <input
            data-testid="tmi-welcome-dont-show"
            type="checkbox"
            checked={dontShowAgain}
            onChange={(event) => setDontShowAgain(event.target.checked)}
          />
          Don&apos;t show this automatically again
        </label>
        {optedOut && manual ? (
          <button type="button" data-testid="tmi-welcome-show-on-return" onClick={showOnReturn} style={{ ...quietButton, marginTop: 10 }}>
            Show this when I return
          </button>
        ) : null}
        <p style={{ margin: "12px 0 0", fontSize: 12, color: "rgba(244,247,251,0.5)" }}>
          Welcome to The Musician&apos;s Index.
        </p>
      </section>
    </div>
  );
}

const quietButton: CSSProperties = {
  minHeight: 40,
  padding: "0 12px",
  borderRadius: 8,
  border: "1px solid rgba(198,214,230,0.28)",
  background: "rgba(255,255,255,0.04)",
  color: "#f4f7fb",
  cursor: "pointer",
  font: "inherit",
  fontSize: 13,
  fontWeight: 650,
};

const enterButton: CSSProperties = {
  minHeight: 44,
  padding: "0 16px",
  borderRadius: 8,
  border: "1px solid rgba(126,231,255,0.7)",
  background: "linear-gradient(180deg, rgba(126,231,255,0.18), rgba(8,12,18,0.4))",
  color: "#f4f7fb",
  cursor: "pointer",
  font: "inherit",
  fontSize: 14,
  fontWeight: 700,
};
