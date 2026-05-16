"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import BattleBelt from "@/components/belts/BattleBelt";
import DiscoveryBelt from "@/components/belts/DiscoveryBelt";
import LiveBelt from "@/components/belts/LiveBelt";
import SponsorBelt from "@/components/belts/SponsorBelt";
import TmiBadgeLabel from "@/components/typography/TmiBadgeLabel";
import TmiCardTitle from "@/components/typography/TmiCardTitle";
import TmiHeadline from "@/components/typography/TmiHeadline";
import TmiMetric from "@/components/typography/TmiMetric";
import TripleImageCarousel from "@/lib/media/TripleImageCarousel";
import GlobalTopNavRail from "@/components/home/GlobalTopNavRail";
import BreakingNewsTicker from "@/components/home/BreakingNewsTicker";
import SponsorTickerRail from "@/components/home/SponsorTickerRail";
import Home5BattleDensityRail from "@/components/home/Home5BattleDensityRail";
import Home5BattleOfWeekRail from "@/components/home/Home5BattleOfWeekRail";
import Home5CypherOfWeekRail from "@/components/home/Home5CypherOfWeekRail";
import Home5XPLadderRail from "@/components/home/Home5XPLadderRail";
import Home5PrizeVaultRail from "@/components/home/Home5PrizeVaultRail";
import Home5SeasonPassRail from "@/components/home/Home5SeasonPassRail";
import Home5BeatMarketplaceRail from "@/components/home/Home5BeatMarketplaceRail";
import Home5OpenRoomsGrid from "@/components/home/Home5OpenRoomsGrid";
import { enforceRouteOwnership } from '@/lib/routes/TmiVisualRouteMap';
import { getVisualSlot } from '@/lib/visuals/TmiVisualSlotRegistry';
import "@/styles/tmiTypography.css";
import { mondayNightStageEngine } from '@/lib/competition/MondayNightStageEngine';
import { contestEngine } from '@/lib/competition/ContestEngine';
import { sponsorContestPool } from '@/lib/competition/SponsorContestPool';
import { contestQualificationEngine } from '@/lib/competition/ContestQualificationEngine';
import { battleChallengeRequestEngine } from "@/lib/competition/BattleChallengeRequestEngine";
import { battleChallengeEconomyEngine, CHALLENGE_ENTRY_FEE_POINTS } from "@/lib/competition/BattleChallengeEconomyEngine";
import { BattleActor } from "@/lib/competition/BattleEligibilityEngine";
import { battleBillboardLobbyWallEngine } from "@/lib/competition/BattleBillboardLobbyWallEngine";
import { battleMatchLifecycleEngine, UNIVERSAL_BATTLE_WINDOW_SECONDS } from "@/lib/competition/BattleMatchLifecycleEngine";
import GlobalLiveBelt from "@/components/home/GlobalLiveBelt";
import SmartCameraDirector from "@/components/stage/SmartCameraDirector";

type ActionCard = {
  title: string;
  route: string;
  detail: string;
  accent: string;
};

const actionCards: ActionCard[] = [
  { title: "Battle Of The Week", route: "/battles/weekly", detail: "3 poster rotation", accent: "#ff6b35" },
  { title: "Cypher Of The Week", route: "/cypher/weekly", detail: "3 poster rotation", accent: "#aa2dff" },
  { title: "Join Live Battle", route: "/battles/live", detail: "Drop into active rooms", accent: "#ff2daa" },
  { title: "Join Live Cypher", route: "/cypher/live", detail: "Open mic now", accent: "#00ffff" },
  { title: "Prize Vault", route: "/prizes", detail: "Current pool and claim paths", accent: "#ffd700" },
  { title: "XP Ladder", route: "/xp", detail: "Season climb and levels", accent: "#00ff88" },
  { title: "Season Pass", route: "/season-pass", detail: "Track unlock progression", accent: "#ffd700" },
  { title: "Play Now", route: "/games", detail: "Jump into game modes", accent: "#00ffff" },
];

const challengeTargets: BattleActor[] = [
  { userId: "artist-neon-07", displayName: "Neon Verse", tier: "silver", role: "artist", ageVerified: true },
  { userId: "artist-crown-11", displayName: "Crown Mic", tier: "gold", role: "performer", ageVerified: true },
  { userId: "artist-delta-29", displayName: "Delta Flame", tier: "platinum", role: "artist", ageVerified: true },
];

function RouteCard({ card }: { card: ActionCard }) {
  return (
    <Link
      href={card.route}
      style={{
        textDecoration: "none",
        color: "#fff",
        borderRadius: 10,
        border: `1px solid ${card.accent}66`,
        background: `linear-gradient(180deg, ${card.accent}1f 0%, rgba(6,8,18,0.9) 100%)`,
        padding: 10,
        display: "grid",
        gap: 6,
      }}
    >
      <TmiCardTitle style={{ fontSize: 22 }}>{card.title}</TmiCardTitle>
      <span
        className="tmi-body-copy"
        style={{
          fontSize: 12,
          opacity: 0.82,
        }}
      >
        {card.detail}
      </span>
      <span
        className="tmi-hud-label"
        style={{
          fontSize: 10,
          color: card.accent,
        }}
      >
        Open Route
      </span>
    </Link>
  );
}

export default function Home5BattleCypherSurface() {
  enforceRouteOwnership('/home/5');
  getVisualSlot('home-5-hero');

  const [countdownSeconds, setCountdownSeconds] = useState(0);
  const [mondayShow, setMondayShow] = useState<any>(null);
  const [challengeNotice, setChallengeNotice] = useState<string>("");
  const [challengeFeedVersion, setChallengeFeedVersion] = useState(0);
  const [challengeActionBusy, setChallengeActionBusy] = useState(false);

  const currentActor: BattleActor = {
    userId: "artist-home5-host",
    displayName: "Home5 Host",
    tier: "gold",
    role: "artist",
    ageVerified: true,
  };

  useEffect(() => {
    battleChallengeEconomyEngine.seedUser(currentActor.userId, 120);
    challengeTargets.forEach((target, index) => {
      battleChallengeEconomyEngine.seedUser(target.userId, 90 - index * 10);
    });

    const nextShow = mondayNightStageEngine.getNextUpcomingShow();
    setMondayShow(nextShow);

    const interval = setInterval(() => {
      setCountdownSeconds(mondayNightStageEngine.getCountdownToNextShow());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const refreshChallengeFeed = () => setChallengeFeedVersion((v) => v + 1);

  const launchChallenge = (mode: "open" | "direct") => {
    if (challengeActionBusy) return;
    setChallengeActionBusy(true);

    const target = mode === "direct" ? challengeTargets[1]! : challengeTargets[0]!;
    const format = mode === "direct" ? "dirty-dozens" : "dance-off";
    const submitted = battleChallengeRequestEngine.submitRequest({
      challenger: currentActor,
      target,
      format,
      directChallenge: mode === "direct",
      teamSize: 1,
    });

    if (!submitted.ok || !submitted.request) {
      setChallengeNotice(`Challenge blocked: ${submitted.reason ?? "unknown-reason"}`);
      setChallengeActionBusy(false);
      return;
    }

    const accepted = battleChallengeRequestEngine.acceptRequest(submitted.request.challengeId);
    if (!accepted.ok || !accepted.request) {
      setChallengeNotice(`Challenge created but not accepted: ${accepted.reason ?? "accept-failed"}`);
      setChallengeActionBusy(false);
      refreshChallengeFeed();
      return;
    }

    const liveBattleId = accepted.request.battleId;
    const remaining = liveBattleId ? battleMatchLifecycleEngine.getRemainingSeconds(liveBattleId) : 0;
    setChallengeNotice(
      `Challenge live: ${accepted.request.challenger.displayName} vs ${accepted.request.target.displayName} (${Math.max(0, remaining)}s left).`,
    );

    setChallengeActionBusy(false);
    refreshChallengeFeed();
  };

  const currentBalance = battleChallengeEconomyEngine.getBalance(currentActor.userId);
  const activeChallenges = battleChallengeRequestEngine.listActiveRequests();
  const liveWallCards = battleBillboardLobbyWallEngine.getCards().slice(0, 3);
  const liveRooms = battleBillboardLobbyWallEngine.getLiveRoomCards().slice(0, 2);

  const formatCountdown = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${days}d ${hours}h ${mins}m ${secs}s`;
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "16px clamp(12px, 3vw, 28px) 28px",
        display: "grid",
        gap: 12,
        background:
          "radial-gradient(circle at 0% 0%, rgba(255,45,170,0.16), transparent 35%), radial-gradient(circle at 100% 100%, rgba(0,255,255,0.12), transparent 40%), linear-gradient(170deg, #050510, #0c0618)",
      }}
    >
      <GlobalTopNavRail />
      <BreakingNewsTicker />
      <SponsorTickerRail />
      <Home5BattleDensityRail />

      <header style={{ display: "grid", gap: 6 }}>
        <TmiBadgeLabel color="#ff2daa">Competition + Contest Economy</TmiBadgeLabel>
        <TmiHeadline as="h1" style={{ fontSize: "clamp(34px, 6vw, 64px)" }}>
          Games, Battles, Cyphers, Contests
        </TmiHeadline>
        <p
        className="tmi-body-copy"
          style={{
            margin: 0,
            maxWidth: 760,
            color: "rgba(255,255,255,0.84)",
          }}
        >
          Battle of the Day, Cypher of the Week, Monday Night Stage, Monthly & Yearly Contests, and integrated sponsor rewards.
        </p>
      </header>

      <section style={{ display: "grid", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
          <TmiBadgeLabel color="#00ffff">Execute Director</TmiBadgeLabel>
          <span style={{ fontSize: 11, opacity: 0.82, letterSpacing: "0.08em" }}>
            DROP → ENGAGE → REACTION cinematic sequencing
          </span>
        </div>
        <SmartCameraDirector />
      </section>

      <section
        style={{
          border: "1px solid rgba(255,45,170,0.42)",
          borderRadius: 10,
          background: "linear-gradient(125deg, rgba(255,45,170,0.18) 0%, rgba(0,255,255,0.08) 50%, rgba(10,8,22,0.92) 100%)",
          padding: 14,
          display: "grid",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <TmiBadgeLabel color="#ff2daa">Challenge Economy Expansion</TmiBadgeLabel>
          <span style={{ fontSize: 11, letterSpacing: "0.06em", color: "#ffd700" }}>
            Universal Window: {Math.floor(UNIVERSAL_BATTLE_WINDOW_SECONDS / 60)}m
          </span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.86)" }}>
            Entry Fee: {CHALLENGE_ENTRY_FEE_POINTS} earned points
          </span>
          <span style={{ fontSize: 11, color: "#00ff88" }}>
            Gold+ direct challenge enabled
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 10 }}>
          <article style={{ border: "1px solid rgba(255,215,0,0.28)", borderRadius: 8, background: "rgba(5,5,16,0.68)", padding: 10, display: "grid", gap: 5 }}>
            <strong style={{ fontSize: 12, color: "#ffd700" }}>Wallet + Rules</strong>
            <span style={{ fontSize: 11, opacity: 0.88 }}>Available: {currentBalance.availableEarnedPoints} pts</span>
            <span style={{ fontSize: 11, opacity: 0.88 }}>Reserved: {currentBalance.reservedPoints} pts</span>
            <span style={{ fontSize: 11, opacity: 0.78 }}>Declined/expired requests refund reservation automatically.</span>
          </article>

          <article style={{ border: "1px solid rgba(0,255,255,0.3)", borderRadius: 8, background: "rgba(5,5,16,0.68)", padding: 10, display: "grid", gap: 6 }}>
            <strong style={{ fontSize: 12, color: "#00ffff" }}>Battle Format Rotation</strong>
            <span style={{ fontSize: 11, opacity: 0.88 }}>dirty-dozens, mini-dozens, jug-off, dance-off</span>
            <span style={{ fontSize: 11, opacity: 0.88 }}>solo-vs-solo, duo-vs-duo, group-vs-group, band-vs-band</span>
            <span style={{ fontSize: 11, opacity: 0.78 }}>All accepted battles route to wall + billboard + vote + replay + leaderboard update.</span>
          </article>

          <article style={{ border: "1px solid rgba(0,255,136,0.3)", borderRadius: 8, background: "rgba(5,5,16,0.68)", padding: 10, display: "grid", gap: 6 }}>
            <strong style={{ fontSize: 12, color: "#00ff88" }}>Action Console</strong>
            <button
              onClick={() => launchChallenge("open")}
              disabled={challengeActionBusy}
            className="tmi-button-text"
            style={{ border: "1px solid rgba(255,45,170,0.55)", borderRadius: 7, background: "rgba(255,45,170,0.2)", color: "#fff", padding: "8px 10px", fontSize: 11, cursor: "pointer", textAlign: "left", letterSpacing: "normal" }}
            >
              Launch Paid Challenge (open roster)
            </button>
            <button
              onClick={() => launchChallenge("direct")}
              disabled={challengeActionBusy}
            className="tmi-button-text"
            style={{ border: "1px solid rgba(255,215,0,0.5)", borderRadius: 7, background: "rgba(255,215,0,0.16)", color: "#fff", padding: "8px 10px", fontSize: 11, cursor: "pointer", textAlign: "left", letterSpacing: "normal" }}
            >
              Gold+ Pick Opponent (direct challenge)
            </button>
            <Link href="/battles/challenge/artist-crown-11" style={{ fontSize: 11, color: "#00ffff", textDecoration: "none" }}>
              Open Challenge Route
            </Link>
          </article>
        </div>

        {challengeNotice && (
          <div style={{ fontSize: 11, border: "1px solid rgba(255,255,255,0.18)", borderRadius: 8, background: "rgba(6,6,18,0.62)", padding: "8px 10px", color: "rgba(255,255,255,0.9)" }}>
            {challengeNotice}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }} key={challengeFeedVersion}>
          <div style={{ border: "1px solid rgba(255,45,170,0.32)", borderRadius: 8, padding: 10, background: "rgba(5,6,16,0.7)", display: "grid", gap: 6 }}>
            <strong style={{ fontSize: 11, color: "#ff2daa" }}>Live Battle Billboard Feed</strong>
            {liveWallCards.length === 0 ? (
              <span style={{ fontSize: 11, opacity: 0.72 }}>No accepted challenges yet.</span>
            ) : (
              liveWallCards.map((card) => (
                <Link key={card.battleId} href={card.route} style={{ fontSize: 11, color: "#fff", textDecoration: "none", border: "1px solid rgba(255,45,170,0.25)", borderRadius: 6, padding: "6px 8px", background: "rgba(255,45,170,0.06)" }}>
                  {card.challengerName} vs {card.targetName} · {card.formatLabel} · {card.status.toUpperCase()}
                </Link>
              ))
            )}
          </div>

          <div style={{ border: "1px solid rgba(0,255,255,0.32)", borderRadius: 8, padding: 10, background: "rgba(5,6,16,0.7)", display: "grid", gap: 6 }}>
            <strong style={{ fontSize: 11, color: "#00ffff" }}>Challenge Requests</strong>
            <span style={{ fontSize: 11, opacity: 0.84 }}>Active requests: {activeChallenges.length}</span>
            {activeChallenges.slice(0, 3).map((request) => (
              <span key={request.challengeId} style={{ fontSize: 11, opacity: 0.88 }}>
                {request.challenger.displayName} {"->"} {request.target.displayName} ({request.status})
              </span>
            ))}
          </div>

          <div style={{ border: "1px solid rgba(0,255,136,0.32)", borderRadius: 8, padding: 10, background: "rgba(5,6,16,0.7)", display: "grid", gap: 6 }}>
            <strong style={{ fontSize: 11, color: "#00ff88" }}>Published Live Rooms</strong>
            {liveRooms.length === 0 ? (
              <span style={{ fontSize: 11, opacity: 0.72 }}>No battle room artifacts yet.</span>
            ) : (
              liveRooms.map((room) => (
                <Link key={room.roomId} href={room.roomRoute} style={{ fontSize: 11, color: "#fff", textDecoration: "none", border: "1px solid rgba(0,255,136,0.25)", borderRadius: 6, padding: "6px 8px", background: "rgba(0,255,136,0.06)" }}>
                  {room.headline} · {room.isLive ? "LIVE" : "PREP"}
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* BATTLE OF THE DAY — TOP HERO */}
      <section
        style={{
          border: "1px solid rgba(255,107,53,0.4)",
          borderRadius: 10,
          background: "linear-gradient(135deg, rgba(255,107,53,0.1) 0%, rgba(255,45,170,0.05) 100%)",
          padding: 16,
          display: "grid",
          gap: 12,
        }}
      >
        <TmiBadgeLabel color="#ff6b35">Daily Rotation</TmiBadgeLabel>
        <TmiHeadline as="h2" style={{ fontSize: 28 }}>
          Battle of the Day
        </TmiHeadline>
        <p style={{ margin: 0, color: "rgba(255,255,255,0.8)" }}>
          Portrait vs Portrait. Singer vs Singer. Producer vs Producer. Rotates daily.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,107,53,0.3)", borderRadius: 8, padding: 12, display: "grid", gap: 8 }}>
            <span style={{ fontSize: 12, opacity: 0.7 }}>CONTESTANT 1</span>
            <span style={{ fontSize: 18, fontWeight: 600 }}>Singer A</span>
            <span style={{ fontSize: 11, opacity: 0.6 }}>R&B Artist</span>
          </div>
          <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,107,53,0.3)", borderRadius: 8, padding: 12, display: "grid", gap: 8 }}>
            <span style={{ fontSize: 12, opacity: 0.7 }}>CONTESTANT 2</span>
            <span style={{ fontSize: 18, fontWeight: 600 }}>Singer B</span>
            <span style={{ fontSize: 11, opacity: 0.6 }}>Gospel Artist</span>
          </div>
          <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,107,53,0.3)", borderRadius: 8, padding: 12, display: "grid", gap: 8 }}>
            <span style={{ fontSize: 12, opacity: 0.7 }}>LIVE TIMER</span>
            <span style={{ fontSize: 18, fontWeight: 600, color: "#ff6b35" }}>02:15:47</span>
            <span style={{ fontSize: 11, opacity: 0.6 }}>Until Next Battle</span>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>
          <button
            style={{
              background: "linear-gradient(135deg, #ff6b35 0%, #ff4500 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "10px 16px",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Vote Now
          </button>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            <div style={{ background: "rgba(255,107,53,0.1)", border: "1px solid rgba(255,107,53,0.3)", borderRadius: 6, padding: 10, textAlign: "center" }}>
              <span style={{ fontSize: 10, opacity: 0.7 }}>Prize</span>
            <p className="tmi-counter" style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#fff", textShadow: "none" }}>$500</p>
            </div>
            <div style={{ background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 6, padding: 10, textAlign: "center" }}>
              <span style={{ fontSize: 10, opacity: 0.7 }}>XP Reward</span>
            <p className="tmi-counter" style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#00ff88", textShadow: "none" }}>500 XP</p>
            </div>
          </div>
        </div>
        <div style={{ background: "rgba(0,0,0,0.5)", borderRadius: 6, padding: 10, textAlign: "center", fontSize: 12 }}>
          <p style={{ margin: 0, color: "#ffd700" }}>Winner receives: 5,000 Points + XP Boost + Store Item Reward</p>
        </div>
      </section>

      {/* CYPHER OF THE WEEK */}
      <section
        style={{
          border: "1px solid rgba(170,45,255,0.4)",
          borderRadius: 10,
          background: "linear-gradient(135deg, rgba(170,45,255,0.1) 0%, rgba(255,45,170,0.05) 100%)",
          padding: 16,
          display: "grid",
          gap: 12,
        }}
      >
        <TmiBadgeLabel color="#aa2dff">Weekly Rotation</TmiBadgeLabel>
        <TmiHeadline as="h2" style={{ fontSize: 28 }}>
          Cypher of the Week
        </TmiHeadline>
        <p style={{ margin: 0, color: "rgba(255,255,255,0.8)" }}>
          Circle-based cypher system. R&B Cypher, Jazz Piano Cypher, Producer Circle, Global Drum Circle.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
          <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(170,45,255,0.3)", borderRadius: 8, padding: 12, display: "grid", gap: 8, textAlign: "center" }}>
            <span style={{ fontSize: 12, opacity: 0.7 }}>XP REWARD</span>
            <span style={{ fontSize: 20, fontWeight: 600, color: "#aa2dff" }}>400 XP</span>
          </div>
          <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(170,45,255,0.3)", borderRadius: 8, padding: 12, display: "grid", gap: 8, textAlign: "center" }}>
            <span style={{ fontSize: 12, opacity: 0.7 }}>POINTS</span>
            <span style={{ fontSize: 20, fontWeight: 600, color: "#ffd700" }}>3,000 Pts</span>
          </div>
          <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(170,45,255,0.3)", borderRadius: 8, padding: 12, display: "grid", gap: 8, textAlign: "center" }}>
            <span style={{ fontSize: 12, opacity: 0.7 }}>UNLOCK</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Badge</span>
          </div>
        </div>
        <Link
          href="/cypher/live"
          style={{
            background: "linear-gradient(135deg, #aa2dff 0%, #7700ff 100%)",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "10px 16px",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: 14,
            textAlign: "center",
            textDecoration: "none",
          }}
        >
          Enter Cypher
        </Link>
      </section>

      {/* MONDAY NIGHT STAGE — CENTER FEATURE */}
      {mondayShow && (
        <section
          style={{
            border: "1px solid rgba(0,255,255,0.5)",
            borderRadius: 10,
            background: "linear-gradient(135deg, rgba(0,255,255,0.15) 0%, rgba(170,45,255,0.1) 100%)",
            padding: 16,
            display: "grid",
            gap: 12,
            boxShadow: "0 0 30px rgba(0,255,255,0.2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <TmiBadgeLabel color="#00ffff">PERMANENT PROMO</TmiBadgeLabel>
            <span style={{ fontSize: 12, color: "#00ff88", fontWeight: 600 }}>● LIVE</span>
          </div>
          <TmiHeadline as="h2" style={{ fontSize: 28 }}>
            This Week on Monday Night Stage
          </TmiHeadline>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
            <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(0,255,255,0.2)", borderRadius: 8, padding: 12, display: "grid", gap: 8 }}>
              <span style={{ fontSize: 10, opacity: 0.7, textTransform: "uppercase" }}>Featured Contestant</span>
              <span style={{ fontSize: 16, fontWeight: 600 }}>Artist Name</span>
              <span style={{ fontSize: 11, opacity: 0.6 }}>Genre / Style</span>
            </div>
            <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(0,255,255,0.2)", borderRadius: 8, padding: 12, display: "grid", gap: 8 }}>
              <span style={{ fontSize: 10, opacity: 0.7, textTransform: "uppercase" }}>Featured Sponsor</span>
              <span style={{ fontSize: 16, fontWeight: 600 }}>Sponsor Name</span>
              <span style={{ fontSize: 11, opacity: 0.6 }}>Platinum Partner</span>
            </div>
            <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(0,255,255,0.2)", borderRadius: 8, padding: 12, display: "grid", gap: 8 }}>
              <span style={{ fontSize: 10, opacity: 0.7, textTransform: "uppercase" }}>Prize Pool</span>
              <span style={{ fontSize: 16, fontWeight: 600, color: "#ffd700" }}>$5,000</span>
              <span style={{ fontSize: 11, opacity: 0.6 }}>Plus Rewards</span>
            </div>
            <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(0,255,255,0.2)", borderRadius: 8, padding: 12, display: "grid", gap: 8 }}>
              <span style={{ fontSize: 10, opacity: 0.7, textTransform: "uppercase" }}>Host</span>
              <span style={{ fontSize: 16, fontWeight: 600 }}>Host Name</span>
              <span style={{ fontSize: 11, opacity: 0.6 }}>Master of Ceremony</span>
            </div>
          </div>
          <div style={{ background: "rgba(0,255,255,0.1)", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 8, padding: 12, display: "grid", gap: 8, textAlign: "center" }}>
            <span style={{ fontSize: 12, color: "#00ffff", fontWeight: 600 }}>COUNTDOWN TO SHOW</span>
          <span className="tmi-counter" style={{ fontSize: 24 }}>
              {formatCountdown(countdownSeconds)}
            </span>
          </div>
          <div style={{ background: "rgba(0,0,0,0.5)", borderRadius: 6, padding: 10, textAlign: "center" }}>
            <p style={{ margin: 0, color: "#00ffff", fontSize: 12 }}>
              Contestants earn: 5,000 Points + Store Rewards + XP
            </p>
          </div>
          <Link
            href="/games/monday-night"
            style={{
              background: "linear-gradient(135deg, #00ffff 0%, #00ddee 100%)",
              color: "#000",
              border: "none",
              borderRadius: 6,
              padding: "10px 16px",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 14,
              textAlign: "center",
              textDecoration: "none",
            }}
          >
            Join Monday Night Stage
          </Link>
        </section>
      )}

      {/* CONTEST LAYER — MONTHLY + YEARLY */}
      <section
        style={{
          border: "1px solid rgba(255,215,0,0.4)",
          borderRadius: 10,
          background: "linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,45,170,0.05) 100%)",
          padding: 16,
          display: "grid",
          gap: 12,
        }}
      >
        <TmiBadgeLabel color="#ffd700">MAJOR SYSTEM</TmiBadgeLabel>
        <TmiHeadline as="h2" style={{ fontSize: 28 }}>
          Monthly & Yearly Contests
        </TmiHeadline>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
          {/* Monthly Contest */}
          <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 8, padding: 12, display: "grid", gap: 10 }}>
            <span style={{ fontSize: 12, opacity: 0.7, fontWeight: 600, color: "#ffd700" }}>MONTHLY CONTEST</span>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, opacity: 0.9 }}>
              <strong>Entry via:</strong> Fan votes, battle wins, cypher performance, sponsor invites
            </p>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, opacity: 0.9 }}>
              <strong>Sponsors:</strong> 10 Local + 10 Major
            </p>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, opacity: 0.9 }}>
              <strong>Rewards:</strong> 5,000+ Points, XP, Store Items
            </p>
            <Link
              href="/contests/monthly"
              style={{
                background: "rgba(255,215,0,0.2)",
                color: "#ffd700",
                border: "1px solid rgba(255,215,0,0.4)",
                borderRadius: 6,
                padding: "8px 12px",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 12,
                textAlign: "center",
                textDecoration: "none",
              }}
            >
              View Monthly
            </Link>
          </div>

          {/* Yearly Contest */}
          <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(170,45,255,0.3)", borderRadius: 8, padding: 12, display: "grid", gap: 10 }}>
            <span style={{ fontSize: 12, opacity: 0.7, fontWeight: 600, color: "#aa2dff" }}>YEARLY CONTEST</span>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, opacity: 0.9 }}>
              <strong>Uses:</strong> Monthly winners, ranked entries, sponsor picks, wildcards
            </p>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, opacity: 0.9 }}>
              <strong>Prestige:</strong> Highest award on platform
            </p>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, opacity: 0.9 }}>
              <strong>Rewards:</strong> 25,000+ Points, Premium Items, Crown
            </p>
            <Link
              href="/contests/yearly"
              style={{
                background: "rgba(170,45,255,0.2)",
                color: "#aa2dff",
                border: "1px solid rgba(170,45,255,0.4)",
                borderRadius: 6,
                padding: "8px 12px",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 12,
                textAlign: "center",
                textDecoration: "none",
              }}
            >
              View Yearly
            </Link>
          </div>
        </div>
      </section>

      {/* SPONSOR STRUCTURE — 10 LOCAL + 10 MAJOR */}
      <section
        style={{
          border: "1px solid rgba(0,255,136,0.4)",
          borderRadius: 10,
          background: "linear-gradient(135deg, rgba(0,255,136,0.1) 0%, rgba(255,45,170,0.05) 100%)",
          padding: 16,
          display: "grid",
          gap: 12,
        }}
      >
        <TmiBadgeLabel color="#00ff88">Sponsor Integration</TmiBadgeLabel>
        <TmiHeadline as="h2" style={{ fontSize: 28 }}>
          10 Local + 10 Major Sponsors
        </TmiHeadline>
        <p style={{ margin: 0, color: "rgba(255,255,255,0.8)" }}>
          Sponsors tied to competition rewards. Local: prizes, venues, gift cards. Major: national prizes, giveaways, premium merch.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
          <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 8, padding: 12, display: "grid", gap: 8 }}>
            <span style={{ fontSize: 12, opacity: 0.7, fontWeight: 600, color: "#00ff88" }}>LOCAL SPONSORS</span>
            <p style={{ margin: 0, fontSize: 13, opacity: 0.9 }}>Local business prizes, venue rewards, gift cards, local merch</p>
            <span style={{ fontSize: 14, fontWeight: 600 }}>10 Slots Available</span>
          </div>
          <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 8, padding: 12, display: "grid", gap: 8 }}>
            <span style={{ fontSize: 12, opacity: 0.7, fontWeight: 600, color: "#00ff88" }}>MAJOR SPONSORS</span>
            <p style={{ margin: 0, fontSize: 13, opacity: 0.9 }}>National prizes, major giveaways, big promotions, premium merch</p>
            <span style={{ fontSize: 14, fontWeight: 600 }}>10 Slots Available</span>
          </div>
        </div>
        <Link
          href="/sponsors/contest-pool"
          style={{
            background: "linear-gradient(135deg, #00ff88 0%, #00dd77 100%)",
            color: "#000",
            border: "none",
            borderRadius: 6,
            padding: "10px 16px",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: 14,
            textAlign: "center",
            textDecoration: "none",
          }}
        >
          View All Sponsors
        </Link>
      </section>

      {/* ORIGINAL BELTS */}
      <BattleBelt title="Battle Belt">
        <div style={{ display: "grid", gap: 10 }}>
          <TripleImageCarousel images={["/tmi-curated/mag-74.jpg", "/tmi-curated/gameshow-35.jpg", "/tmi-curated/mag-82.jpg"]} borderColor="#ff6b35" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
            <RouteCard card={actionCards[0]!} />
            <RouteCard card={actionCards[2]!} />
            <RouteCard card={{ title: "Top Fighters", route: "/battles/rankings", detail: "Power ranks and movement", accent: "#ff6b35" }} />
          </div>
        </div>
      </BattleBelt>

      <LiveBelt title="Cypher Belt">
        <div style={{ display: "grid", gap: 10 }}>
          <TripleImageCarousel images={["/tmi-curated/mag-66.jpg", "/tmi-curated/venue-22.jpg", "/tmi-curated/mag-58.jpg"]} borderColor="#aa2dff" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
            <RouteCard card={actionCards[1]!} />
            <RouteCard card={actionCards[3]!} />
            <RouteCard card={{ title: "Top Cypher Kings", route: "/cypher/rankings", detail: "Live crown table", accent: "#aa2dff" }} />
          </div>
        </div>
      </LiveBelt>

      <DiscoveryBelt title="Games Belt">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
          <RouteCard card={actionCards[7]!} />
          <RouteCard card={actionCards[4]!} />
          <RouteCard card={actionCards[5]!} />
          <RouteCard card={actionCards[6]!} />
        </div>
      </DiscoveryBelt>

      <SponsorBelt title="Progress Metrics">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
          <TmiMetric value="08" label="Live Rooms" color="#00ffff" />
          <TmiMetric value="1,240" label="Season XP Movers" color="#ffd700" />
          <TmiMetric value="$38K" label="Prize Pool" color="#00ff88" />
        </div>
      </SponsorBelt>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
        <Home5BattleOfWeekRail />
        <Home5CypherOfWeekRail />
        <Home5XPLadderRail />
        <Home5PrizeVaultRail />
        <Home5SeasonPassRail />
        <Home5BeatMarketplaceRail />
      </section>

      <Home5OpenRoomsGrid />
      <GlobalLiveBelt />
    </main>
  );
}
