"use client";
import Link from "next/link";

const T = {
  void:"#0D0520",deep:"#150830",card:"#1E0D3E",raised:"#2A1452",
  cyan:"#00E5FF",gold:"#FFB800",pink:"#FF2D78",purple:"#7B2FBE",
  teal:"#00C896",amber:"#FF8C00",text:"#fff",text2:"#C8A8E8",text3:"#7A5F9A",
  display:"'Bebas Neue',Impact,sans-serif",heading:"'Oswald',sans-serif",
};

const GAMES = [
  { id:"dirty-dozens",   label:"DIRTY DOZENS",       emoji:"🔥", color:T.pink,   href:"/dirty-dozens",  desc:"The ultimate roast battle. 3 rounds. Crowd decides.", badge:"AUDIENCE VOTE" },
  { id:"deal-or-feud",   label:"DEAL OR FEUD 1000",  emoji:"🎲", color:T.gold,   href:"/deal-or-feud",  desc:"Survey says! Music fan edition. Race to 1,000 points.", badge:"GAME SHOW" },
  { id:"name-that-tune", label:"NAME THAT TUNE",      emoji:"🎵", color:T.cyan,   href:"/games/name-that-tune", desc:"First to name the song wins the round.", badge:"TRIVIA" },
  { id:"lyric-cipher",   label:"LYRIC CIPHER",        emoji:"🎤", color:T.teal,   href:"/games/lyric-cipher", desc:"Fill in the blank. How well do you know the lyrics?", badge:"TRIVIA" },
  { id:"beat-challenge", label:"BEAT CHALLENGE",      emoji:"🎹", color:T.purple, href:"/games/beat-challenge", desc:"Drop a beat. Audience judges. Producers on the line.", badge:"HYBRID" },
  { id:"trivia",         label:"TRIVIA 1000",         emoji:"📚", color:T.amber,  href:"/games/trivia", desc:"Race to 1,000 points. Music history & industry.", badge:"SOLO/GROUP" },
  { id:"cypher-1v1",     label:"1v1 CYPHER BATTLE",   emoji:"⚔️", color:T.gold,   href:"/cypher", desc:"One-on-one freestyle rap battle. Judges + crowd decide.", badge:"FEATURED" },
  { id:"cypher-open",    label:"OPEN CYPHER",         emoji:"🎙️", color:T.pink,   href:"/cypher/open", desc:"Take a verse, pass the mic. The crowd keeps it alive.", badge:"LIVE NOW" },
];

export default function GamesHub() {
  return (
    <div style={{background:T.void,minHeight:"100vh",color:T.text,fontFamily:"'Inter',sans-serif"}}>

      {/* ── HEADER ── */}
      <div style={{background:`linear-gradient(to bottom,${T.raised},${T.void})`,padding:"40px 32px 32px",borderBottom:`1px solid rgba(255,45,120,0.3)`}}>
        <div style={{maxWidth:960,margin:"0 auto"}}>
          <div style={{fontFamily:T.heading,fontSize:10,color:T.text3,letterSpacing:3,marginBottom:4}}>HOME 3 → GAMES</div>
          <h1 style={{fontFamily:T.display,fontSize:56,color:T.gold,letterSpacing:3,margin:"0 0 8px"}}>GAME WORLD</h1>
          <p style={{color:T.text2,fontSize:14,marginBottom:20}}>Play. Battle. Win. Every game earns points. Every win earns rewards.</p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {[["🏆 LEADERBOARDS","/leaderboards"],["📊 MY SCORES","/scores"],["🎁 REWARDS","/rewards"],["👑 HALL OF FAME","/hall-of-fame"]].map(([l,h])=>(
              <Link key={l} href={h} style={{padding:"6px 14px",border:`1px solid rgba(0,229,255,0.3)`,color:T.cyan,fontFamily:T.heading,fontSize:11,letterSpacing:1,textDecoration:"none",borderRadius:99}}>{l}</Link>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:960,margin:"0 auto",padding:"32px"}}>

        {/* ── GAME GRID ── */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:16,marginBottom:32}}>
          {GAMES.map(g=>(
            <Link key={g.id} href={g.href} style={{textDecoration:"none"}}>
              <div style={{background:T.card,border:`1px solid ${g.color}44`,borderTop:`3px solid ${g.color}`,borderRadius:12,padding:20,cursor:"pointer",position:"relative",display:"flex",gap:16,alignItems:"flex-start"}}>
                {/* Badge */}
                <div style={{position:"absolute",top:12,right:12,background:`${g.color}22`,border:`1px solid ${g.color}44`,borderRadius:99,padding:"2px 8px",fontFamily:T.heading,fontSize:9,color:g.color,letterSpacing:1}}>{g.badge}</div>
                {/* Icon */}
                <div style={{fontSize:40,lineHeight:1}}>{g.emoji}</div>
                <div>
                  <div style={{fontFamily:T.display,fontSize:22,color:g.color,letterSpacing:2,marginBottom:4}}>{g.label}</div>
                  <div style={{fontSize:13,color:T.text2,lineHeight:1.5}}>{g.desc}</div>
                  <div style={{marginTop:12,fontFamily:T.heading,fontSize:11,color:g.color,letterSpacing:1}}>ENTER ROOM →</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── WAITING ROOM STRIP ── */}
        <div style={{background:T.card,border:`1px solid rgba(255,184,0,0.3)`,borderRadius:12,padding:20}}>
          <div style={{fontFamily:T.display,fontSize:20,color:T.gold,letterSpacing:2,marginBottom:12}}>🚪 WAITING ROOMS & LOBBIES</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
            {[["⏳ Waiting Room","/waiting-room",T.cyan],["🎯 Tournament Lobby","/games/tournament",T.gold],["🎮 Game Lobby","/lobby/games",T.pink],["🏟️ Arena Lobby","/contest",T.teal]].map(([l,h,c])=>(
              <Link key={l} href={h} style={{display:"block",background:T.raised,border:`1px solid ${c}44`,borderRadius:8,padding:12,textAlign:"center",fontFamily:T.heading,fontSize:11,color:c,letterSpacing:1,textDecoration:"none"}}>{l}</Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
