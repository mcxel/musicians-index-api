"use client";
import Link from "next/link";

const T = { void:"#0D0520", deep:"#150830", card:"#1E0D3E", raised:"#2A1452", cyan:"#00E5FF", gold:"#FFB800", pink:"#FF2D78", purple:"#7B2FBE", teal:"#00C896", amber:"#FF8C00", text:"#fff", text2:"#C8A8E8", text3:"#7A5F9A", display:"'Bebas Neue',Impact,sans-serif", heading:"'Oswald',sans-serif" };

const GAMES = [
  { id:"dirty-dozens",   label:"Dirty Dozens",        emoji:"🎤", desc:"Classic dozens battle. Crowd judges. Most energy wins.", scene:"battle_red",    href:"/dirty-dozens" },
  { id:"deal-or-feud",   label:"Deal or Feud 1000",   emoji:"🎯", desc:"Survey says! First team to 1000 points wins the board.", scene:"rainbow_party", href:"/deal-or-feud" },
  { id:"name-that-tune", label:"Name That Tune",       emoji:"🎵", desc:"DJ plays a clip. First to buzz in and name the track wins.", scene:"neon_purple", href:"/games/name-that-tune" },
  { id:"lyric-fill",     label:"Lyric Fill",           emoji:"📝", desc:"Complete the missing lyrics. Fastest correct answer wins.", scene:"cypher_cyan", href:"/games/lyric-fill" },
  { id:"beat-challenge", label:"Beat Challenge",       emoji:"🥁", desc:"Producer battle. Drop your best beat. Audience votes.", scene:"battle_red",   href:"/games/beat-challenge" },
  { id:"music-trivia",   label:"Music Trivia",         emoji:"❓", desc:"Test your music knowledge across all genres and eras.", scene:"standard",     href:"/games/music-trivia" },
  { id:"speed-round",    label:"Speed Round",          emoji:"⚡", desc:"Rapid fire — 5 seconds per answer. Most correct wins.", scene:"strobe_hype",  href:"/games/speed-round" },
  { id:"spin-and-win",   label:"Spin & Win",           emoji:"🎰", desc:"Daily spin for points, items, and surprise rewards.", scene:"victory_gold",  href:"/games/spin-and-win" },
];

function GameCard({ game }: { game: typeof GAMES[0] }) {
  return (
    <Link href={game.href} style={{ textDecoration:"none" }}>
      <div style={{ background:T.card, border:`1px solid rgba(0,229,255,0.25)`, borderRadius:12, overflow:"hidden", cursor:"pointer" }}>
        <div style={{ background:`linear-gradient(135deg, ${T.raised}, ${T.void})`, padding:"28px 20px", textAlign:"center" }}>
          <div style={{ fontSize:52, marginBottom:8 }}>{game.emoji}</div>
          <div style={{ fontFamily:T.display, fontSize:22, color:T.gold, letterSpacing:2 }}>{game.label}</div>
        </div>
        <div style={{ padding:"12px 16px" }}>
          <div style={{ fontSize:12, color:T.text2, lineHeight:1.6, marginBottom:12 }}>{game.desc}</div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontFamily:T.heading, fontSize:10, color:T.cyan, border:`1px solid ${T.cyan}44`, padding:"3px 10px", borderRadius:99, letterSpacing:1 }}>JOIN ROOM</span>
            <span style={{ fontFamily:T.heading, fontSize:10, color:T.teal, letterSpacing:1 }}>+20 PTS</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function GamesHub() {
  return (
    <div style={{ background:T.void, minHeight:"100vh", color:T.text, fontFamily:"Inter,sans-serif" }}>
      <div style={{ background:T.deep, borderBottom:`1px solid rgba(255,184,0,0.3)`, padding:"32px 32px 24px" }}>
        <div style={{ maxWidth:960, margin:"0 auto" }}>
          <div style={{ fontFamily:T.heading, fontSize:10, color:T.text3, letterSpacing:3, marginBottom:4 }}>THE MUSICIAN&apos;S INDEX</div>
          <h1 style={{ fontFamily:T.display, fontSize:52, color:T.gold, letterSpacing:3, margin:"0 0 8px" }}>GAME WORLD</h1>
          <p style={{ color:T.text2, fontSize:14 }}>Battles, trivia, shows, and more. Earn points. Win rewards. Claim the crown.</p>
          <div style={{ display:"flex", gap:10, marginTop:16, flexWrap:"wrap" }}>
            <Link href="/cypher" style={{ padding:"7px 16px", background:T.pink, color:"#fff", borderRadius:99, fontFamily:T.heading, fontSize:11, fontWeight:700, letterSpacing:1, textDecoration:"none" }}>⚡ CYPHER ARENA</Link>
            <Link href="/leaderboards" style={{ padding:"7px 16px", border:`1px solid rgba(0,229,255,0.4)`, color:T.cyan, borderRadius:99, fontFamily:T.heading, fontSize:11, letterSpacing:1, textDecoration:"none" }}>🏆 LEADERBOARDS</Link>
            <Link href="/hall-of-fame" style={{ padding:"7px 16px", border:`1px solid rgba(255,184,0,0.4)`, color:T.gold, borderRadius:99, fontFamily:T.heading, fontSize:11, letterSpacing:1, textDecoration:"none" }}>👑 HALL OF FAME</Link>
          </div>
        </div>
      </div>
      <div style={{ maxWidth:960, margin:"0 auto", padding:"32px 32px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:16 }}>
          {GAMES.map(g => <GameCard key={g.id} game={g} />)}
        </div>
      </div>
    </div>
  );
}
