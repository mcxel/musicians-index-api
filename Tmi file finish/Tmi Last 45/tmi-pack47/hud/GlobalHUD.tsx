// apps/web/src/components/hud/GlobalHUD.tsx
// The persistent HUD header + footer + satellite bar that wraps every page.
// Import into layout.tsx as the outermost wrapper.
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const T = { bg:"#0D0520",card:"#1E0D3E",raised:"#2A1452",gold:"#FFB800",teal:"#00B8A9",pink:"#FF2D78",purple:"#7B2FBE",cyan:"#00E5FF",text:"#fff",text2:"#C8A8E8",text3:"#7A5F9A",display:"'Bebas Neue',Impact,sans-serif",heading:"'Oswald',sans-serif" };

// Maps routes to active world number
function getActiveWorld(path: string): "1"|"2"|"3"|"4" {
  if (path === "/") return "1";
  if (path.startsWith("/editorial")) return "2";
  if (path.startsWith("/lobby") || path.startsWith("/live") || path.startsWith("/cypher") || path.startsWith("/games")) return "3";
  if (path.startsWith("/advertise") || path.startsWith("/sponsor") || path.startsWith("/advertiser")) return "4";
  return "1";
}

export function WorldSwitcherBar() {
  const path = usePathname();
  const active = getActiveWorld(path);
  const WORLDS: Array<["1"|"2"|"3"|"4", string, string]> = [
    ["1", "Magazine",  "/"],
    ["2", "Editorial", "/editorial"],
    ["3", "Live World","/lobby"],
    ["4", "Sponsors",  "/advertise"],
  ];
  return (
    <div style={{ display:"flex", gap:4, background:"#150830", borderTop:`1px solid ${T.gold}22`, padding:"8px 16px" }}>
      {WORLDS.map(([n, label, href]) => {
        const isActive = active === n;
        return (
          <Link href={href} key={n} style={{ flex:1, textDecoration:"none" }}>
            <div style={{
              textAlign:"center", padding:"6px 4px",
              background: isActive ? `${T.gold}22` : "transparent",
              border: `1px solid ${isActive ? T.gold : "transparent"}`,
              borderRadius:6, transition:"all 0.2s",
            }}>
              <div style={{ fontFamily:T.display, fontSize:20, color: isActive ? T.gold : T.text3, lineHeight:1 }}>{n}</div>
              <div style={{ fontFamily:T.heading, fontSize:7, color: isActive ? T.gold : T.text3, letterSpacing:1 }}>{label.toUpperCase()}</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function SatelliteFooter({ isLive = false }: { isLive?: boolean }) {
  return (
    <div style={{ background:"#0A0018", borderTop:`1px solid ${T.gold}22`, padding:"4px 16px", display:"flex", alignItems:"center", gap:8 }}>
      {isLive && (
        <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:T.pink, animation:"pulseRed 1s infinite" }} />
          <div style={{ fontFamily:T.heading, fontSize:8, color:T.pink, letterSpacing:1 }}>REC</div>
        </div>
      )}
      <div style={{ fontFamily:T.heading, fontSize:7, color:T.text3, letterSpacing:0.8, flex:1, textAlign:"center", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
        THE MUSICIAN'S INDEX · CHICO_BASE: 39.7285°N 121.8375°W · SIGNAL: 100% · SECURE
      </div>
    </div>
  );
}

export function GlobalHUD({ children, isLive = false }: { children: React.ReactNode; isLive?: boolean }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh" }}>
      <div style={{ flex:1 }}>{children}</div>
      <WorldSwitcherBar />
      <SatelliteFooter isLive={isLive} />
    </div>
  );
}
