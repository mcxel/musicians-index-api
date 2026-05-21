// apps/web/src/components/sponsor/SponsorIntroStack.tsx
// The 3-sponsor pop-in animation when an artist enters the stage.
// Appears for 2-4 seconds then fades clean. Never blocks artist face.
"use client";
import { useState, useEffect } from "react";
const T = { card:"#1E0D3E",raised:"#2A1452",gold:"#FFB800",text:"#fff",text3:"#7A5F9A",heading:"'Oswald',sans-serif" };

interface Sponsor { name:string; logoUrl?:string; tier:"primary"|"secondary"|"standard" }
interface Props {
  sponsors: Sponsor[];
  onComplete?: () => void;
  position?: "bottom" | "top_left";
}

export function SponsorIntroStack({ sponsors, onComplete, position = "bottom" }: Props) {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Appear 500ms after mount
    const t1 = setTimeout(() => setVisible(true), 500);
    // Start fade at 3s
    const t2 = setTimeout(() => setFading(true), 3000);
    // Fully hidden at 3.5s
    const t3 = setTimeout(() => { onComplete?.(); }, 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const TIER_SIZES = { primary:"11px", secondary:"9px", standard:"8px" };
  const TIER_OPACITY = { primary:1, secondary:0.85, standard:0.7 };

  return (
    <div style={{
      position:"absolute",
      ...(position === "bottom" ? { bottom:16, left:"50%", transform:"translateX(-50%)" } : { top:16, left:16 }),
      opacity: fading ? 0 : (visible ? 1 : 0),
      transition:"opacity 0.5s ease",
      display:"flex", flexDirection:"column", alignItems:"center", gap:4,
      pointerEvents:"none",
      zIndex:100,
    }}>
      <div style={{ fontFamily:T.heading, fontSize:8, color:T.gold, letterSpacing:1.5, marginBottom:2 }}>
        SPONSORED BY
      </div>
      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
        {sponsors.slice(0,3).map((sponsor, i) => (
          <div key={i} style={{
            background:`${T.card}EE`,
            border:`1px solid ${T.gold}${i===0?"88":"44"}`,
            borderRadius:6, padding:"4px 10px",
            fontFamily:T.heading,
            fontSize: TIER_SIZES[sponsor.tier],
            color:T.gold,
            opacity: TIER_OPACITY[sponsor.tier],
            letterSpacing:0.5,
            backdropFilter:"blur(4px)",
            animation: `cta-popup-in ${0.3 + i * 0.1}s spring`,
            boxShadow:`0 0 8px ${T.gold}33`,
          }}>
            {sponsor.name}
          </div>
        ))}
      </div>
    </div>
  );
}
