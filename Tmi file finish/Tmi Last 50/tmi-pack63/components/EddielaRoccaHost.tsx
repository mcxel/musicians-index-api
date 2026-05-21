// apps/web/src/components/characters/EddielaRoccaHost.tsx
// Eddie LaRocca — Middle Eastern, East LA energy, co-host
"use client";
const T = { card:"#1E0D3E",raised:"#2A1452",gold:"#FFB800",teal:"#00B8A9",pink:"#FF2D78",purple:"#7B2FBE",cyan:"#00E5FF",amber:"#FF8C00",text:"#fff",text2:"#C8A8E8",text3:"#7A5F9A",display:"'Bebas Neue',Impact,sans-serif",heading:"'Oswald',sans-serif" };

export type EddieMode = "hype" | "comedy" | "battle" | "winner_reveal" | "sponsor_read" | "idle";

interface Props {
  mode: EddieMode;
  line?: string;
  isActive?: boolean;
  position?: "left" | "center" | "right";
}

export function EddielaRoccaHost({ mode, line, isActive = true, position = "right" }: Props) {
  const accentColor = T.pink;

  return (
    <div style={{
      display:"flex", flexDirection:"column", alignItems:"center",
      position:"relative", opacity: isActive ? 1 : 0.4, transition:"opacity 0.4s",
    }}>
      {isActive && <div style={{ position:"absolute", top:-8, background:accentColor, borderRadius:99, padding:"2px 8px", fontFamily:T.heading, fontSize:7, color:T.text, letterSpacing:1, whiteSpace:"nowrap" }}>EDDIE LAROCCA</div>}

      <div style={{ position:"relative", marginTop:12 }}>
        {/* Head — slightly smaller, sharper features */}
        <div style={{
          width:76, height:76,
          background:`linear-gradient(135deg,#7D5A3C,#A0714F)`,  // medium-dark Middle Eastern
          borderRadius:"50%",
          border:`3px solid ${accentColor}`,
          boxShadow:`0 0 20px ${accentColor}55`,
          display:"flex", alignItems:"center", justifyContent:"center",
          animation:"card-float 2.6s ease-in-out infinite",
          overflow:"hidden", position:"relative",
        }}>
          {/* No glasses — sharper eyes */}
          {/* Big smile */}
          <div style={{ position:"absolute", bottom:"22%", left:"20%", width:"60%", height:8, borderRadius:"0 0 12px 12px", border:"2px solid rgba(255,200,150,0.9)", borderTop:"none" }} />
          <div style={{ fontSize:28, marginTop:6 }}>😁</div>
        </div>

        {/* Body — brighter suit */}
        <div style={{
          width:50, height:66,
          background:`linear-gradient(135deg,${T.teal},${T.purple})`,
          borderRadius:"8px 8px 12px 12px",
          border:`2px solid ${accentColor}44`,
          margin:"0 auto", position:"relative", overflow:"hidden",
        }}>
          {/* Gold chain */}
          <div style={{ position:"absolute", top:8, left:"20%", width:"60%", height:3, background:T.gold, borderRadius:99 }} />
          {/* Neon lapel */}
          <div style={{ position:"absolute", top:4, left:4, width:6, height:6, background:accentColor, borderRadius:"50%", boxShadow:`0 0 6px ${accentColor}` }} />
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${accentColor},${T.gold})` }} />
          {/* Hand raised */}
          <div style={{ position:"absolute", bottom:8, right:4, fontSize:16 }}>👋</div>
        </div>
      </div>

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

      <div style={{ marginTop:4, background:`${accentColor}22`, border:`1px solid ${accentColor}33`, borderRadius:99, padding:"1px 6px", fontFamily:T.heading, fontSize:7, color:accentColor, letterSpacing:1 }}>
        {mode.replace(/_/g," ").toUpperCase()}
      </div>
    </div>
  );
}
