// apps/web/src/components/shows/BooMeter.tsx
// Live boo pressure meter for Marcel's Monday Night Stage.
// Levels: 0=normal, 1=mild warning, 2=danger, 3=elimination triggered.
"use client";
import { BOO_THRESHOLDS } from "@/engines/shows/marcelsMondayNight.engine";
const T = { card:"#1E0D3E",raised:"#2A1452",gold:"#FFB800",teal:"#00B8A9",pink:"#FF2D78",text:"#fff",text3:"#7A5F9A",heading:"'Oswald',sans-serif" };

interface Props {
  booPercent: number;       // 0-100
  cheerPercent: number;
  isWarningActive: boolean;
  recoverySecondsLeft?: number;
}

export function BooMeter({ booPercent, cheerPercent, isWarningActive, recoverySecondsLeft }: Props) {
  const level = booPercent >= BOO_THRESHOLDS.ELIMINATION_GATE ? 3
               : booPercent >= BOO_THRESHOLDS.DANGER_WARNING ? 2
               : booPercent >= BOO_THRESHOLDS.MILD_WARNING ? 1 : 0;

  const LEVEL_COLORS = ["#00C896","#FFB800","#FF8C00","#FF2D78"];
  const LEVEL_LABELS = ["","⚠️ MILD WARNING","🚨 DANGER!","💀 BEBO IS COMING"];
  const barColor = LEVEL_COLORS[level];

  return (
    <div style={{ background:T.card, border:`2px solid ${level>=2?T.pink:T.text3}`, borderRadius:12, padding:14 }}>
      {/* Crowd split */}
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
        <div style={{ fontFamily:T.heading, fontSize:10, color:T.teal }}>👏 {cheerPercent}% CHEER</div>
        <div style={{ fontFamily:T.heading, fontSize:10, color:T.pink }}>BOO {booPercent}% 👎</div>
      </div>

      {/* Boo meter bar */}
      <div style={{ width:"100%", height:16, background:T.raised, borderRadius:8, overflow:"hidden", position:"relative" }}>
        {/* Cheer side (left, green) */}
        <div style={{ position:"absolute", left:0, top:0, bottom:0, width:`${cheerPercent}%`, background:`linear-gradient(90deg,${T.teal},#00C896)`, transition:"width 0.5s ease" }} />
        {/* Boo side (right, red) */}
        <div style={{ position:"absolute", right:0, top:0, bottom:0, width:`${booPercent}%`, background:`linear-gradient(90deg,${barColor},${T.pink})`, transition:"width 0.5s ease" }} />
        {/* Threshold markers */}
        <div style={{ position:"absolute", left:`${BOO_THRESHOLDS.MILD_WARNING}%`, top:0, bottom:0, width:2, background:T.gold, opacity:0.5 }} />
        <div style={{ position:"absolute", left:`${BOO_THRESHOLDS.DANGER_WARNING}%`, top:0, bottom:0, width:2, background:T.pink, opacity:0.7 }} />
        <div style={{ position:"absolute", left:`${BOO_THRESHOLDS.ELIMINATION_GATE}%`, top:0, bottom:0, width:2, background:"#FF0000" }} />
      </div>

      {/* Level label */}
      {level > 0 && (
        <div style={{ textAlign:"center", marginTop:6, fontFamily:T.heading, fontSize:11, color:barColor, animation:level>=2 ? "glow-pulse 0.8s ease-in-out infinite" : "none" }}>
          {LEVEL_LABELS[level]}
        </div>
      )}

      {/* Recovery timer */}
      {isWarningActive && recoverySecondsLeft !== undefined && (
        <div style={{ textAlign:"center", marginTop:6, fontFamily:T.heading, fontSize:12, color:T.gold }}>
          RECOVERY WINDOW: {recoverySecondsLeft}s LEFT
        </div>
      )}
    </div>
  );
}
