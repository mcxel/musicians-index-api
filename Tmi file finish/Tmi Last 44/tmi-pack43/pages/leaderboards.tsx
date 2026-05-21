// apps/web/src/app/leaderboards/page.tsx
"use client";
import Link from "next/link";
import { useCrown } from "../../lib/realtime/websocket-hooks";

const T = { void:"#0D0520", deep:"#150830", card:"#1E0D3E", raised:"#2A1452", gold:"#FFB800", cyan:"#00E5FF", pink:"#FF2D78", text:"#fff", text2:"#C8A8E8", text3:"#7A5F9A", display:"'Bebas Neue',Impact,sans-serif", heading:"'Oswald',sans-serif" };

const FLAME_COLORS = { strong:"#FFD700", medium:"#FF8C00", light:"#FFB800" };

export default function LeaderboardsPage() {
  const { crownEvent } = useCrown();

  const boards = [
    { id:"weekly_crown",  label:"WEEKLY CROWN",       icon:"👑", accentColor: T.gold },
    { id:"season_points", label:"SEASON POINTS",      icon:"⚡", accentColor: T.cyan },
    { id:"game_wins",     label:"GAME WINS",           icon:"🏆", accentColor: T.pink },
    { id:"battle_wins",   label:"BATTLE WINS",         icon:"🎤", accentColor: "#FF4500" },
    { id:"top_fans",      label:"TOP FANS",            icon:"❤️", accentColor: T.cyan },
    { id:"top_earners",   label:"TOP EARNERS",         icon:"💰", accentColor: T.gold },
  ];

  return (
    <div style={{ background:T.void, minHeight:"100vh", color:T.text, fontFamily:"Inter,sans-serif" }}>
      {crownEvent && (
        <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.8)", pointerEvents:"none" }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:96 }}>👑</div>
            <div style={{ fontFamily:T.display, fontSize:48, color:T.gold }}>NEW CROWN CHAMPION!</div>
            <div style={{ fontFamily:T.heading, fontSize:18, color:T.text2 }}>{crownEvent.artistSlug}</div>
          </div>
        </div>
      )}
      <div style={{ background:T.deep, padding:"32px", borderBottom:`1px solid rgba(255,184,0,0.3)` }}>
        <div style={{ maxWidth:960, margin:"0 auto" }}>
          <div style={{ fontFamily:T.heading, fontSize:10, color:T.text3, letterSpacing:3, marginBottom:4 }}>THE MUSICIAN&apos;S INDEX</div>
          <h1 style={{ fontFamily:T.display, fontSize:52, color:T.gold, letterSpacing:3, margin:"0 0 8px" }}>LEADERBOARDS</h1>
          <p style={{ color:T.text2, fontSize:14 }}>Top 10 positions get the flame. Position 1 gets the crown.</p>
        </div>
      </div>
      <div style={{ maxWidth:960, margin:"0 auto", padding:"32px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:16 }}>
          {boards.map(board => (
            <Link key={board.id} href={`/leaderboards/${board.id}`} style={{ textDecoration:"none" }}>
              <div style={{ background:T.card, border:`1px solid ${board.accentColor}44`, borderRadius:12, padding:20, cursor:"pointer" }}>
                <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:12 }}>
                  <span style={{ fontSize:28 }}>{board.icon}</span>
                  <div style={{ fontFamily:T.display, fontSize:18, color:board.accentColor, letterSpacing:2 }}>{board.label}</div>
                </div>
                {[1,2,3,4,5].map(rank => (
                  <div key={rank} style={{ display:"flex", gap:8, alignItems:"center", padding:"6px 0", borderBottom:`1px solid rgba(255,255,255,0.05)` }}>
                    <span style={{ fontFamily:T.display, fontSize:18, color: rank===1 ? FLAME_COLORS.strong : rank<=3 ? FLAME_COLORS.medium : FLAME_COLORS.light, minWidth:24 }}>
                      {rank<=3 ? "🔥" : rank}
                    </span>
                    <div style={{ flex:1, background:T.raised, borderRadius:4, height:8, overflow:"hidden" }}>
                      <div style={{ width:`${100-rank*15}%`, height:"100%", background:`linear-gradient(to right, ${board.accentColor}, ${board.accentColor}88)` }} />
                    </div>
                  </div>
                ))}
                <div style={{ fontFamily:T.heading, fontSize:10, color:board.accentColor, letterSpacing:1, marginTop:8, textAlign:"center" }}>VIEW FULL BOARD →</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
