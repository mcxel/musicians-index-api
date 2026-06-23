"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import BroadcastDeckWall from "@/components/broadcast/BroadcastDeckWall";
import { HOME5_DECK_SEQUENCE } from "@/lib/broadcast/BroadcastRotationEngine";
import BattleBelt from "@/components/belts/BattleBelt";
import LiveBelt from "@/components/belts/LiveBelt";
import TmiBadgeLabel from "@/components/typography/TmiBadgeLabel";
import TmiCardTitle from "@/components/typography/TmiCardTitle";
import TmiHeadline from "@/components/typography/TmiHeadline";
import TmiMetric from "@/components/typography/TmiMetric";
import TripleImageCarousel from "@/lib/media/TripleImageCarousel";
import GlobalTopNavRail from "@/components/home/GlobalTopNavRail";
import BreakingNewsTicker from "@/components/home/BreakingNewsTicker";
import SponsorTickerRail from "@/components/home/SponsorTickerRail";
import LiveMagazineVoiceTicker from "@/components/home/LiveMagazineVoiceTicker";
import WeeklyContestRail from "@/components/home/WeeklyContestRail";
import WinnerReplayWall from "@/components/home/WinnerReplayWall";
import Home5BattleDensityRail from "@/components/home/Home5BattleDensityRail";
import SubmissionPulseRail from "@/components/home/SubmissionPulseRail";
import Home5BattleOfWeekRail from "@/components/home/Home5BattleOfWeekRail";
import Home5CypherOfWeekRail from "@/components/home/Home5CypherOfWeekRail";
import Home5XPLadderRail from "@/components/home/Home5XPLadderRail";
import Home5OpenRoomsGrid from "@/components/home/Home5OpenRoomsGrid";
import { enforceRouteOwnership } from '@/lib/routes/TmiVisualRouteMap';
import { getVisualSlot } from '@/lib/visuals/TmiVisualSlotRegistry';
import "@/styles/tmiTypography.css";
import { battleChallengeRequestEngine } from '@/lib/competition/BattleChallengeRequestEngine';
import { battleChallengeEconomyEngine, CHALLENGE_ENTRY_FEE_POINTS } from '@/lib/competition/BattleChallengeEconomyEngine';
import { BattleActor } from '@/lib/competition/BattleEligibilityEngine';
import { battleMatchLifecycleEngine, UNIVERSAL_BATTLE_WINDOW_SECONDS } from '@/lib/competition/BattleMatchLifecycleEngine';
import { CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/competition/ChampionshipYearlyEngine";
import GlobalLiveBelt from "@/components/home/GlobalLiveBelt";
import SmartCameraDirector from "@/components/stage/SmartCameraDirector";
import AudienceField from "@/components/live/AudienceField";
import BillboardLiveWall from '@/components/media/BillboardLiveWall';
import { getSessionsByCategory } from '@/lib/broadcast/GlobalLiveSessionRegistry'; // UNIFICATION
import { getPerformerById, type PerformerIdentity, PERFORMER_REGISTRY } from '@/lib/performers/PerformerRegistry'; // UNIFICATION
import RoomContainer from '@/components/room/RoomContainer';
import WidgetDrawer from '@/components/room/WidgetDrawer';
import NeonWaveUnderlay from '@/components/atmosphere/NeonWaveUnderlay';
import UnifiedAdSlot from '@/components/ads/UnifiedAdSlot';

// ─── Championship categories displayed on Home 5 ─────────────────────────────

const CHAMPIONSHIP_CATEGORIES = [
  { category: "battle-of-the-band" as const, prize: "$5,000", sponsors: 12, accent: "#FF6B35" },
  { category: "rapper" as const,             prize: "$2,500", sponsors: 8,  accent: "#FF2DAA" },
  { category: "comedian" as const,           prize: "$2,000", sponsors: 6,  accent: "#AA2DFF" },
  { category: "dancer" as const,             prize: "$1,500", sponsors: 7,  accent: "#00FFFF" },
  { category: "singer" as const,             prize: "$3,000", sponsors: 10, accent: "#FFD700" },
  { category: "dj" as const,                 prize: "$1,000", sponsors: 5,  accent: "#00FF88" },
] as const;

// ─── Challenge targets — registry-driven ─────────────────────────────────────

const TIER_MAP: Record<string, BattleActor['tier']> = {
  RUBY: 'RUBY', Silver: 'silver', Gold: 'gold', Platinum: 'platinum', Diamond: 'diamond',
};

const challengeTargets: BattleActor[] = PERFORMER_REGISTRY
  .filter((p) => p.category === 'Rap' || p.category === 'Hip-Hop')
  .slice(0, 3)
  .map((p) => ({
    userId: p.id,
    displayName: p.name,
    tier: TIER_MAP[p.tier] ?? 'silver',
    role: 'artist' as const,
    ageVerified: true,
  }));

const currentActor: BattleActor = {
  userId: "artist-home5-host",
  displayName: "Home5 Host",
  tier: "gold",
  role: "artist",
  ageVerified: true,
};

export default function Home5BattleCypherSurface() {
  enforceRouteOwnership('/home/5');
  getVisualSlot('home-5-hero');

  const [challengeNotice, setChallengeNotice] = useState<string>("");
  const [challengeFeedVersion, setChallengeFeedVersion] = useState(0);
  const [challengeActionBusy, setChallengeActionBusy] = useState(false);
  const [liveBattles, setLiveBattles] = useState<PerformerIdentity[]>([]);
  const [liveCyphers, setLiveCyphers] = useState<PerformerIdentity[]>([]);

  useEffect(() => {
    // --- COMPETITION LAYER (PRESERVED) ---
    battleChallengeEconomyEngine.seedUser(currentActor.userId, 120);
    challengeTargets.forEach((target, index) => {
      battleChallengeEconomyEngine.seedUser(target.userId, 90 - index * 10);
    });

    // --- DISCOVERY LAYER (UNIFIED) ---
    const fetchLiveSessions = () => {
      const battles = getSessionsByCategory('battle').map(s => getPerformerById(s.userId)).filter((p): p is PerformerIdentity => !!p);
      const cyphers = getSessionsByCategory('cypher').map(s => getPerformerById(s.userId)).filter((p): p is PerformerIdentity => !!p);
      setLiveBattles(battles);
      setLiveCyphers(cyphers);
    };

    fetchLiveSessions();
    const intervalId = setInterval(fetchLiveSessions, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId);
  }, []);

  const refreshChallengeFeed = () => setChallengeFeedVersion((v) => v + 1);

  const launchChallenge = (mode: "open" | "direct") => {
    if (challengeActionBusy) return;
    setChallengeActionBusy(true);
    const target = mode === "direct" ? challengeTargets[1]! : challengeTargets[0]!;
    const format = mode === "direct" ? "dirty-dozens" : "dance-off";
    const submitted = battleChallengeRequestEngine.submitRequest({
      challenger: currentActor, target, format,
      directChallenge: mode === "direct", teamSize: 1,
    });
    if (!submitted.ok || !submitted.request) {
      setChallengeNotice(`Challenge blocked: ${submitted.reason ?? "unknown"}`);
      setChallengeActionBusy(false);
      return;
    }
    const accepted = battleChallengeRequestEngine.acceptRequest(submitted.request.challengeId);
    if (!accepted.ok || !accepted.request) {
      setChallengeNotice(`Created but pending: ${accepted.reason ?? "waiting"}`);
      setChallengeActionBusy(false);
      refreshChallengeFeed();
      return;
    }
    const liveBattleId = accepted.request.battleId;
    const remaining = liveBattleId ? battleMatchLifecycleEngine.getRemainingSeconds(liveBattleId) : 0;
    setChallengeNotice(
      `Challenge live: ${accepted.request.challenger.displayName} vs ${accepted.request.target.displayName} · ${Math.max(0, remaining)}s`,
    );
    setChallengeActionBusy(false);
    refreshChallengeFeed();
  };

  const currentBalance = battleChallengeEconomyEngine.getBalance(currentActor.userId);
  const activeChallenges = battleChallengeRequestEngine.listActiveRequests();

  return (
    <RoomContainer roomId="home-5" title="Battles & Cyphers" accentColor="#FF2DAA" bpm={140}>
    <main
      style={{
        minHeight: "100vh",
        padding: "0 0 60px",
        background: "radial-gradient(circle at 0% 0%, rgba(255,45,170,0.16), transparent 35%), radial-gradient(circle at 100% 100%, rgba(0,255,255,0.12), transparent 40%), linear-gradient(170deg, #050510, #0c0618)",
        position: "relative",
      }}
    >
      <NeonWaveUnderlay colorA="#FF2DAA" colorB="#AA2DFF" colorC="#FFD700" opacity={0.12} zIndex={0} />
      <style>{`
        @media (max-width: 639px) {
          [data-cbc-grid] { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <GlobalTopNavRail />
      <BreakingNewsTicker />
      <SponsorTickerRail />
      <LiveMagazineVoiceTicker pageId="home-5" accent="#FF2DAA" />

      {/* ══ BLUEPRINT TRIANGLE HEADER — tmi_arena_triangle_battles_cyphers_challenges ══ */}
      <div style={{
        background: 'linear-gradient(135deg,rgba(255,45,170,.15),rgba(255,215,0,.1),rgba(0,229,255,.1))',
        borderBottom: '2px solid rgba(255,215,0,.3)',
        padding: '18px 24px',
        textAlign: 'center',
      }}>
        <div style={{ fontFamily: 'var(--font-orbitron,"Orbitron",sans-serif)', fontSize: 'clamp(20px,4vw,28px)', fontWeight: 900, letterSpacing: '.06em', marginBottom: 4 }}>
          <span style={{ color: '#FF2DAA' }}>BATTLE</span>
          <span style={{ color: 'rgba(255,255,255,.3)', margin: '0 12px' }}>·</span>
          <span style={{ color: '#00E5FF' }}>CYPHER</span>
          <span style={{ color: 'rgba(255,255,255,.3)', margin: '0 12px' }}>·</span>
          <span style={{ color: '#FFD700' }}>CHALLENGE</span>
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', letterSpacing: '.12em' }}>
          ONE ARENA SYSTEM — RUNS ALL DAY — AUDIENCE ALWAYS WATCHING
        </div>
      </div>

      {/* ══ THE TRIANGLE VISUAL — 3 columns ══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        {/* BATTLE column */}
        <div style={{ background: 'linear-gradient(180deg,rgba(255,45,170,.12),rgba(5,8,21,.95))', borderRight: '1px solid rgba(255,255,255,.08)', padding: '18px 16px' }}>
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <div style={{ fontFamily: 'var(--font-orbitron,"Orbitron",sans-serif)', fontSize: 16, fontWeight: 900, color: '#FF2DAA', marginBottom: 3 }}>BATTLE</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>1v1 Head-to-Head</div>
          </div>
          <div style={{ background: 'rgba(255,45,170,.08)', border: '1px solid rgba(255,45,170,.3)', borderRadius: 8, padding: 12, marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,45,170,.2)', border: '2px solid #FF2DAA', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px', fontWeight: 800, fontSize: 11 }}>WV</div>
                <div style={{ fontSize: 10, fontWeight: 700 }}>Wavetek</div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,.4)' }}>Challenger</div>
              </div>
              <div style={{ flex: '0 0 32px', textAlign: 'center', fontSize: 16, fontWeight: 900, color: '#FF2DAA' }}>VS</div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,215,0,.15)', border: '2px solid #FFD700', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px', fontWeight: 800, fontSize: 11, color: '#FFD700' }}>BG</div>
                <div style={{ fontSize: 10, fontWeight: 700 }}>Bar God</div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,.4)' }}>Defender</div>
              </div>
            </div>
            <Link href="/battles/live" style={{ display: 'block', textAlign: 'center', marginTop: 8, padding: '6px', background: 'rgba(255,45,170,.2)', border: '1px solid rgba(255,45,170,.5)', borderRadius: 5, color: '#FF2DAA', textDecoration: 'none', fontSize: 10, fontWeight: 900, letterSpacing: '.06em' }}>
              ⚔️ JOIN BATTLE
            </Link>
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.5)', lineHeight: 1.7 }}>
            <div>⚔️ Judged by crowd votes + panel</div>
            <div>🏆 Winner stays, next challenger enters</div>
            <div>🎭 Arena seats 18,500 fans</div>
          </div>
        </div>

        {/* CYPHER column */}
        <div style={{ background: 'linear-gradient(180deg,rgba(0,229,255,.1),rgba(5,8,21,.95))', borderRight: '1px solid rgba(255,255,255,.08)', padding: '18px 16px' }}>
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <div style={{ fontFamily: 'var(--font-orbitron,"Orbitron",sans-serif)', fontSize: 16, fontWeight: 900, color: '#00E5FF', marginBottom: 3 }}>CYPHER</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>Open Mic · All Are Welcome</div>
          </div>
          <div style={{ background: 'rgba(0,229,255,.07)', border: '1px solid rgba(0,229,255,.25)', borderRadius: 8, padding: 12, marginBottom: 10 }}>
            <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 8px' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', border: '1.5px solid rgba(0,229,255,.3)', position: 'absolute', inset: 0 }} />
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 24 }}>🎤</div>
              {['N1','N2','N3','ON'].map((lbl, i) => {
                const positions = [{top:'2px',left:'50%',transform:'translateX(-50%)'},{top:'50%',right:'2px',transform:'translateY(-50%)'},{bottom:'2px',left:'50%',transform:'translateX(-50%)'},{top:'50%',left:'2px',transform:'translateY(-50%)'}];
                return (
                  <div key={lbl} style={{ position: 'absolute', ...positions[i] as React.CSSProperties, width: 16, height: 16, borderRadius: '50%', background: i === 3 ? 'rgba(255,215,0,.2)' : 'rgba(0,229,255,.3)', border: `1px solid ${i === 3 ? '#FFD700' : '#00E5FF'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 800, color: i === 3 ? '#FFD700' : undefined }}>
                    {lbl}
                  </div>
                );
              })}
            </div>
            <Link href="/cypher/live" style={{ display: 'block', textAlign: 'center', padding: '6px', background: 'rgba(0,229,255,.15)', border: '1px solid rgba(0,229,255,.4)', borderRadius: 5, color: '#00E5FF', textDecoration: 'none', fontSize: 10, fontWeight: 900, letterSpacing: '.06em' }}>
              🎤 ENTER CYPHER
            </Link>
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.5)', lineHeight: 1.7 }}>
            <div>🎤 Everyone gets the mic in rotation</div>
            <div>⚡ Drop bars, get voted up instantly</div>
            <div>🎭 Theater seats 2,730 — intimate</div>
          </div>
        </div>

        {/* CHALLENGE column */}
        <div style={{ background: 'linear-gradient(180deg,rgba(255,215,0,.1),rgba(5,8,21,.95))', padding: '18px 16px' }}>
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <div style={{ fontFamily: 'var(--font-orbitron,"Orbitron",sans-serif)', fontSize: 16, fontWeight: 900, color: '#FFD700', marginBottom: 3 }}>CHALLENGE</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>Song vs Song · Continuous</div>
          </div>
          <div style={{ background: 'rgba(255,215,0,.07)', border: '1px solid rgba(255,215,0,.25)', borderRadius: 8, padding: 12, marginBottom: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,255,127,.12)', border: '1px solid rgba(0,255,127,.3)', borderRadius: 5, padding: '5px 8px' }}>
                <div>
                  <div style={{ fontSize: 8, fontWeight: 700, color: '#00FF7F' }}>DEFENDING NOW</div>
                  <div style={{ fontSize: 11, fontWeight: 800 }}>Beat the Beat</div>
                </div>
                <div style={{ fontWeight: 900, color: '#00FF7F', fontSize: 12 }}>WON</div>
              </div>
              <div style={{ textAlign: 'center', fontSize: 10, color: '#FFD700', fontWeight: 700 }}>↓ NEXT CHALLENGER ↓</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,215,0,.1)', border: '1px solid rgba(255,215,0,.3)', borderRadius: 5, padding: '5px 8px' }}>
                <div>
                  <div style={{ fontSize: 8, fontWeight: 700, color: '#FFD700' }}>CHALLENGING</div>
                  <div style={{ fontSize: 11, fontWeight: 800 }}>Trap Session</div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#FFD700' }}>LIVE</div>
              </div>
            </div>
            <Link href="/challenges" style={{ display: 'block', textAlign: 'center', marginTop: 8, padding: '6px', background: 'rgba(255,215,0,.15)', border: '1px solid rgba(255,215,0,.4)', borderRadius: 5, color: '#FFD700', textDecoration: 'none', fontSize: 10, fontWeight: 900, letterSpacing: '.06em' }}>
              🏆 CHALLENGE THE WINNER
            </Link>
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.5)', lineHeight: 1.7 }}>
            <div>🎵 Challenge any song, any time</div>
            <div>👑 Winner stays, runs all day</div>
            <div>🎭 Arena seats 18,500 fans</div>
          </div>
        </div>
      </div>

      {/* ══ SHARED ARENA ENGINE ══ */}
      <div style={{ background: 'rgba(255,215,0,.04)', borderBottom: '1px solid rgba(255,215,0,.15)', padding: '12px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 10 }}>
          <span style={{ fontFamily: 'var(--font-orbitron,"Orbitron",sans-serif)', fontSize: 8, fontWeight: 700, letterSpacing: '.15em', padding: '3px 10px', borderRadius: 3, background: 'rgba(255,215,0,.12)', color: '#FFD700', border: '1px solid rgba(255,215,0,.3)' }}>
            SHARED ARENA ENGINE — ALL THREE USE THIS
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8, textAlign: 'center', maxWidth: 900, margin: '0 auto' }}>
          {[
            { icon: '🎭', label: 'AudienceScene', sub: 'Live crowd, reactions' },
            { icon: '🏟', label: 'Venue Skins', sub: 'Stadium, theater' },
            { icon: '📺', label: 'Lobby Wall', sub: 'Video panels, live' },
            { icon: '🎤', label: 'Stage Curtain', sub: 'Opens when ready' },
            { icon: '💰', label: 'Tips + Votes', sub: 'Stripe, real-time' },
          ].map((e) => (
            <div key={e.label} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 6, padding: '8px 6px' }}>
              <div style={{ fontSize: 18, marginBottom: 3 }}>{e.icon}</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.8)' }}>{e.label}</div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,.4)' }}>{e.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Hero Header ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px 0" }}>
        <TmiBadgeLabel color="#FF2DAA">CBC Arena</TmiBadgeLabel>
        <TmiHeadline as="h1" style={{ fontSize: "clamp(26px,5vw,60px)", marginTop: 8, letterSpacing: "0.03em" }}>
          CHALLENGES · BATTLES · CIPHERS
        </TmiHeadline>
        <p style={{ margin: "8px 0 0", maxWidth: 700, color: "rgba(255,255,255,0.78)", fontSize: 14, lineHeight: 1.6 }}>
          Where artists earn their reputation. Weekly belts. Monthly trophies. Yearly crowns.
          Sponsored prize pools. Fan-voted. No politics — just performance.
        </p>
      </div>

      {/* ── CBC Lobby Wall Quick-Jump ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px 0" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.35em", color: "rgba(255,255,255,0.4)", fontWeight: 800, marginBottom: 12 }}>
          JUMP TO LIVE LOBBY WALL
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { label: "⚔️ BATTLES WALL",   href: "/battles/lobby-wall",    accent: "#FF2DAA" },
            { label: "🎤 CIPHERS WALL",   href: "/cypher/lobby-wall",     accent: "#AA2DFF" },
            { label: "🏆 CHALLENGES WALL",href: "/challenges/lobby-wall", accent: "#00FFFF" },
            { label: "🎮 GAMES WALL",     href: "/games",      accent: "#FFD700" },
          ].map((w) => (
            <Link
              key={w.href}
              href={w.href}
              style={{
                padding: "11px 20px",
                background: `${w.accent}18`,
                color: w.accent,
                border: `1.5px solid ${w.accent}50`,
                borderRadius: 9,
                fontWeight: 900,
                fontSize: 12,
                textDecoration: "none",
                letterSpacing: "0.08em",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              {w.label}
              <span style={{ fontSize: 9, opacity: 0.65 }}>BRADY BUNCH →</span>
            </Link>
          ))}
        </div>
      </section>

      <Home5BattleDensityRail />

      {/* ── AD BREAK 1 — leaderboard after density rail ── */}
      <UnifiedAdSlot venue="home-5" slotKey="homepageBanner" format="horizontal" label="ADVERTISEMENT" style={{ margin: '0 24px 8px', minHeight: 90 }} accentColor="#FF2DAA" />

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 24px" }}>
        <SubmissionPulseRail accentColor="#FF2DAA" title="JUST UPLOADED · CBC ARENA" maxItems={4} />
      </section>

      {/* ── CHALLENGES — "put your song against theirs" ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 32px" }}>
        <div style={{
          borderRadius: 14,
          border: "1.5px solid rgba(170,45,255,0.45)",
          background: "linear-gradient(135deg, rgba(170,45,255,0.14) 0%, rgba(0,255,255,0.06) 100%)",
          padding: "24px 28px",
          display: "grid", gap: 16,
        }}>
          <div>
            <TmiBadgeLabel color="#AA2DFF">No Live Required</TmiBadgeLabel>
            <TmiHeadline as="h2" style={{ fontSize: "clamp(22px,3.5vw,40px)", marginTop: 8 }}>Song Challenges</TmiHeadline>
            <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.8)", fontSize: 15, lineHeight: 1.6, fontStyle: "italic" }}>
              "Put your song against theirs — submit your track, cover, or freestyle async.
               Community votes every week. No live stream needed."
            </p>
          </div>

          <div data-cbc-grid style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
            {[
              { label: "Active Challenges", value: activeChallenges.length.toString(), color: "#AA2DFF" },
              { label: "Open Submissions",  value: "—",    color: "#00FFFF" },
              { label: "This Week's Pool",  value: "—", color: "#FFD700" },
              { label: "Fan Votes Cast",    value: "—", color: "#00FF88" },
            ].map((m) => (
              <div key={m.label} style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${m.color}33`, borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: m.color }}>{m.value}</div>
                <div style={{ fontSize: 10, opacity: 0.55, marginTop: 4, letterSpacing: "0.06em" }}>{m.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
            <Link href="/challenges" style={{ background: "linear-gradient(135deg, #AA2DFF, #7700ff)", color: "#fff", borderRadius: 8, padding: "12px 20px", fontWeight: 900, fontSize: 12, textAlign: "center", textDecoration: "none", letterSpacing: "0.1em" }}>
              BROWSE CHALLENGES →
            </Link>
            <Link href="/challenges/submit" style={{ background: "rgba(170,45,255,0.14)", color: "#AA2DFF", border: "1px solid rgba(170,45,255,0.45)", borderRadius: 8, padding: "12px 20px", fontWeight: 900, fontSize: 12, textAlign: "center", textDecoration: "none", letterSpacing: "0.1em" }}>
              SUBMIT YOUR TRACK
            </Link>
          </div>
        </div>
      </section>

      {/* ── BATTLES — Challenge Economy ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 32px" }}>
        <div style={{
          borderRadius: 14,
          border: "1.5px solid rgba(255,45,170,0.42)",
          background: "linear-gradient(125deg, rgba(255,45,170,0.14) 0%, rgba(0,255,255,0.06) 100%)",
          padding: "24px 28px", display: "grid", gap: 14,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <TmiBadgeLabel color="#FF2DAA">Live Battle Economy</TmiBadgeLabel>
            <span style={{ fontSize: 11, color: "#FFD700", letterSpacing: "0.06em" }}>
              Window: {Math.floor(UNIVERSAL_BATTLE_WINDOW_SECONDS / 60)}m
            </span>
            <span style={{ fontSize: 11, color: "#00FF88" }}>Gold+ direct challenge enabled</span>
          </div>

          <div data-cbc-grid style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 10 }}>
            {/* Format Rotation */}
            <article style={{ border: "1px solid rgba(0,255,255,0.3)", borderRadius: 10, background: "rgba(5,5,16,0.68)", padding: 14, display: "grid", gap: 5 }}>
              <strong style={{ fontSize: 12, color: "#00FFFF" }}>Battle Formats</strong>
              <span style={{ fontSize: 11, opacity: 0.88 }}>dirty-dozens · mini-dozens · jug-off · dance-off</span>
              <span style={{ fontSize: 11, opacity: 0.88 }}>solo · duo · group · band-vs-band</span>
            </article>
            {/* Action console */}
            <article style={{ gridColumn: 'span 2', border: "1px solid rgba(0,255,136,0.3)", borderRadius: 10, background: "rgba(5,5,16,0.68)", padding: 14, display: "grid", gap: 8 }}>
              <strong style={{ fontSize: 12, color: "#00FF88" }}>Launch a Battle</strong>
              <button onClick={() => launchChallenge("open")} disabled={challengeActionBusy}
                style={{ border: "1px solid rgba(255,45,170,0.55)", borderRadius: 7, background: "rgba(255,45,170,0.2)", color: "#fff", padding: "8px 10px", fontSize: 11, cursor: "pointer", textAlign: "left" }}>
                Open Roster Challenge
              </button>
              <button onClick={() => launchChallenge("direct")} disabled={challengeActionBusy}
                style={{ border: "1px solid rgba(255,215,0,0.5)", borderRadius: 7, background: "rgba(255,215,0,0.16)", color: "#fff", padding: "8px 10px", fontSize: 11, cursor: "pointer", textAlign: "left" }}>
                Gold+ Pick Opponent
              </button>
            </article>
          </div>

          {challengeNotice && (
            <div style={{ fontSize: 11, border: "1px solid rgba(255,255,255,0.18)", borderRadius: 8, background: "rgba(6,6,18,0.62)", padding: "8px 12px", color: "rgba(255,255,255,0.9)" }}>
              {challengeNotice}
            </div>
          )}

          {/* Live Billboard */}
          <div data-cbc-grid style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }} key={challengeFeedVersion}>
            <div style={{ border: "1px solid rgba(255,45,170,0.32)", borderRadius: 8, padding: 10, background: "rgba(5,6,16,0.7)", display: "grid", gap: 6 }}>
              <strong style={{ fontSize: 11, color: "#FF2DAA" }}>Live Battle Feed</strong>
              {liveBattles.length === 0 ? (
                <span style={{ fontSize: 11, opacity: 0.6 }}>No active battles yet.</span>
              ) : liveBattles.slice(0, 3).map(p => (
                <Link key={p.id} href={p.liveRoomRoute ?? '#'} style={{ fontSize: 11, color: "#fff", textDecoration: "none", border: "1px solid rgba(255,45,170,0.25)", borderRadius: 6, padding: "6px 8px", background: "rgba(255,45,170,0.06)" }}>
                  {p.name} · {p.audienceCount} watching
                </Link>
              ))}
            </div>
            <div style={{ border: "1px solid rgba(0,255,255,0.32)", borderRadius: 8, padding: 10, background: "rgba(5,6,16,0.7)", display: "grid", gap: 6 }}>
              <strong style={{ fontSize: 11, color: "#00FFFF" }}>Pending Challenges</strong>
              <span style={{ fontSize: 11, opacity: 0.84 }}>Active: {activeChallenges.length}</span>
              {activeChallenges.slice(0, 3).map(r => (
                <span key={r.challengeId} style={{ fontSize: 11, opacity: 0.88 }}>
                  {r.challenger.displayName} → {r.target.displayName} ({r.status})
                </span>
              ))}
            </div>
            <div style={{ border: "1px solid rgba(0,255,136,0.32)", borderRadius: 8, padding: 10, background: "rgba(5,6,16,0.7)", display: "grid", gap: 6 }}>
              <strong style={{ fontSize: 11, color: "#00FF88" }}>Live Rooms</strong>
              {liveCyphers.length === 0 ? (
                <span style={{ fontSize: 11, opacity: 0.6 }}>No rooms yet.</span>
              ) : liveCyphers.slice(0, 3).map(p => (
                <Link key={p.id} href={p.liveRoomRoute ?? '#'} style={{ fontSize: 11, color: "#fff", textDecoration: "none", border: "1px solid rgba(0,255,136,0.25)", borderRadius: 6, padding: "6px 8px", background: "rgba(0,255,136,0.06)" }}>
                  {p.name} · LIVE
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CIPHERS — "all styles welcome" ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 32px" }}>
        <div style={{
          borderRadius: 14,
          border: "1.5px solid rgba(0,255,255,0.4)",
          background: "linear-gradient(135deg, rgba(0,255,255,0.12) 0%, rgba(170,45,255,0.08) 100%)",
          padding: "24px 28px", display: "grid", gap: 16,
        }}>
          <div>
            <TmiBadgeLabel color="#00FFFF">Open Circle</TmiBadgeLabel>
            <TmiHeadline as="h2" style={{ fontSize: "clamp(22px,3.5vw,40px)", marginTop: 8 }}>Cypher of the Week</TmiHeadline>
            <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.8)", fontSize: 15, lineHeight: 1.6, fontStyle: "italic" }}>
              "Come on — let&apos;s all get along. All styles welcome. R&B, Jazz, Hip Hop, Gospel, Latin,
               Global Drum Circle — every voice has a place in this cypher."
            </p>
          </div>

          <div data-cbc-grid style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
            {[
              { label: "XP Reward",      value: "400 XP", color: "#00FFFF" },
              { label: "Points",         value: "3,000",  color: "#FFD700" },
              { label: "Unlock",         value: "Badge",  color: "#AA2DFF" },
              { label: "Styles Active",  value: liveCyphers.length > 0 ? liveCyphers.length.toString() : "—", color: "#00FF88" },
            ].map((m) => (
              <div key={m.label} style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${m.color}33`, borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: m.color }}>{m.value}</div>
                <div style={{ fontSize: 10, opacity: 0.55, marginTop: 4, letterSpacing: "0.06em" }}>{m.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
            <Link href="/cypher/live" style={{ background: "linear-gradient(135deg, #00FFFF, #00DDEE)", color: "#000", borderRadius: 8, padding: "12px 20px", fontWeight: 900, fontSize: 12, textAlign: "center", textDecoration: "none", letterSpacing: "0.1em" }}>
              ENTER CYPHER →
            </Link>
            <Link href="/cypher/weekly" style={{ background: "rgba(0,255,255,0.10)", color: "#00FFFF", border: "1px solid rgba(0,255,255,0.4)", borderRadius: 8, padding: "12px 20px", fontWeight: 900, fontSize: 12, textAlign: "center", textDecoration: "none", letterSpacing: "0.1em" }}>
              CYPHER OF THE WEEK
            </Link>
          </div>
        </div>
      </section>

      {/* ── CHAMPIONSHIP — Weekly Belt → Yearly Crown ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 32px" }}>
        <div style={{ marginBottom: 14 }}>
          <TmiBadgeLabel color="#FFD700">Fan-Voted Championships</TmiBadgeLabel>
          <TmiHeadline as="h2" style={{ fontSize: "clamp(18px,3vw,36px)", marginTop: 8 }}>
            WEEKLY BELT → MONTHLY TROPHY → YEARLY CROWN
          </TmiHeadline>
          <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,0.65)", fontSize: 13, maxWidth: 700 }}>
            Every discipline crowns a champion. Bands, Comedians, Dancers, Actors, Singers, Producers, DJs —
            all battling for the belt. Sponsored prize pools. Your votes decide who wins.
          </p>
        </div>

        <div data-cbc-grid style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
          {CHAMPIONSHIP_CATEGORIES.map((c) => (
            <Link key={c.category} href={`/championships/${c.category}`} style={{ textDecoration: "none" }}>
              <div style={{
                borderRadius: 12, border: `1px solid ${c.accent}44`,
                background: `linear-gradient(145deg, ${c.accent}14, rgba(5,5,16,0.96))`,
                padding: "18px 20px", cursor: "pointer",
              }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{CATEGORY_ICONS[c.category]}</div>
                <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", marginBottom: 2 }}>{CATEGORY_LABELS[c.category]}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", marginBottom: 12, letterSpacing: "0.08em" }}>
                  {c.sponsors} SPONSORS ACTIVE
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 18, fontWeight: 900, color: c.accent }}>{c.prize}</span>
                  <span style={{ fontSize: 8, fontWeight: 900, background: c.accent, color: c.accent === "#FFD700" || c.accent === "#00FFFF" || c.accent === "#00FF88" ? "#000" : "#fff", borderRadius: 5, padding: "3px 8px", letterSpacing: "0.1em" }}>ENTER</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Broadcast Rotation Wall — battles, cyphers, challenges, games ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 28px" }}>
        <BroadcastDeckWall
          sequence={HOME5_DECK_SEQUENCE}
          title="ARENA"
          accentColor="#FF2DAA"
          maxTiles={8}
          intervalMs={13000}
        />
      </section>

      {/* ── Audience Field ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 24px" }}>
        <AudienceField />
      </section>

      {/* ── Weekly Contest Rail ── */}
      <WeeklyContestRail />

      {/* ── Winner Replay Wall ── */}
      <WinnerReplayWall />

      {/* ── Battle Belt ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
        <BattleBelt title="Battle Belt">
          <div style={{ display: "grid", gap: 10 }}>
            <TripleImageCarousel images={["/tmi-curated/mag-74.jpg", "/tmi-curated/gameshow-35.jpg", "/tmi-curated/mag-82.jpg"]} borderColor="#ff6b35" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
              <Link href="/battles/weekly" style={{ textDecoration: "none", color: "#fff", borderRadius: 10, border: "1px solid #ff6b3566", background: "linear-gradient(180deg, #ff6b351f 0%, rgba(6,8,18,0.9) 100%)", padding: 10 }}>
                <TmiCardTitle style={{ fontSize: 20 }}>Battle of the Week</TmiCardTitle>
                <span style={{ fontSize: 10, opacity: 0.7, display: "block", marginTop: 4 }}>3 poster rotation · Fan vote</span>
              </Link>
              <Link href="/battles/live" style={{ textDecoration: "none", color: "#fff", borderRadius: 10, border: "1px solid #ff2daa66", background: "linear-gradient(180deg, #ff2daa1f 0%, rgba(6,8,18,0.9) 100%)", padding: 10 }}>
                <TmiCardTitle style={{ fontSize: 20 }}>Join Live Battle</TmiCardTitle>
                <span style={{ fontSize: 10, opacity: 0.7, display: "block", marginTop: 4 }}>Drop into active rooms</span>
              </Link>
              <Link href="/battles/rankings" style={{ textDecoration: "none", color: "#fff", borderRadius: 10, border: "1px solid #ff6b3566", background: "linear-gradient(180deg, #ff6b351f 0%, rgba(6,8,18,0.9) 100%)", padding: 10 }}>
                <TmiCardTitle style={{ fontSize: 20 }}>Top Fighters</TmiCardTitle>
                <span style={{ fontSize: 10, opacity: 0.7, display: "block", marginTop: 4 }}>Power ranks + movement</span>
              </Link>
            </div>
          </div>
        </BattleBelt>

        {/* ── Cypher Belt ── */}
        <LiveBelt title="Cypher Belt">
          <div style={{ display: "grid", gap: 10 }}>
            <TripleImageCarousel images={["/tmi-curated/mag-66.jpg", "/tmi-curated/venue-22.jpg", "/tmi-curated/mag-58.jpg"]} borderColor="#aa2dff" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
              <Link href="/cypher/weekly" style={{ textDecoration: "none", color: "#fff", borderRadius: 10, border: "1px solid #aa2dff66", background: "linear-gradient(180deg, #aa2dff1f 0%, rgba(6,8,18,0.9) 100%)", padding: 10 }}>
                <TmiCardTitle style={{ fontSize: 20 }}>Cypher of the Week</TmiCardTitle>
                <span style={{ fontSize: 10, opacity: 0.7, display: "block", marginTop: 4 }}>Circle system · All styles</span>
              </Link>
              <Link href="/cypher/live" style={{ textDecoration: "none", color: "#fff", borderRadius: 10, border: "1px solid #00ffff66", background: "linear-gradient(180deg, #00ffff1f 0%, rgba(6,8,18,0.9) 100%)", padding: 10 }}>
                <TmiCardTitle style={{ fontSize: 20 }}>Join Live Cypher</TmiCardTitle>
                <span style={{ fontSize: 10, opacity: 0.7, display: "block", marginTop: 4 }}>Open mic now</span>
              </Link>
              <Link href="/cypher/rankings" style={{ textDecoration: "none", color: "#fff", borderRadius: 10, border: "1px solid #aa2dff66", background: "linear-gradient(180deg, #aa2dff1f 0%, rgba(6,8,18,0.9) 100%)", padding: 10 }}>
                <TmiCardTitle style={{ fontSize: 20 }}>Cypher Kings</TmiCardTitle>
                <span style={{ fontSize: 10, opacity: 0.7, display: "block", marginTop: 4 }}>Live crown table</span>
              </Link>
            </div>
          </div>
        </LiveBelt>
      </div>

      {/* ── Camera Director ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
          <TmiBadgeLabel color="#00FFFF">Cinematic Feed</TmiBadgeLabel>
          <span style={{ fontSize: 10, opacity: 0.72, letterSpacing: "0.08em" }}>DROP → ENGAGE → REACTION</span>
        </div>
        <SmartCameraDirector />
      </div>

      {/* ── Stat Metrics — Rule 20: only real data, never hardcoded live stats ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
          <TmiMetric value={(liveBattles.length + liveCyphers.length).toString().padStart(2, '0')} label="Live Rooms" color="#00FFFF" />
          <TmiMetric value="—" label="Season XP Movers" color="#FFD700" />
          <TmiMetric value="—" label="Prize Pool" color="#00FF88" />
        </div>
      </div>

      {/* ── Rails ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
          <Home5BattleOfWeekRail />
          <Home5CypherOfWeekRail />
          <Home5XPLadderRail />
        </div>
      </div>

      {/* ══ BATTLE ARENA WALL — registry-driven performer tiles ══ */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 28px' }}>
        <BillboardLiveWall mode="battle" maxTiles={8} title="BATTLE ARENA · LIVE NOW" showActions />
      </section>

      <Home5OpenRoomsGrid />

      {/* ── AD BREAK 2 — mid-page rectangle before live belt ── */}
      <UnifiedAdSlot venue="home-5" slotKey="homepageMid" format="rectangle" label="ADVERTISEMENT" style={{ margin: '0 24px 8px', minHeight: 250 }} accentColor="#FF2DAA" />

      <GlobalLiveBelt />
      <WidgetDrawer />
    </main>
    </RoomContainer>
  );
}
