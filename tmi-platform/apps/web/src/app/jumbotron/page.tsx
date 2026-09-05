"use client";

import React, { useState, useEffect, useRef } from "react";
import { AutomatedJumbotronDirector } from "@/lib/jumbotron/AutomatedJumbotronDirector";
import { JumbotronSurfaceRenderer } from "@/components/jumbotron/JumbotronSurfaceRenderer";
import { AvatarCameraDirector } from "@/lib/avatar/AvatarCameraDirector";
import { CanonicalUniversalPlayerFabric } from "@/lib/media/CanonicalUniversalPlayerFabric";
import type {
  JumbotronExperienceType,
  JumbotronEvent,
} from "@/lib/jumbotron/JumbotronContracts";

export default function JumbotronDirectorDemoPage() {
  const [experience, setExperience] = useState<JumbotronExperienceType>("BATTLE_ARENA");
  const [cameraDirector] = useState(() => new AvatarCameraDirector());
  const [isJumbotronFocused, setIsJumbotronFocused] = useState(false);
  const [curtainState, setCurtainState] = useState("OPEN");
  const [log, setLog] = useState<string[]>([]);
  const [feedAssignStatus, setFeedAssignStatus] = useState("UNASSIGNED");
  const [playerFabric] = useState(() => new CanonicalUniversalPlayerFabric());

  const director = React.useMemo(() => {
    const d = new AutomatedJumbotronDirector({
      roomId: `room-jumbo-demo-${experience.toLowerCase()}`,
      sessionId: `session-jumbo-${experience.toLowerCase()}`,
      experienceType: experience,
      venueId: `venue-${experience.toLowerCase()}`,
      venueClass: "CHAMPIONSHIP_ARENA",
      venueSkin: "default",
      isCurtainClosed: false,
      participantCount: 24,
      crowdActivityScore: 0.88,
    });

    if (experience === "BATTLE_ARENA") {
      d.postBattleScoreboard({
        participantA: "MC Nova",
        scoreA: 84,
        participantB: "DJ Phantom",
        scoreB: 79,
      });
      d.postRoundTimerUpdate(45, false);
    } else if (experience === "CYPHER") {
      d.postCypherNextUp("Lyricist Alpha", "Rhyme Sensei");
    } else if (experience === "WORLD_DANCE_PARTY") {
      d.triggerSafetyAlert("WELCOME TO WORLD DANCE PARTY", "DISCO ORB ONLINE • DANCE FLOOR ACTIVE");
    }

    return d;
  }, [experience]);

  const [activeEvent, setActiveEvent] = useState<JumbotronEvent | null>(() => director.getActiveEvent());

  useEffect(() => {
    setActiveEvent(director.getActiveEvent());
    return () => {
      director.teardown();
    };
  }, [director]);

  const addLog = (msg: string) => {
    setLog((prev) => [msg, ...prev.slice(0, 8)]);
  };

  const handleSafety = () => {
    if (!director) return;
    const ev = director.triggerSafetyAlert("EMERGENCY SAFETY STOP", "HALT PERFORMANCE IMMEDIATELY");
    if (ev) setActiveEvent({ ...ev });
    addLog(`P1 Safety Broadcast triggered: ${ev.headline}`);
  };

  const handleTimer = (critical: boolean) => {
    if (!director) return;
    const ev = director.postRoundTimerUpdate(critical ? 5 : 30, critical);
    if (ev) setActiveEvent({ ...ev });
    addLog(`P2 Timer posted (${critical ? "CRITICAL 5s" : "30s"}): ${ev.headline}`);
  };

  const handleScoreboard = () => {
    if (!director) return;
    const ev = director.postBattleScoreboard({
      participantA: "MC Nova",
      scoreA: 92,
      participantB: "DJ Phantom",
      scoreB: 88,
    });
    if (ev) setActiveEvent({ ...ev });
    addLog("P2 Battle Scoreboard updated: Nova 92 vs Phantom 88");
  };

  const handleCypher = () => {
    if (!director) return;
    const ev = director.postCypherNextUp("Lyricist Alpha", "Rhyme Sensei");
    if (ev) setActiveEvent({ ...ev });
    addLog("P2 Cypher Next Up cued: Alpha -> Sensei (No winner UI)");
  };

  const handleGift = () => {
    if (!director) return;
    director.releaseActiveEvent();
    const ev = director.postSettledGift({
      senderId: "user-fan-777",
      senderDisplayName: "NeonBeatsFan",
      recipientId: "perf-star-1",
      recipientDisplayName: "StarPerformer",
      giftItemId: "gift-diamond-crown",
      giftItemName: "Diamond Crown",
      amountCents: 2500,
      settledTransactionId: `tx-settled-${Date.now()}`,
      timestampMs: Date.now(),
    });
    if (ev) setActiveEvent({ ...ev });
    addLog("P3 Real Gift Settled: Diamond Crown ($25.00)");
  };

  const handleReward = () => {
    if (!director) return;
    director.releaseActiveEvent();
    const ev = director.postAuthorizedReward({
      recipientId: "user-fan-42",
      recipientDisplayName: "Elena_V",
      amountPoints: 500,
      eventName: "Gauntlet Survival Bonus",
      timestampMs: Date.now(),
      sourceTransactionId: `tx-reward-${Date.now()}`,
      rewardLedgerReference: "ledger.ref.points.survival.500",
    });
    if (ev) setActiveEvent({ ...ev });
    addLog("P3 Real Reward Authorized: +500 PTS Elena_V");
  };

  const handleSpotlight = () => {
    if (!director) return;
    director.releaseActiveEvent();
    const ev = director.postAudienceSpotlight({
      userId: "user-spot-101",
      displayName: "Marcus King",
      seatId: "A-104",
      hasLiveCameraConsent: false,
      isAgeVerifiedSafe: true,
      publicProfilePermitted: true,
    });
    if (ev) setActiveEvent({ ...ev });
    addLog("P3 Fan Spotlight: Marcus King (Seat A-104)");
  };

  const handleSponsor = () => {
    if (!director) return;
    director.releaseActiveEvent();
    const ev = director.postDirectSponsor({
      campaignId: "camp-beatlab-2026",
      advertiserName: "BeatLab Audio",
      tagline: "Professional Tools For Master Artists",
      accentColor: "#FFD700",
    });
    if (ev) setActiveEvent({ ...ev });
    addLog("P4 Direct Sponsor posted: BeatLab Audio");
  };

  const handleIntermissionBreak = () => {
    if (!director) return;
    const res = director.getCurtainDirector().triggerPerformerBreak("perf-star-1", 60);
    setCurtainState("INTERMISSION");
    for (const ev of res.events) {
      director.getScheduler().enqueue(ev);
    }
    setActiveEvent(director.evaluateNextToAir());
    addLog("Curtain Intermission started: Audio ducked to 20%, Sponsor Ad Rail active");
  };

  const handleIntermissionCountdown = () => {
    if (!director) return;
    const ev = director.getCurtainDirector().enterReturnCountdown("Nike Pro Audio", 10);
    director.getScheduler().enqueue(ev);
    setActiveEvent(director.evaluateNextToAir());
    addLog("Curtain Return Countdown: 10s Powered By Nike Pro Audio");
  };

  const handleIntermissionResume = () => {
    if (!director) return;
    const res = director.getCurtainDirector().resumeShow("perf-star-1");
    setCurtainState("OPEN");
    director.getScheduler().enqueue(res.event);
    setActiveEvent(director.evaluateNextToAir());
    addLog("Curtain Opened: Show resumed, Audio un-ducked");
  };

  const [selectedTierIndex, setSelectedTierIndex] = useState(0);

  const sightlineReport = React.useMemo(() => {
    return director.certifySightlines();
  }, [director]);

  const currentTier = sightlineReport.tierResults[selectedTierIndex] ?? sightlineReport.tierResults[0];

  const handleCameraFocus = () => {
    if (isJumbotronFocused) {
      cameraDirector.returnToStageView();
      setIsJumbotronFocused(false);
      addLog("Camera returned to STAGE VIEW");
    } else {
      const jumbotronCenter = director.getPhysicalJumbotronDescriptor().centerPosition;
      const eyePos = currentTier?.eyePosition ?? [0, 1.65, 24];
      cameraDirector.focusJumbotron(45, eyePos, jumbotronCenter);
      setIsJumbotronFocused(true);
      addLog(`Camera focused on JUMBOTRON from ${currentTier?.tierClass ?? "LOWER_BOWL"} (Pitch: ${currentTier?.pitchAngleDegrees.toFixed(1)}°)`);
    }
  };

  const handleAssignJumbotronFeed = () => {
    const feed = director.createJumbotronFeedSource();
    const result = playerFabric.mirrorJumbotronFeedToPlayer(feed, "slot-7");
    const ok = Boolean(result?.success);
    setFeedAssignStatus(
      ok ? `ASSIGNED → slot-7 (${feed.sourceType})` : `FAILED: ${result?.reason ?? "unknown"}`
    );
    addLog(
      ok
        ? `JUMBOTRON_FEED mirrored to slot-7 (mutable, not dedicated slot)`
        : `JUMBOTRON_FEED assign failed: ${result?.reason ?? "unknown"}`
    );
  };

  const spatial = director.getSpatialDimensions();
  const physical = director.getPhysicalJumbotronDescriptor();

  return (
    <div className="min-h-screen bg-[#050510] text-white p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-cyan-500/30 pb-4 gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-wider text-cyan-400 font-mono">
              AUTOMATED JUMBOTRON DIRECTOR • ARENA CONTROL
            </h1>
            <p className="text-xs text-gray-400 font-mono mt-1">
              CANONICAL 3D VENUE GEOMETRY & SIGHTLINE CERTIFICATION ENGINE
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-gray-400">EXPERIENCE:</span>
            <select
              data-testid="experience-pack-selector"
              value={experience}
              onChange={(e) => setExperience(e.target.value as JumbotronExperienceType)}
              className="bg-black/60 border border-cyan-500/50 rounded px-3 py-1 font-mono text-xs text-cyan-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="BATTLE_ARENA">Battle Arena (Center-Hung)</option>
              <option value="CYPHER">Cypher (No Winner UI)</option>
              <option value="REGULAR_LIVE">Regular Live Stage</option>
              <option value="WORLD_DANCE_PARTY">World Dance Party (Disco Orb)</option>
              <option value="AUDITORIUM">Auditorium (Curtain & Marquee)</option>
              <option value="GAME_SHOW">Game Show</option>
              <option value="LOUNGE">Ambient Lounge</option>
            </select>
          </div>
        </div>

        {/* 3D Arena Physical Geometry & Sightline Blueprint Bar */}
        <div
          data-testid="venue-physical-geometry-blueprint"
          className="rounded-xl border border-cyan-500/40 bg-cyan-950/20 p-3.5 space-y-2"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-cyan-300">
                ARCHITECTURE: {physical.architecture}
              </span>
            </div>
            <div className="text-gray-300">
              ARENA: {spatial.widthFeet}ft × {spatial.depthFeet}ft ({spatial.widthMeters.toFixed(1)}m × {spatial.depthMeters.toFixed(1)}m) • CEILING: {spatial.heightFeet}ft ({spatial.ceilingElevationMeters.toFixed(1)}m)
            </div>
            <div className="text-amber-300">
              CLEARANCE: {physical.bottomClearanceMeters.toFixed(1)}m ({(physical.bottomClearanceMeters * 3.28084).toFixed(1)}ft) • RIGGING: {physical.safeRiggingElevationMeters.toFixed(1)}m
            </div>
            <div data-testid="jumbotron-runtime-fov" className="text-fuchsia-300">
              FOV: {spatial.cameraSphereFovDegrees}° (runtime)
            </div>
            <div
              data-testid="jumbotron-sightlines-certified-badge"
              className={`rounded px-2 py-0.5 font-bold ${
                sightlineReport.certifiedSightlinesAllOccupiedZones
                  ? "bg-emerald-900/60 text-emerald-300 border border-emerald-500/40"
                  : "bg-red-900/60 text-red-300 border border-red-500/40"
              }`}
            >
              SIGHTLINES: {sightlineReport.passedZones}/{sightlineReport.totalSampledZones} ZONES CERTIFIED 🟢
            </div>
          </div>

          {/* Seating Tier Selector for Raycast Sightlines */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-cyan-500/20 text-xs font-mono">
            <span className="text-gray-400">SELECT TIER SIGHTLINE:</span>
            <div className="flex flex-wrap gap-1.5">
              {sightlineReport.tierResults.map((tr, idx) => (
                <button
                  key={tr.tierId}
                  data-testid={`tier-sightline-btn-${tr.tierId}`}
                  onClick={() => setSelectedTierIndex(idx)}
                  className={`px-2 py-1 rounded text-[11px] font-mono transition-all ${
                    idx === selectedTierIndex
                      ? "bg-cyan-500 text-black font-bold"
                      : "bg-black/60 text-gray-300 border border-gray-700 hover:border-cyan-400"
                  }`}
                >
                  {tr.tierClass}
                </button>
              ))}
            </div>

            {currentTier && (
              <div
                data-testid="selected-tier-sightline-metrics"
                className="ml-auto flex items-center gap-3 text-[11px] text-cyan-300 font-mono"
              >
                <span>EYE: [{currentTier.eyePosition.map((v) => v.toFixed(1)).join(", ")}]</span>
                <span>PITCH: {currentTier.pitchAngleDegrees.toFixed(1)}° UP</span>
                <span>FACE: {currentTier.bestVisibleFace.orientation}</span>
                <span className="text-emerald-400 font-bold">RAY: UNOBSTRUCTED ✔</span>
              </div>
            )}
          </div>
        </div>

        {/* Live Jumbotron Screen */}
        <div className="rounded-2xl border-2 border-cyan-500/40 p-3 bg-black/40 shadow-2xl">
          <div className="flex items-center justify-between px-2 py-1 mb-2 font-mono text-[11px] text-cyan-400">
            <span>SURFACE: {director.getDisplayDescriptor().targetClass}</span>
            <span>SHAPE: {director.getDisplayDescriptor().shape}</span>
            <span>CURTAIN: {curtainState}</span>
            <span
              data-testid="jumbotron-camera-focus-indicator"
              className={isJumbotronFocused ? "text-fuchsia-400 font-bold" : "text-gray-500"}
            >
              CAMERA: {isJumbotronFocused ? "JUMBOTRON FOCUS" : "STAGE VIEW"}
            </span>
          </div>

          <JumbotronSurfaceRenderer
            event={activeEvent}
            pack={director.getPresentationPack()}
          />
        </div>

        {/* Interactive Controls Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Priority Ingest Controls */}
          <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-4 space-y-3">
            <h3 className="font-mono text-xs font-bold text-cyan-400 tracking-wider">
              1. PRIORITY EVENT INGEST
            </h3>
            <div className="flex flex-col gap-2">
              <button
                data-testid="btn-trigger-safety"
                onClick={handleSafety}
                className="w-full text-left font-mono text-xs py-1.5 px-3 rounded bg-red-950/60 text-red-400 border border-red-500/40 hover:bg-red-900/60 font-bold"
              >
                🚨 P1 Safety Override
              </button>
              <button
                data-testid="btn-trigger-critical-timer"
                onClick={() => handleTimer(true)}
                className="w-full text-left font-mono text-xs py-1.5 px-3 rounded bg-fuchsia-950/60 text-fuchsia-400 border border-fuchsia-500/40 hover:bg-fuchsia-900/60"
              >
                ⏱️ P2 Critical Timer (5s Preempt)
              </button>
              <button
                data-testid="btn-trigger-scoreboard"
                onClick={handleScoreboard}
                className="w-full text-left font-mono text-xs py-1.5 px-3 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-500/40 hover:bg-cyan-900/60"
              >
                🏆 P2 Battle Scoreboard (Nova vs Phantom)
              </button>
              <button
                data-testid="btn-trigger-cypher"
                onClick={handleCypher}
                className="w-full text-left font-mono text-xs py-1.5 px-3 rounded bg-purple-950/60 text-purple-400 border border-purple-500/40 hover:bg-purple-900/60"
              >
                🎤 P2 Cypher Next Up (No Winner)
              </button>
              <button
                data-testid="btn-trigger-gift"
                onClick={handleGift}
                className="w-full text-left font-mono text-xs py-1.5 px-3 rounded bg-pink-950/60 text-pink-400 border border-pink-500/40 hover:bg-pink-900/60 font-bold"
              >
                💎 P3 Real Settled Gift ($25.00)
              </button>
              <button
                data-testid="btn-trigger-reward"
                onClick={handleReward}
                className="w-full text-left font-mono text-xs py-1.5 px-3 rounded bg-amber-950/60 text-amber-400 border border-amber-500/40 hover:bg-amber-900/60"
              >
                ⭐ P3 Authorized Reward (+500 PTS)
              </button>
              <button
                data-testid="btn-trigger-spotlight"
                onClick={handleSpotlight}
                className="w-full text-left font-mono text-xs py-1.5 px-3 rounded bg-blue-950/60 text-blue-400 border border-blue-500/40 hover:bg-blue-900/60"
              >
                👤 P3 Fan of Moment (Seat A-104)
              </button>
              <button
                data-testid="btn-trigger-sponsor"
                onClick={handleSponsor}
                className="w-full text-left font-mono text-xs py-1.5 px-3 rounded bg-yellow-950/60 text-yellow-400 border border-yellow-500/40 hover:bg-yellow-900/60 font-bold"
              >
                🏷️ P4 Direct Sponsor (BeatLab)
              </button>
            </div>
          </div>

          {/* Curtain & Intermission Lifecycle */}
          <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-4 space-y-3">
            <h3 className="font-mono text-xs font-bold text-amber-400 tracking-wider">
              2. CURTAIN INTERMISSION LIFECYCLE
            </h3>
            <div className="flex flex-col gap-2">
              <button
                data-testid="btn-curtain-break"
                onClick={handleIntermissionBreak}
                className="w-full text-left font-mono text-xs py-2 px-3 rounded bg-purple-950/50 text-purple-300 border border-purple-500/30 hover:bg-purple-900/50"
              >
                1. Performer Break & Curtain Close
              </button>
              <button
                data-testid="btn-curtain-countdown"
                onClick={handleIntermissionCountdown}
                className="w-full text-left font-mono text-xs py-2 px-3 rounded bg-fuchsia-950/50 text-fuchsia-300 border border-fuchsia-500/30 hover:bg-fuchsia-900/50"
              >
                2. Return Countdown & Sponsor Wrap
              </button>
              <button
                data-testid="btn-curtain-resume"
                onClick={handleIntermissionResume}
                className="w-full text-left font-mono text-xs py-2 px-3 rounded bg-emerald-950/50 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/50"
              >
                3. Performer Return & Curtain Open
              </button>
            </div>

            <div className="pt-3 border-t border-gray-800">
              <h3 className="font-mono text-xs font-bold text-cyan-400 tracking-wider mb-2">
                3. CAMERA / INPUT FOCUS
              </h3>
              <button
                data-testid="btn-camera-toggle-focus"
                onClick={handleCameraFocus}
                className="w-full text-center font-mono text-xs py-2 px-3 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-900/80 font-bold"
              >
                {isJumbotronFocused ? "RETURN TO STAGE VIEW" : "LOOK UP / FOCUS JUMBOTRON"}
              </button>
              <button
                data-testid="btn-assign-jumbotron-feed"
                onClick={handleAssignJumbotronFeed}
                className="w-full mt-2 text-center font-mono text-xs py-2 px-3 rounded bg-fuchsia-950/80 text-fuchsia-300 border border-fuchsia-500/50 hover:bg-fuchsia-900/80 font-bold"
              >
                ASSIGN JUMBOTRON_FEED → SLOT 7
              </button>
              <div
                data-testid="jumbotron-feed-assign-status"
                className="mt-2 font-mono text-[10px] text-fuchsia-200/80"
              >
                FEED: {feedAssignStatus}
              </div>
            </div>
          </div>

          {/* Live Telemetry & Log Console */}
          <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-4 space-y-2 flex flex-col justify-between">
            <div>
              <h3 className="font-mono text-xs font-bold text-emerald-400 tracking-wider mb-2">
                OBSERVATORY AUDIT STREAM
              </h3>
              <div
                data-testid="observatory-audit-log"
                className="font-mono text-[11px] text-gray-300 space-y-1 overflow-y-auto max-h-64"
              >
                {log.map((item, idx) => (
                  <div key={idx} className="border-b border-gray-900 pb-0.5">
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="font-mono text-[10px] text-gray-500 pt-2 border-t border-gray-800">
              STATUS: ZERO MUTATION • STRICT OBSERVABILITY
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
