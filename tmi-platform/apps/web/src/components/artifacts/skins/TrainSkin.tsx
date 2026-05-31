"use client";

/** TrainSkin — Orange locomotive. Base 6: red/orange train, side-panel tracklist, spinning wheels. */

import type { ReactNode } from "react";

interface TrainSkinProps { monitor: ReactNode; isPlaying: boolean; isOpen: boolean; onToggle: () => void; accent?: string; }

export default function TrainSkin({ monitor, isPlaying, isOpen, onToggle, accent = "#FF4422" }: TrainSkinProps) {
  const RED    = "#cc2200";
  const ORANGE = "#ee5500";
  const GOLD   = "#cc7700";

  return (
    <div style={{ position: "relative", width: 240, userSelect: "none" }}>
      {/* Smokestack */}
      <div style={{ width: 20, height: 28, background: `linear-gradient(180deg,#555,#333)`, borderRadius: "4px 4px 0 0", margin: "0 0 0 32px", position: "relative" }}>
        {isPlaying && <div style={{ position: "absolute", top: -8, left: -4, width: 28, height: 12, background: "radial-gradient(ellipse,rgba(200,200,200,0.6),transparent)", borderRadius: "50%", animation: "smokePuff 1.2s ease-out infinite" }} />}
      </div>

      {/* Cabin */}
      <div style={{ display: "flex", gap: 0, alignItems: "flex-end" }}>
        {/* Cab */}
        <div style={{ width: 55, height: 70, background: `linear-gradient(180deg,${ORANGE},${RED})`, borderRadius: "6px 0 0 0", flexShrink: 0, position: "relative" }}>
          <div style={{ position: "absolute", top: 8, left: 8, width: 18, height: 12, background: "#1a1a2a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 3 }} />
        </div>

        {/* Body + Monitor */}
        <div style={{ flex: 1, height: 70, background: `linear-gradient(180deg,${ORANGE}cc,${RED})`, borderRadius: "0 6px 0 0", cursor: "pointer", position: "relative", overflow: "hidden" }} onClick={onToggle}>
          {/* Monitor window */}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", borderRadius: 4, overflow: "hidden", border: "2px solid rgba(0,0,0,0.4)" }}>{monitor}</div>
          {/* Chevron */}
          <div style={{ position: "absolute", bottom: 4, right: 8, fontSize: 9, color: "rgba(255,255,255,0.5)", transform: `rotate(${isOpen?180:0}deg)`, transition: "transform 0.3s" }}>▼</div>
        </div>
      </div>

      {/* Base / boiler */}
      <div style={{ height: 18, background: `linear-gradient(180deg,${RED},#991100)`, borderRadius: "0 0 4px 4px", margin: "0 0 0 0" }} />

      {/* Wheels row */}
      <div style={{ display: "flex", gap: 12, padding: "4px 8px", justifyContent: "flex-start" }}>
        {/* Big driver wheel */}
        <div style={{ width: 42, height: 42, borderRadius: "50%", background: `radial-gradient(circle at 35% 35%, ${GOLD}, ${RED})`, border: `3px solid ${GOLD}`, boxShadow: `0 0 8px ${accent}44`, animation: isPlaying ? "wheelSpin 1s linear infinite" : "none", position: "relative", flexShrink: 0 }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 8, height: 8, borderRadius: "50%", background: "#111" }} />
          {/* Spokes */}
          {[0,60,120,180].map(r => <div key={r} style={{ position: "absolute", top: "50%", left: "50%", width: "50%", height: 1, background: GOLD, transformOrigin: "0 50%", transform: `translate(0,-50%) rotate(${r}deg)` }} />)}
        </div>
        {/* Small wheels */}
        {[26,26].map((sz,i) => (
          <div key={i} style={{ width: sz, height: sz, borderRadius: "50%", background: `radial-gradient(circle, ${ORANGE}, ${RED})`, border: `2px solid ${GOLD}`, animation: isPlaying ? `wheelSpin ${0.7+i*0.1}s linear infinite` : "none", flexShrink: 0, position: "relative" }}>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 5, height: 5, borderRadius: "50%", background: "#111" }} />
          </div>
        ))}
      </div>

      {/* Rail */}
      <div style={{ height: 4, background: `linear-gradient(90deg,transparent,${GOLD},transparent)`, borderRadius: 2, margin: "2px 4px 0" }} />

      {/* Controls */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 10 }}>
        {[{icon:"⏮",id:"prev"},{icon:"▶",id:"play",big:true},{icon:"⏭",id:"next"},{icon:"❤",id:"like"},{icon:"+",id:"add"}].map(b=>(
          <button key={b.id} type="button" data-action={b.id} style={{ width:b.big?36:28,height:b.big?36:28,borderRadius:"50%",background:b.big?accent:"rgba(255,68,34,0.12)",border:b.big?"none":"2px solid rgba(255,68,34,0.3)",color:b.big?"#fff":accent,fontSize:b.big?14:11,fontWeight:900,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>{b.icon}</button>
        ))}
      </div>
      <style>{`@keyframes wheelSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} @keyframes smokePuff{0%{opacity:0.8;transform:scaleX(1)}100%{opacity:0;transform:scaleX(2) translateY(-20px)}}`}</style>
    </div>
  );
}
