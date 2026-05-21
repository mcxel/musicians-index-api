// apps/web/src/components/home/HomePage1Scheduler.tsx
// Homepage 1 wired to the scheduler engine.
// Handles genre rotation, crown scene, magazine insert, show interrupts.
// Every card uses the motion preset registry.

"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { HomepageScheduler, SchedulerState } from "../engines/homepage/homepageScheduler.engine";
import { GENRE_ROTATION_SETS, ARTIST_CLIP_TIMING, MAGAZINE_SEGMENT_TIMING } from "../engines/homepage/homepageLoopProfile";
import { startCrownPolling, CrownState, CROWN_FALLBACK } from "../adapters/homepage/weeklyCrown.adapter";
import { GENRE_RANKING_FALLBACK, GenreRankingFeed } from "../adapters/homepage/genreRankings.adapter";
import { MAGAZINE_SPOTLIGHT_FALLBACK, MagazineSpotlight } from "../adapters/homepage/magazineSpotlight.adapter";
import { SHOWCASE_FALLBACK, pickShowcaseCard, ShowcaseCard } from "../adapters/homepage/showcaseInterrupt.adapter";
import { MOTION_KEYFRAMES_CSS } from "../engines/homepage/motionPreset.registry";

const T = { bg:"#120824",card:"#1E0D3E",raised:"#2A1452",gold:"#FFB800",teal:"#00B8A9",pink:"#FF2D78",purple:"#7B2FBE",cyan:"#00E5FF",amber:"#FF8C00",text:"#fff",text2:"#C8A8E8",text3:"#7A5F9A",teal2:"#00C896",display:"'Bebas Neue',Impact,sans-serif",heading:"'Oswald',sans-serif" };

// ── GENRE CLUSTER SCENE ────────────────────────────────────────
function GenreClusterScene({ genreFeed, rotationIndex }: { genreFeed: GenreRankingFeed[]; rotationIndex: number }) {
  const genreSet = GENRE_ROTATION_SETS[rotationIndex % GENRE_ROTATION_SETS.length];
  const activeGenres = genreFeed.filter(f => genreSet.includes(f.genre as any)).slice(0, genreSet.length);

  return (
    <div style={{ display:"grid", gridTemplateColumns:`repeat(${activeGenres.length}, 1fr)`, gap:10, padding:"10px 0", animation:"scene-in 0.5s ease-out" }}>
      {activeGenres.map((feed, gi) => {
        const top1 = feed.top10[0];
        return (
          <div key={feed.genre} style={{
            background:`linear-gradient(135deg,${feed.color}22,${T.card})`,
            border:`2px solid ${feed.color}`,
            borderRadius:12, padding:14, textAlign:"center",
            boxShadow:`0 0 20px ${feed.color}33`,
            animation:`card-float ${3 + gi * 0.5}s ease-in-out infinite`,
          }}>
            <div style={{ fontFamily:T.heading, fontSize:9, color:feed.color, letterSpacing:2, marginBottom:8 }}>🎵 {feed.genre.toUpperCase()}</div>
            <div style={{ fontFamily:T.display, fontSize:11, color:T.text3, marginBottom:4 }}>TOP ARTIST</div>
            <div style={{ width:56, height:56, borderRadius:"50%", background:`linear-gradient(135deg,${feed.color}44,${T.raised})`, border:`2px solid ${feed.color}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, margin:"0 auto 8px" }}>🎤</div>
            <div style={{ fontFamily:T.heading, fontSize:11, color:T.text, marginBottom:2 }}>{top1?.stageName}</div>
            <div style={{ fontFamily:T.display, fontSize:22, color:feed.color }}>#1</div>
            {top1?.weeklyChange !== 0 && (
              <div style={{ fontFamily:T.heading, fontSize:9, color: top1.weeklyChange > 0 ? T.teal2 : T.pink, marginTop:3, animation:"rank-bounce 0.5s spring" }}>
                {top1.weeklyChange > 0 ? `↑${top1.weeklyChange}` : `↓${Math.abs(top1.weeklyChange)}`}
              </div>
            )}
            <Link href={`/artists/${top1?.slug}`} style={{ display:"block", marginTop:8, padding:"4px 10px", background:`${feed.color}22`, border:`1px solid ${feed.color}`, borderRadius:4, fontFamily:T.heading, fontSize:8, color:feed.color, textDecoration:"none", letterSpacing:1 }}>VIEW ARTIST</Link>
          </div>
        );
      })}
    </div>
  );
}

// ── CROWN TOP-10 SCENE ─────────────────────────────────────────
function CrownTop10Scene({ crown, feed }: { crown: CrownState; feed: GenreRankingFeed | null }) {
  return (
    <div>
      {/* Crown holder hero */}
      <div style={{ background:`linear-gradient(135deg,${T.gold}22,${T.card})`, border:`2px solid ${T.gold}`, borderRadius:12, padding:16, textAlign:"center", marginBottom:10, animation:`crown-pop 3s spring` }}>
        <div style={{ fontFamily:T.heading, fontSize:8, color:T.gold, letterSpacing:2, marginBottom:4 }}>👑 WEEKLY CROWN HOLDER</div>
        <div style={{ width:72, height:72, borderRadius:"50%", background:`linear-gradient(135deg,${T.gold}44,${T.raised})`, border:`3px solid ${T.gold}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, margin:"0 auto 8px", boxShadow:`0 0 24px ${T.gold}66`, animation:"glow-pulse 2s ease-in-out infinite" }}>🎤</div>
        <div style={{ fontFamily:T.display, fontSize:22, color:T.gold, letterSpacing:2 }}>{crown.holderName}</div>
        <div style={{ fontFamily:T.heading, fontSize:10, color:T.text2 }}>{crown.holderGenre} · {crown.holderCity}</div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginTop:6 }}>
          {crown.isVotingLive && <div style={{ background:T.pink, borderRadius:99, padding:"2px 8px", fontFamily:T.heading, fontSize:7, letterSpacing:1, display:"flex", alignItems:"center", gap:3 }}>
            <span style={{ width:5,height:5,borderRadius:"50%",background:"#fff",display:"inline-block",animation:"live-pulse 1s infinite" }} />VOTING LIVE
          </div>}
          <div style={{ fontFamily:T.display, fontSize:18, color:T.gold }}>{crown.voteCount.toLocaleString()} votes</div>
        </div>
      </div>
      {/* Positions 2-10 mini grid */}
      {feed && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:5 }}>
          {feed.top10.slice(1, 10).map((artist, i) => (
            <div key={artist.rank} style={{ background:T.raised, border:`1px solid ${T.text3}22`, borderRadius:8, padding:8, textAlign:"center" }}>
              <div style={{ fontFamily:T.display, fontSize:18, color:T.gold, lineHeight:1 }}>{artist.rank}</div>
              <div style={{ width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${T.purple}44,${T.raised})`,border:`1px solid ${T.text3}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,margin:"3px auto" }}>🎤</div>
              <div style={{ fontFamily:T.heading, fontSize:8, color:T.text2, lineHeight:1.2 }}>{artist.stageName}</div>
              {artist.weeklyChange !== 0 && <div style={{ fontFamily:T.heading, fontSize:7, color:artist.weeklyChange > 0 ? T.teal2 : T.pink }}>
                {artist.weeklyChange > 0 ? `↑${artist.weeklyChange}` : `↓${Math.abs(artist.weeklyChange)}`}
              </div>}
              {artist.isNew && <div style={{ background:T.teal, borderRadius:99, padding:"1px 5px", fontFamily:T.heading, fontSize:6, color:"#0D0520", display:"inline-block" }}>NEW</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── MAGAZINE INSERT SCENE ──────────────────────────────────────
function MagazineInsertScene({ mag }: { mag: MagazineSpotlight }) {
  const [pageIndex, setPageIndex] = useState(0);
  const page = mag.pages[pageIndex % mag.pages.length];
  useEffect(() => {
    const TIMINGS = [15000, 22000, 20000, 10000, 18000, 18000];
    const t = setTimeout(() => setPageIndex(i => i + 1), TIMINGS[pageIndex % TIMINGS.length]);
    return () => clearTimeout(t);
  }, [pageIndex]);

  return (
    <div style={{ animation:"magazine-expand 0.7s ease-out" }}>
      {/* Magazine masthead */}
      <div style={{ textAlign:"center", marginBottom:10 }}>
        <div style={{ background:`linear-gradient(135deg,${T.purple},${T.raised})`, border:`2px solid ${T.gold}`, borderRadius:12, padding:"12px 20px", boxShadow:`0 0 20px ${T.gold}44` }}>
          <div style={{ fontFamily:T.display, fontSize:32, color:T.gold, letterSpacing:4, textShadow:`0 0 16px ${T.gold}88` }}>THE MUSICIAN'S INDEX</div>
          <div style={{ fontFamily:T.heading, fontSize:10, color:T.teal, letterSpacing:2 }}>Issue {mag.issueNumber} · {mag.issueTitle}</div>
        </div>
      </div>

      {/* Current page */}
      <div style={{ background:T.card, border:`2px solid ${T.gold}44`, borderRadius:12, padding:16, textAlign:"center", animation:"magazine-page-turn 0.8s ease-in-out", minHeight:120 }}>
        <div style={{ fontFamily:T.heading, fontSize:8, color:T.gold, letterSpacing:2, marginBottom:6, textTransform:"uppercase" }}>{page.type.replace(/_/g," ")}</div>
        <div style={{ fontFamily:T.display, fontSize:22, color:T.text, marginBottom:4, lineHeight:1 }}>{page.title}</div>
        {page.subtitle && <div style={{ fontFamily:T.heading, fontSize:10, color:T.text2, marginBottom:10 }}>{page.subtitle}</div>}
        {page.cta && (
          <Link href={page.slug ? `/magazine/article/${page.slug}` : "/magazine"} style={{ padding:"6px 16px", background:T.gold, color:"#0D0520", borderRadius:6, fontFamily:T.heading, fontSize:9, textDecoration:"none", letterSpacing:1, display:"inline-block" }}>
            {page.cta} →
          </Link>
        )}
      </div>

      {/* Page indicator dots */}
      <div style={{ display:"flex", justifyContent:"center", gap:5, marginTop:8 }}>
        {mag.pages.map((_,i) => (
          <div key={i} style={{ width:6, height:6, borderRadius:"50%", background:i===pageIndex%mag.pages.length?T.gold:T.text3 }} />
        ))}
      </div>
    </div>
  );
}

// ── SHOW/GAME INTERRUPT SCENE ────────────────────────────────────
function ShowGameInterruptScene({ card }: { card: ShowcaseCard }) {
  return (
    <div style={{ background:T.card, border:`2px solid ${T.pink}`, borderRadius:12, padding:16, textAlign:"center", boxShadow:`0 0 20px ${T.pink}33`, animation:"scene-in 0.5s ease-out" }}>
      <div style={{ background:T.pink, borderRadius:4, padding:"2px 10px", display:"inline-block", fontFamily:T.heading, fontSize:8, color:T.text, letterSpacing:1, marginBottom:10 }}>{card.badgeText}</div>
      <div style={{ fontFamily:T.display, fontSize:28, color:T.text, letterSpacing:2, marginBottom:4 }}>{card.title}</div>
      <div style={{ fontFamily:T.heading, fontSize:11, color:T.text2, marginBottom:10 }}>{card.subtitle}</div>
      {card.prizeText && <div style={{ fontFamily:T.heading, fontSize:10, color:T.gold, marginBottom:10 }}>🏆 {card.prizeText}</div>}
      {card.viewerCount && <div style={{ fontFamily:T.heading, fontSize:9, color:T.text3, marginBottom:10 }}>{card.viewerCount} watching</div>}
      <Link href={card.ctaRoute} style={{ padding:"10px 24px", background:T.pink, color:T.text, borderRadius:8, fontFamily:T.display, fontSize:18, textDecoration:"none", letterSpacing:2, boxShadow:`0 0 16px ${T.pink}44` }}>{card.ctaLabel}</Link>
    </div>
  );
}

// ── CTA POPUP ──────────────────────────────────────────────────
function CTAPopup({ message }: { message: string }) {
  return (
    <div style={{ background:`linear-gradient(90deg,${T.purple},${T.pink})`, borderRadius:8, padding:"10px 16px", textAlign:"center", marginTop:8, animation:"cta-popup-in 0.4s spring" }}>
      <div style={{ fontFamily:T.heading, fontSize:11, color:T.text, letterSpacing:0.5 }}>{message}</div>
      <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:6 }}>
        <Link href="/login" style={{ padding:"4px 12px", background:"rgba(255,255,255,0.2)", borderRadius:4, fontFamily:T.heading, fontSize:9, color:T.text, textDecoration:"none" }}>LOG IN</Link>
        <Link href="/register" style={{ padding:"4px 12px", background:T.gold, borderRadius:4, fontFamily:T.heading, fontSize:9, color:"#0D0520", textDecoration:"none" }}>SIGN UP FREE</Link>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ─────────────────────────────────────────────
export default function HomePage1Scheduler() {
  const [scene, setScene] = useState<SchedulerState | null>(null);
  const [crown, setCrown] = useState<CrownState>(CROWN_FALLBACK);
  const [genreFeed] = useState<GenreRankingFeed[]>(GENRE_RANKING_FALLBACK);
  const [magazine] = useState<MagazineSpotlight>(MAGAZINE_SPOTLIGHT_FALLBACK);
  const [showcaseCard] = useState<ShowcaseCard>(pickShowcaseCard(SHOWCASE_FALLBACK));
  const [genreRotationIndex, setGenreRotationIndex] = useState(0);
  const schedulerRef = useRef<HomepageScheduler | null>(null);

  useEffect(() => {
    // Inject CSS keyframes
    const style = document.createElement("style");
    style.textContent = MOTION_KEYFRAMES_CSS;
    document.head.appendChild(style);

    // Start scheduler
    const scheduler = new HomepageScheduler((newState) => {
      setScene({ ...newState });
      // Rotate genre set each time genre_cluster appears
      if (newState.currentScene === "genre_cluster") {
        setGenreRotationIndex(i => i + 1);
      }
    });
    schedulerRef.current = scheduler;
    scheduler.start();

    // Start crown polling
    const stopCrownPolling = startCrownPolling(setCrown, 5000);

    return () => {
      scheduler.stop();
      stopCrownPolling();
      document.head.removeChild(style);
    };
  }, []);

  const currentScene = scene?.currentScene ?? "genre_cluster";

  return (
    <div style={{ background:`linear-gradient(160deg,${T.bg},#1A0835,${T.bg})`, minHeight:"100vh", color:T.text, fontFamily:"Inter,sans-serif" }}>
      {/* Top bar */}
      <div style={{ height:3, background:`linear-gradient(90deg,${T.gold},${T.teal},${T.pink},${T.gold})` }} />

      <div style={{ maxWidth:480, margin:"0 auto", padding:"0 16px" }}>

        {/* Masthead */}
        <div style={{ textAlign:"center", padding:"14px 0 8px" }}>
          <div style={{ background:`linear-gradient(135deg,${T.purple},${T.raised})`, borderRadius:14, padding:"12px 20px", border:`2px solid ${T.gold}`, boxShadow:`0 0 20px ${T.gold}44` }}>
            <div style={{ fontFamily:T.display, fontSize:38, color:T.gold, letterSpacing:3, lineHeight:0.9, textShadow:`0 0 16px ${T.gold}88` }}>THE</div>
            <div style={{ fontFamily:T.display, fontSize:34, color:T.text, letterSpacing:2, lineHeight:1 }}>MUSICIAN'S</div>
            <div style={{ fontFamily:T.display, fontSize:44, color:T.teal, letterSpacing:4, lineHeight:0.9, textShadow:`0 0 16px ${T.teal}88` }}>INDEX</div>
            {crown.isVotingLive && <div style={{ fontFamily:T.heading, fontSize:8, color:T.pink, letterSpacing:1, marginTop:6, display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
              <span style={{ width:5,height:5,borderRadius:"50%",background:T.pink,display:"inline-block",animation:"live-pulse 1s infinite" }} />
              VOTING LIVE! | CROWN UPDATING IN real-time...
            </div>}
          </div>
        </div>

        {/* Scene area — controlled by scheduler */}
        <div style={{ minHeight:280, transition:"opacity 0.5s ease", padding:"8px 0" }}>
          {currentScene === "genre_cluster" && <GenreClusterScene genreFeed={genreFeed} rotationIndex={genreRotationIndex} />}
          {currentScene === "crown_top10" && <CrownTop10Scene crown={crown} feed={genreFeed[0] ?? null} />}
          {currentScene === "magazine_insert" && <MagazineInsertScene mag={magazine} />}
          {currentScene === "show_game_interrupt" && <ShowGameInterruptScene card={showcaseCard} />}
          {(currentScene === "bridge_transition") && (
            <div style={{ height:80, display:"flex", alignItems:"center", justifyContent:"center", animation:"glow-pulse 1s ease-in-out infinite" }}>
              <div style={{ fontFamily:T.display, fontSize:22, color:T.gold, letterSpacing:4, opacity:0.5 }}>· · ·</div>
            </div>
          )}
        </div>

        {/* Active CTA from scheduler */}
        {scene?.activeCTA && <CTAPopup message={scene.activeCTA} />}

        {/* Live ticker */}
        <div style={{ background:T.card, border:`1px solid ${T.teal}33`, borderRadius:8, padding:"6px 12px", display:"flex", gap:8, overflow:"hidden", margin:"8px 0" }}>
          <div style={{ background:T.pink, borderRadius:99, padding:"1px 6px", fontFamily:T.heading, fontSize:7, letterSpacing:1, flexShrink:0, display:"flex", alignItems:"center", gap:3 }}>
            <span style={{ width:4,height:4,borderRadius:"50%",background:"#fff",display:"inline-block",animation:"live-pulse 1s infinite" }} />LIVE
          </div>
          <div style={{ fontFamily:T.heading, fontSize:9, color:T.teal, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            {crown.holderName} is live · {crown.voteCount.toLocaleString()} votes this week · Cypher Arena active · {genreFeed.length} genre battles running
          </div>
        </div>

        {/* World Switcher — 5 worlds */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:4, marginBottom:20 }}>
          {[["1","Mag","#",T.gold],["2","Edit","/editorial",T.text3],["3","Live","/lobby",T.text3],["4","Ads","/advertise",T.text3],["5","Spons","/world",T.text3]].map(([n,l,h,c])=>(
            <Link href={h as string} key={n} style={{ textDecoration:"none" }}>
              <div style={{ background:n==="1"?`${T.gold}22`:T.raised, border:`2px solid ${n==="1"?T.gold:T.text3}22`, borderRadius:8, padding:"5px 2px", textAlign:"center" }}>
                <div style={{ fontFamily:T.display, fontSize:16, color:c as string }}>{n}</div>
                <div style={{ fontFamily:T.heading, fontSize:6, color:c as string }}>{l}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Satellite footer */}
        <div style={{ fontFamily:T.heading, fontSize:7, color:T.text3, textAlign:"center", letterSpacing:1, paddingBottom:80 }}>
          THE MUSICIAN'S INDEX · CHICO_BASE: 39.7285°N 121.8375°W · SIGNAL: 100% · SECURE
        </div>
      </div>
    </div>
  );
}
