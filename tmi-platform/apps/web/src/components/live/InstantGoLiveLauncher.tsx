"use client";

/**
 * InstantGoLiveLauncher — default /live/go entry.
 * Opens venue immediately via executeInstantGoLive (shared dock path).
 * No full-screen BROADCAST SETUP on normal/repeat launch.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { executeInstantGoLive } from "@/lib/dock/executeInstantGoLive";
import { PENDING_GO_LIVE_KEY } from "@/lib/dock/presentInstantGoLiveInPlace";
import {
  loadPersistedLivePrivacy,
  loadPersistedPreferredExperience,
  persistPreferredExperience,
  type LivePrivacy,
} from "@/lib/live/LiveDestinationRouter";
import GoLiveStatusPill, { type GoLiveInitPhase } from "@/components/live/GoLiveStatusPill";

const WORLD_EXPERIENCES = [
  { id: "live", label: "Go Live" },
  { id: "concert", label: "Concert" },
  { id: "world-concert", label: "World Concert" },
  { id: "world-premiere", label: "World Premiere" },
  { id: "release-party", label: "Release Party" },
] as const;

export default function InstantGoLiveLauncher() {
  const searchParams = useSearchParams();
  const started = useRef(false);
  const [phase, setPhase] = useState<GoLiveInitPhase>("preparing_venue");
  const [errorMsg, setErrorMsg] = useState("");
  const [configOpen, setConfigOpen] = useState(false);
  const [experience, setExperience] = useState(
    () =>
      searchParams?.get("experience") ||
      loadPersistedPreferredExperience() ||
      "live",
  );
  const [privacy, setPrivacy] = useState<LivePrivacy>(() => loadPersistedLivePrivacy());

  const launch = useCallback(async () => {
    setPhase("preparing_venue");
    setErrorMsg("");
    persistPreferredExperience(experience);

    const result = await executeInstantGoLive({
      privacy,
      preferredExperience: experience,
      // Media init runs on InstantGoLiveStage — venue first
      deferMedia: true,
    });

    if (!result.ok || !result.href) {
      setPhase("error");
      setErrorMsg(result.error ?? "Could not open venue. Sign in and retry.");
      return;
    }

    try {
      sessionStorage.setItem(
        PENDING_GO_LIVE_KEY,
        JSON.stringify({
          role: "PERFORMER",
          preferredExperience: experience,
          roomId: result.roomId,
          publishSession: true,
        }),
      );
    } catch {
      /* hub query fallback */
    }
    window.location.replace("/hub/performer?golive=1");
  }, [experience, privacy]);

  useEffect(() => {
    if (started.current) return;
    const expParam = searchParams?.get("experience") || "";
    const wantConfig =
      searchParams?.get("config") === "1" ||
      searchParams?.get("config") === "true";
    const explicitWorld =
      expParam === "world-concert" || expParam === "world-premiere";
    // Optional expand only — never block normal/repeat Go Live
    if (wantConfig || (explicitWorld && searchParams?.get("auto") !== "true")) {
      if (expParam) setExperience(expParam);
      setConfigOpen(true);
      return;
    }
    started.current = true;
    void launch();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConfirmConfig = () => {
    setConfigOpen(false);
    if (started.current) return;
    started.current = true;
    void launch();
  };

  return (
    <main
      style={{
        position: "relative",
        minHeight: "100vh",
        background: "#050510",
        color: "#fff",
        overflow: "hidden",
      }}
      data-instant-golive-launcher="true"
    >
      {/* Venue silhouette — visible immediately while registry mints */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(170,45,255,0.18) 0%, transparent 55%), radial-gradient(ellipse at 50% 80%, rgba(255,45,170,0.12) 0%, transparent 50%), #050510",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: "50%",
          bottom: "18%",
          transform: "translateX(-50%)",
          width: "min(72vw, 640px)",
          height: "38vh",
          borderRadius: "12px 12px 0 0",
          border: "1px solid rgba(0,255,255,0.2)",
          background:
            "linear-gradient(180deg, rgba(0,255,255,0.06) 0%, rgba(5,5,16,0.2) 100%)",
          boxShadow: "0 0 60px rgba(0,255,255,0.08)",
        }}
      />

      <GoLiveStatusPill
        phase={phase}
        errorMsg={errorMsg}
        onOpenDevices={
          phase === "error"
            ? () => {
                started.current = false;
                void launch();
              }
            : undefined
        }
      />

      {phase === "error" && (
        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: 420,
            margin: "30vh auto 0",
            padding: 20,
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
            {errorMsg || "Venue could not open."}
          </p>
          <button
            type="button"
            onClick={() => {
              started.current = false;
              void launch();
            }}
            style={{
              marginTop: 16,
              padding: "12px 22px",
              borderRadius: 10,
              border: "none",
              background: "#FF2DAA",
              color: "#050510",
              fontWeight: 900,
              fontSize: 11,
              letterSpacing: "0.1em",
              cursor: "pointer",
            }}
          >
            RETRY GO LIVE
          </button>
        </div>
      )}

      {/* World Concert / World Premiere stub config — same entry, optional expand */}
      {configOpen && (
        <div
          style={{
            position: "relative",
            zIndex: 3,
            maxWidth: 440,
            margin: "18vh auto 0",
            padding: 20,
            borderRadius: 16,
            background: "rgba(8,6,20,0.92)",
            border: "1px solid rgba(255,45,170,0.35)",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.14em",
              color: "#FFD700",
              marginBottom: 8,
            }}
          >
            LAUNCH CONFIG
          </div>
          <p style={{ margin: "0 0 14px", fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
            Same Instant Go Live entry. Ticketing checkout is not in this pass — venue opens
            immediately after confirm.
          </p>

          <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>
            EXPERIENCE
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
            {WORLD_EXPERIENCES.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setExperience(opt.id)}
                style={{
                  padding: "7px 10px",
                  borderRadius: 8,
                  border:
                    experience === opt.id
                      ? "1px solid #FF2DAA"
                      : "1px solid rgba(255,255,255,0.12)",
                  background:
                    experience === opt.id ? "rgba(255,45,170,0.18)" : "rgba(255,255,255,0.03)",
                  color: experience === opt.id ? "#FF2DAA" : "rgba(255,255,255,0.7)",
                  fontSize: 10,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>
            PRIVACY
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
            {(["public", "friends", "private"] as LivePrivacy[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPrivacy(p)}
                style={{
                  flex: 1,
                  padding: "8px 6px",
                  borderRadius: 8,
                  border:
                    privacy === p ? "1px solid #00FFFF" : "1px solid rgba(255,255,255,0.12)",
                  background: privacy === p ? "rgba(0,255,255,0.12)" : "transparent",
                  color: privacy === p ? "#00FFFF" : "rgba(255,255,255,0.6)",
                  fontSize: 10,
                  fontWeight: 800,
                  textTransform: "capitalize",
                  cursor: "pointer",
                }}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleConfirmConfig}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 10,
              border: "none",
              background: "#FF2DAA",
              color: "#050510",
              fontWeight: 900,
              fontSize: 11,
              letterSpacing: "0.12em",
              cursor: "pointer",
            }}
          >
            OPEN VENUE · GO LIVE
          </button>
        </div>
      )}
    </main>
  );
}
