// apps/web/src/components/characters/DannyGreenHost.tsx
// Danny Green — Battle host component
// White/red hair version was Eddie LaRocca spec — Danny is from Host 1 image
// (Black man, glasses, navy suit, microphone, Deal or Feud 1000 energy)
"use client";
const T = { bg:"#0D0520",card:"#1E0D3E",raised:"#2A1452",gold:"#FFB800",teal:"#00B8A9",pink:"#FF2D78",purple:"#7B2FBE",cyan:"#00E5FF",amber:"#FF8C00",text:"#fff",text2:"#C8A8E8",text3:"#7A5F9A",navy:"#0A1F44",display:"'Bebas Neue',Impact,sans-serif",heading:"'Oswald',sans-serif" };

export type DannyMode = "intro" | "battle" | "results" | "winner_reveal" | "sponsor_read" | "idle";

interface Props {
  mode: DannyMode;
  line?: string;
  isActive?: boolean;
  position?: "left" | "center" | "right";
}

export function DannyGreenHost({ mode, line, isActive = true, position = "left" }: Props) {
  const MODE_COLORS: Record<DannyMode, string> = {
    intro:"#00E5FF", battle:T.pink, results:T.gold, winner_reveal:T.gold, sponsor_read:T.teal, idle:T.text3,
  };
  const accentColor = MODE_COLORS[mode];

  return (
    <div style={{
      display:"flex", flexDirection:"column", alignItems:"center",
      position:"relative", opacity: isActive ? 1 : 0.4, transition:"opacity 0.4s",
    }}>
      {/* Host indicator */}
      {isActive && <div style={{ position:"absolute", top:-8, background:accentColor, borderRadius:99, padding:"2px 8px", fontFamily:T.heading, fontSize:7, color:"#0D0520", letterSpacing:1, whiteSpace:"nowrap" }}>DANNY GREEN</div>}

      {/* Character body — bobblehead proportions */}
      <div style={{ position:"relative", marginTop:12 }}>
        {/* Big head (1.6× body) */}
        <div style={{
          width:80, height:80,
          background:`linear-gradient(135deg,#5C3017,#8B4513)`,  // dark brown skin tone
          borderRadius:"50%",
          border:`3px solid ${accentColor}`,
          boxShadow:`0 0 16px ${accentColor}44`,
          display:"flex", alignItems:"center", justifyContent:"center",
          position:"relative", animation:"card-float 3s ease-in-out infinite",
          fontSize:36,
          overflow:"hidden",
        }}>
          {/* Glasses */}
          <div style={{ position:"absolute", top:"35%", left:"10%", width:"80%", height:8, borderRadius:2, border:`2px solid #1a1a1a`, background:"rgba(0,0,0,0.3)" }} />
          {/* Smile */}
          <div style={{ position:"absolute", bottom:"25%", left:"30%", width:"40%", height:6, borderRadius:"0 0 10px 10px", border:"2px solid rgba(255,200,150,0.8)", borderTop:"none" }} />
          <div style={{ fontSize:28, marginTop:8 }}>😊</div>
        </div>

        {/* Body (smaller) */}
        <div style={{
          width:52, height:68,
          background:`linear-gradient(135deg,${T.navy},#0D1B3E)`,
          borderRadius:"8px 8px 12px 12px",
          border:`2px solid ${accentColor}44`,
          margin:"0 auto",
          position:"relative", overflow:"hidden",
        }}>
          {/* Red tie */}
          <div style={{ position:"absolute", top:4, left:"50%", transform:"translateX(-50%)", width:8, height:40, background:T.pink, borderRadius:"0 0 4px 4px", borderTop:`2px solid ${T.pink}` }} />
          {/* Microphone hand */}
          <div style={{ position:"absolute", bottom:8, right:6, fontSize:18 }}>🎤</div>
          {/* Neon accent trim */}
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${accentColor},transparent)` }} />
        </div>
      </div>

      {/* Dialogue bubble */}
      {line && (
        <div style={{
          marginTop:8, maxWidth:160,
          background:T.card, border:`1px solid ${accentColor}`,
          borderRadius:8, padding:"6px 10px",
          fontFamily:T.heading, fontSize:9, color:accentColor,
          textAlign:"center", lineHeight:1.4,
          animation:"cta-popup-in 0.4s spring",
        }}>
          "{line}"
        </div>
      )}

      {/* Mode badge */}
      <div style={{ marginTop:4, background:`${accentColor}22`, border:`1px solid ${accentColor}33`, borderRadius:99, padding:"1px 6px", fontFamily:T.heading, fontSize:7, color:accentColor, letterSpacing:1 }}>
        {mode.replace(/_/g," ").toUpperCase()}
      </div>
    </div>
  );
}
