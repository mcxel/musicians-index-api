"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { HappyDaysRegistry } from "@/lib/happydays/HappyDaysStore";
import type { HappyDaysMagazineEntry } from "@/lib/happydays/HappyDaysContracts";
import { logHappyDaysEvent, HAPPY_DAYS_EVENT } from "@/lib/happydays/HappyDaysObservatoryEvents";

export interface MagazineHappyDaysPageProps {
  entries?: HappyDaysMagazineEntry[];
  accentColor?: string;
}

export default function MagazineHappyDaysPage({
  entries: propEntries,
  accentColor = "#FFD700",
}: MagazineHappyDaysPageProps) {
  const [entries, setEntries] = useState<HappyDaysMagazineEntry[]>(
    propEntries || HappyDaysRegistry.getApprovedMagazineEntries(),
  );

  useEffect(() => {
    logHappyDaysEvent(HAPPY_DAYS_EVENT.MAGAZINE_VIEWED);
    // Refresh with latest live status from API if in browser
    const fetchLatest = async () => {
      try {
        const res = await fetch("/api/happydays");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.entries) && data.entries.length > 0) {
            setEntries(data.entries);
          }
        }
      } catch {
        // Fallback to initial entries
      }
    };
    fetchLatest();
  }, []);

  const heroEntry = entries[0];
  const gridEntries = entries.slice(1, 5);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: "16px 20px",
        background: "linear-gradient(160deg, rgba(14,8,28,0.98), rgba(4,3,10,0.99))",
        borderRadius: 14,
        border: `1px solid ${accentColor}44`,
        color: "#fff",
        boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 24px ${accentColor}18`,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Page Header */}
      <div style={{ borderBottom: `1px solid ${accentColor}33`, paddingBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.2em",
              color: accentColor,
              textTransform: "uppercase",
            }}
          >
            ✦ COMMUNITY REFLECTIONS · HAPPY DAYS ✦
          </span>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em" }}>
            ISSUE CURRENT
          </span>
        </div>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 900,
            color: "#fff",
            margin: "6px 0 2px 0",
            letterSpacing: "-0.01em",
          }}
        >
          What Brings Us Joy
        </h2>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", margin: 0 }}>
          Real voices, moments, and soundtrack anthems shared by TMI artists and fans.
        </p>
      </div>

      {/* Featured Hero Quote */}
      {heroEntry && (
        <div
          style={{
            background: "linear-gradient(135deg, rgba(255,215,0,0.12), rgba(255,45,170,0.08))",
            border: "1px solid rgba(255,215,0,0.4)",
            borderRadius: 12,
            padding: "16px 20px",
            position: "relative",
          }}
        >
          <div style={{ fontSize: 32, color: accentColor, opacity: 0.4, lineHeight: 1, marginBottom: 4 }}>
            “
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              lineHeight: 1.45,
              color: "#fff",
              marginBottom: 12,
            }}
          >
            {heroEntry.quote}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: heroEntry.role === "performer" ? "#FF2DAA" : "#00FFFF",
                  color: "#050310",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                {heroEntry.author.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#FFD700" }}>
                  {heroEntry.attributionLabel}
                </div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>
                  Prompt: {heroEntry.promptText}
                </div>
              </div>
            </div>

            {/* Live Bridge or Attached Track */}
            {heroEntry.isLiveNow && heroEntry.liveRoomId ? (
              <Link
                href={`/live/rooms/${heroEntry.liveRoomId}?from=magazine-happydays`}
                onClick={() =>
                  logHappyDaysEvent(HAPPY_DAYS_EVENT.LIVE_BRIDGE_CLICKED, {
                    targetLiveRoomId: heroEntry.liveRoomId,
                  })
                }
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "linear-gradient(135deg, #FF2DAA, #AA2DFF)",
                  color: "#fff",
                  padding: "5px 12px",
                  borderRadius: 20,
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: "0.1em",
                  textDecoration: "none",
                  boxShadow: "0 0 12px rgba(255,45,170,0.5)",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#fff",
                    boxShadow: "0 0 6px #fff",
                  }}
                />
                ● LIVE NOW · JOIN STAGE
              </Link>
            ) : heroEntry.attachedTrack ? (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "rgba(0,255,255,0.12)",
                  border: "1px solid rgba(0,255,255,0.35)",
                  color: "#00FFFF",
                  padding: "4px 10px",
                  borderRadius: 16,
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
                <span>🎵</span>
                <span>
                  {heroEntry.attachedTrack.title} · {heroEntry.attachedTrack.artist}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Grid of Community Reflections */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
        {gridEntries.map((item) => {
          const isPerf = item.role === "performer";
          return (
            <div
              key={item.id}
              style={{
                background: "rgba(10,8,22,0.85)",
                border: `1px solid ${isPerf ? "#FF2DAA33" : "#00FFFF33"}`,
                borderRadius: 10,
                padding: "12px 14px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <div style={{ fontSize: 12, lineHeight: 1.4, color: "#e2e8f0" }}>
                “{item.quote}”
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: isPerf ? "#FF2DAA" : "#00FFFF" }}>
                  {item.attributionLabel}
                </div>

                {item.isLiveNow && item.liveRoomId ? (
                  <Link
                    href={`/live/rooms/${item.liveRoomId}?from=magazine-happydays`}
                    onClick={() =>
                      logHappyDaysEvent(HAPPY_DAYS_EVENT.LIVE_BRIDGE_CLICKED, {
                        targetLiveRoomId: item.liveRoomId,
                      })
                    }
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 8,
                      fontWeight: 900,
                      color: "#FF2DAA",
                      background: "rgba(255,45,170,0.15)",
                      padding: "2px 6px",
                      borderRadius: 4,
                      border: "1px solid #FF2DAA",
                      textDecoration: "none",
                    }}
                  >
                    ● LIVE
                  </Link>
                ) : item.attachedTrack ? (
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }} title={item.attachedTrack.title}>
                    🎵 {item.attachedTrack.title.slice(0, 16)}...
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Bridge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          background: "rgba(255,215,0,0.05)",
          border: "1px dashed rgba(255,215,0,0.3)",
          borderRadius: 8,
          fontSize: 10,
        }}
      >
        <span style={{ color: "rgba(255,255,255,0.7)" }}>
          Want to share your reflection in an upcoming issue?
        </span>
        <span style={{ color: "#FFD700", fontWeight: 800 }}>
          Answer Today's Prompt in Fan or Performer Hub ✦
        </span>
      </div>
    </div>
  );
}
