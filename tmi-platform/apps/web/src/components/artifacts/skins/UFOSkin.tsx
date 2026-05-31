"use client";

/** UFOSkin — Flying saucer. Base 13: orange saucer, dark display, star field, landing lights. */

import type { ReactNode } from "react";

interface UFOSkinProps { monitor: ReactNode; isPlaying: boolean; isOpen: boolean; onToggle: () => void; accent?: string; }

export default function UFOSkin({ monitor, isPlaying, isOpen, onToggle, accent = "#AA2DFF" }: UFOSkinProps) {
  const SAUCER = "#cc4400";
  const DOME   = "#1a0a40";

  return (
    <div style={{ position: "relative", width: 220, userSelect: "none" }}>
      {/* Dome */}
      <div style={{ width: "55%", height: 55, margin: "0 auto", background: `radial-gradient(ellipse at 40% 30%, #2a1060, ${DOME})`, borderRadius: "50% 50% 0 0", border: `2px solid ${accent}44`, boxShadow: `0 0 ${isPlaying ? 20 : 8}px ${accent}44`, transition: "box-shadow 0.5s" }} />

      {/* Saucer rim */}
      <div style={{ position: "relative", width: "100%", height: 55, background: `linear-gradient(180deg, ${SAUCER} 0%, #aa3300 50%, #882200 100%)`, borderRadius: "50% 50% 45% 45%", cursor: "pointer", boxShadow: "0 8px 20px rgba(0,0,0,0.6)" }} onClick={onToggle}>
        {/* Landing lights row */}
        <div style={{ position: "absolute", top: "50%", left: 0, right: 0, display: "flex", justifyContent: "space-around", padding: "0 10px" }}>
          {[0,1,2,3,4,5].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: isPlaying ? (i%2===0?"#FFD700":"#FF4400") : "#331100", boxShadow: isPlaying ? `0 0 6px ${i%2===0?"#FFD700":"#FF4400"}` : "none", animation: isPlaying ? `lightBlink ${0.6+i*0.1}s ease-in-out infinite` : "none" }} />)}
        </div>

        {/* Monitor (centered in saucer) */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", borderRadius: 6, overflow: "hidden", border: `2px solid #331100` }}>{monitor}</div>

        {/* Chevron */}
        <div style={{ position: "absolute", bottom: 4, left: "50%", transform: `translateX(-50%) rotate(${isOpen?180:0}deg)`, fontSize: 9, color: "rgba(255,255,255,0.4)", transition: "transform 0.3s" }}>▼</div>
      </div>

      {/* Legs */}
      {[-40, 0, 40].map((offset, i) => (
        <div key={i} style={{ position: "absolute", bottom: 0, left: `calc(50% + ${offset}px - 3px)`, width: 6, height: 20, background: "#882200", borderRadius: 3, transformOrigin: "top center", transform: `rotate(${offset/3}deg)` }} />
      ))}

      {/* Controls */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 28 }}>
        {[{ icon:"⏮",id:"prev"},{icon:isPlaying?"⏸":"▶",id:"play",big:true},{icon:"⏭",id:"next"},{icon:"❤",id:"like"},{icon:"+",id:"add"}].map(b=>(
          <button key={b.id} type="button" data-action={b.id} style={{ width:b.big?36:28,height:b.big?36:28,borderRadius:"50%",background:b.big?accent:"rgba(170,45,255,0.12)",border:b.big?"none":"2px solid rgba(170,45,255,0.3)",color:b.big?"#fff":accent,fontSize:b.big?14:11,fontWeight:900,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:b.big?`0 0 14px ${accent}88`:"none" }}>{b.icon}</button>
        ))}
      </div>
      <style>{`@keyframes lightBlink { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );
}
