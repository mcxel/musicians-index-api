"use client";

import React, { useEffect, useState } from "react";
import type {
  JumbotronEvent,
  JumbotronPresentationPack,
} from "@/lib/jumbotron/JumbotronContracts";
import {
  challengeFaceRoleAccent,
  type ChallengeFaceAssignment,
} from "@/lib/acgbr";

interface JumbotronSurfaceRendererProps {
  event: JumbotronEvent | null;
  pack: JumbotronPresentationPack;
  className?: string;
  is3DViewportOverlay?: boolean;
  /** Challenge ACGBR N/E/S/W roles — never invents scores. */
  challengeFacePlan?: readonly ChallengeFaceAssignment[] | null;
}

export function JumbotronSurfaceRenderer({
  event,
  pack,
  className = "",
  is3DViewportOverlay = false,
  challengeFacePlan = null,
}: JumbotronSurfaceRendererProps) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (event) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 400);
      return () => clearTimeout(t);
    }
  }, [event?.id]);

  const palette = pack.brandPalette;
  const accent = event?.accentColor ?? palette.accent;

  return (
    <div
      data-testid="canonical-jumbotron-surface"
      data-experience-type={pack.experienceType}
      data-target-class={event?.targetClass ?? pack.primaryTarget}
      data-challenge-acgbr-faces={
        challengeFacePlan
          ? challengeFacePlan.map((f) => `${f.face}:${f.role}`).join("|")
          : ""
      }
      className={`relative flex flex-col justify-between overflow-hidden rounded-xl border p-4 select-none ${className}`}
      style={{
        background: `linear-gradient(135deg, ${palette.background} 0%, #0c081e 100%)`,
        borderColor: accent,
        boxShadow: pulse
          ? `0 0 35px ${accent}88, inset 0 0 20px ${accent}44`
          : `0 0 15px ${accent}44, inset 0 0 10px rgba(0,0,0,0.8)`,
        transition: "box-shadow 0.3s ease, border-color 0.3s ease",
        minHeight: is3DViewportOverlay ? "180px" : "240px",
      }}
    >
      {/* Top Header Bar: Pack Title, Priority & Experience Badge */}
      <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: `${accent}33` }}>
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full animate-ping"
            style={{ backgroundColor: accent }}
          />
          <span className="font-mono text-xs font-black tracking-widest uppercase" style={{ color: accent }}>
            {pack.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {event && (
            <span
              data-testid="jumbotron-priority-badge"
              className="rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider"
              style={{
                backgroundColor: `${accent}22`,
                color: accent,
                border: `1px solid ${accent}66`,
              }}
            >
              PRIORITY {event.priority}
            </span>
          )}
          <span className="font-mono text-[10px] tracking-wider text-gray-400 uppercase">
            TARGET: {event?.targetClass ?? pack.primaryTarget}
          </span>
        </div>
      </div>

      {/* Center Dynamic Content Area */}
      <div className="my-auto flex flex-col items-center justify-center py-4 text-center">
        {event ? (
          <>
            <span
              className="font-mono text-xs font-bold tracking-widest uppercase mb-1"
              style={{ color: palette.secondary }}
            >
              {event.title}
            </span>

            {/* Scoreboard Layout for Battles & Game Shows — never invent MC Nova / scores */}
            {pack.proceduralFeatures.hasScoreboard && (
              <div
                data-testid="jumbotron-battle-scoreboard"
                className="my-2 flex items-center justify-center gap-6 rounded-lg bg-black/60 px-6 py-3 border"
                style={{ borderColor: `${accent}44` }}
              >
                <div className="flex flex-col items-center">
                  <span className="font-mono text-sm text-cyan-400 font-bold uppercase">
                    {event.battleScores?.participantA ?? "CORNER A"}
                  </span>
                  <span className="font-mono text-3xl font-black text-white">
                    {event.battleScores && Number.isFinite(event.battleScores.scoreA)
                      ? event.battleScores.scoreA
                      : "—"}
                  </span>
                </div>
                <span className="font-mono text-lg font-black text-fuchsia-500">VS</span>
                <div className="flex flex-col items-center">
                  <span className="font-mono text-sm text-fuchsia-400 font-bold uppercase">
                    {event.battleScores?.participantB ?? "CORNER B"}
                  </span>
                  <span className="font-mono text-3xl font-black text-white">
                    {event.battleScores && Number.isFinite(event.battleScores.scoreB)
                      ? event.battleScores.scoreB
                      : "—"}
                  </span>
                </div>
              </div>
            )}

            {/* Round Clock / Countdown — only when real timer supplied */}
            {event.roundTimerSeconds !== undefined && (
              <div
                data-testid="jumbotron-round-timer"
                className="my-1 font-mono text-4xl font-black tracking-tight"
                style={{ color: accent }}
              >
                {event.roundTimerSeconds}s
              </div>
            )}

            {/* Main Headline */}
            {event.headline && (
              <h2
                data-testid="jumbotron-headline"
                className="text-xl md:text-2xl font-black tracking-wide text-white uppercase drop-shadow-md"
              >
                {event.headline}
              </h2>
            )}

            {/* Subline */}
            {event.subline && (
              <p
                data-testid="jumbotron-subline"
                className="mt-1 font-mono text-xs md:text-sm text-gray-300"
              >
                {event.subline}
              </p>
            )}

            {/* Challenge ACGBR four-face strip — roles only, never fake scores */}
            {challengeFacePlan && challengeFacePlan.length === 4 && (
              <div
                data-testid="jumbotron-challenge-face-strip"
                className="mt-3 grid w-full max-w-sm grid-cols-2 gap-1.5"
              >
                {challengeFacePlan.map((face) => (
                  <div
                    key={face.face}
                    data-face={face.face}
                    data-face-role={face.role}
                    className="rounded border px-2 py-1 text-left font-mono text-[9px] font-bold uppercase tracking-wider"
                    style={{
                      borderColor: `${challengeFaceRoleAccent(face.role)}66`,
                      color: challengeFaceRoleAccent(face.role),
                      background: `${challengeFaceRoleAccent(face.role)}14`,
                    }}
                  >
                    {face.face} · {face.role.replace(/_/g, " ")}
                  </div>
                ))}
              </div>
            )}

            {/* Dedicated Disco Orb Segment Visual for World Dance Party */}
            {pack.proceduralFeatures.hasDiscoOrb && (
              <div
                data-testid="jumbotron-disco-orb-visual"
                className="relative my-2 flex h-20 w-20 items-center justify-center rounded-full border-2 animate-spin"
                style={{
                  borderColor: accent,
                  background: `radial-gradient(circle, #FF2DAA 0%, #00FFFF 70%, #110022 100%)`,
                  boxShadow: `0 0 20px ${accent}`,
                  animationDuration: "6s",
                }}
              >
                <div className="h-14 w-14 rounded-full border border-white/50 bg-black/40 backdrop-blur-sm" />
              </div>
            )}

            {/* Reward & Gift Real Settlement Verification Badge */}
            {(event.rewardTruth || event.giftTruth) && (
              <div
                data-testid="jumbotron-settlement-badge"
                className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-950/60 px-3 py-0.5 border border-emerald-500/40 text-[10px] font-mono text-emerald-400 font-bold"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                VERIFIED LEDGER SETTLEMENT • TRUTH PRESERVED
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <span className="font-mono text-xs text-gray-500 tracking-widest uppercase mb-1">
              [ 24/7 JUMBOTRON AUTOMATION ACTIVE ]
            </span>
            <span className="font-mono text-sm text-gray-400">
              STANDBY FOR NEXT BROADCAST SEGMENT
            </span>
          </div>
        )}
      </div>

      {/* Bottom Telemetry & Station ID Footer */}
      <div
        className="flex items-center justify-between border-t pt-2 font-mono text-[10px] text-gray-500"
        style={{ borderColor: `${accent}22` }}
      >
        <span>TMI JUMBOTRON DIRECTOR • TRUTH ENGINE</span>
        <span>VEN: {pack.id.toUpperCase()}</span>
      </div>
    </div>
  );
}
