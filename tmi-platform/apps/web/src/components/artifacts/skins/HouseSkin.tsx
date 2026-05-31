"use client";

/** HouseSkin — Glowing house. Base 17/18: dark house, glowing amber windows = monitor, warm porch light. */

import type { ReactNode } from "react";

interface HouseSkinProps { monitor: ReactNode; isPlaying: boolean; isOpen: boolean; onToggle: () => void; accent?: string; }

export default function HouseSkin({ monitor, isPlaying, isOpen, onToggle, accent = "#FFB84A" }: HouseSkinProps) {
  const BRICK  = "#3a1a0a";
  const ROOF   = "#2a1a08";

  return (
    <div style={{ position: "relative", width: 200, userSelect: "none" }}>
      {/* Chimney */}
      <div style={{ width: 20, height: 30, background: BRICK, borderRadius: "3px 3px 0 0", position: "absolute", top: 0, right: "25%" }}>
        {isPlaying && <div style={{ position: "absolute", top: -8, left: -3, width: 26, height: 12, background: "radial-gradient(rgba(150,150,150,0.4),transparent)", borderRadius: "50%", animation: "smokePuff 2s ease-out infinite" }} />}
      </div>

      {/* Roof */}
      <div style={{ width: 0, height: 0, borderLeft: "100px solid transparent", borderRight: "100px solid transparent", borderBottom: `70px solid ${ROOF}`, margin: "30px auto 0", filter: "drop-shadow(0 -4px 8px rgba(0,0,0,0.5))" }} />

      {/* Walls */}
      <div style={{ position: "relative", width: "85%", margin: "0 auto", height: 120, background: `linear-gradient(180deg,${BRICK}dd,${BRICK})`, borderRadius: "0 0 6px 6px", cursor: "pointer", overflow: "hidden" }} onClick={onToggle}>
        {/* Monitor = main window */}
        <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", borderRadius: 4, overflow: "hidden", border: `3px solid ${accent}44`, boxShadow: `0 0 ${isPlaying?20:8}px ${accent}44`, transition: "box-shadow 0.5s" }}>{monitor}</div>

        {/* Side windows (small) */}
        {[-55, 55].map((offset, i) => (
          <div key={i} style={{ position: "absolute", top: 14, left: `calc(50% + ${offset}px - 10px)`, width: 20, height: 14, background: `rgba(255,180,60,${isPlaying?0.6:0.2})`, border: `1px solid ${accent}44`, borderRadius: 2, boxShadow: isPlaying ? `0 0 8px ${accent}` : "none", transition: "all 0.5s" }} />
        ))}

        {/* Door */}
        <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 28, height: 44, background: "#1a0a04", borderRadius: "5px 5px 0 0", border: `1px solid ${accent}22` }}>
          <div style={{ position: "absolute", top: "50%", right: 4, width: 5, height: 5, borderRadius: "50%", background: accent, boxShadow: `0 0 4px ${accent}` }} />
        </div>

        {/* Chevron */}
        <div style={{ position: "absolute", bottom: 6, right: 8, fontSize: 9, color: accent, transform: `rotate(${isOpen?180:0}deg)`, transition: "transform 0.3s" }}>▼</div>
      </div>

      {/* Ground */}
      <div style={{ height: 6, width: "95%", margin: "0 auto", background: `linear-gradient(90deg,transparent,#1a0a04,transparent)`, borderRadius: 3 }} />

      {/* Controls */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 10 }}>
        {[{icon:"⏮",id:"prev"},{icon:"▶",id:"play",big:true},{icon:"⏭",id:"next"},{icon:"❤",id:"like"},{icon:"+",id:"add"}].map(b=>(
          <button key={b.id} type="button" data-action={b.id} style={{ width:b.big?36:28,height:b.big?36:28,borderRadius:"50%",background:b.big?accent:"rgba(255,180,60,0.12)",border:b.big?"none":"2px solid rgba(255,180,60,0.3)",color:b.big?"#000":accent,fontSize:b.big?14:11,fontWeight:900,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:b.big?`0 0 12px ${accent}88`:"none" }}>{b.icon}</button>
        ))}
      </div>
      <style>{`@keyframes smokePuff{0%{opacity:0.7;transform:scale(1)}100%{opacity:0;transform:scale(2) translateY(-15px)}}`}</style>
    </div>
  );
}
