"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

const TITLE_COLORS = ["#ffffff", "#FFD700", "#00FF88", "#FF2020", "#FF2DAA", "#00FFFF"];

export default function Home1CoverPage() {
  const [colorIdx, setColorIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setColorIdx(i => (i + 1) % TITLE_COLORS.length), 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <section style={{
      position: "relative", width: "100%",
      padding: "16px 16px 14px",
      textAlign: "center",
      background: "linear-gradient(180deg, rgba(255,45,170,0.18) 0%, rgba(5,8,21,1) 100%)",
    }}>

      {/* Status badges */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(255,45,170,0.2)", border: "1px solid rgba(255,45,170,0.6)",
          borderRadius: 4, padding: "4px 12px",
        }}>
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#FF2020" }}
          />
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: "#FF2DAA" }}>VOTING LIVE</span>
        </div>
        <div style={{
          background: "rgba(255,215,0,0.15)", border: "1px solid rgba(255,215,0,0.5)",
          borderRadius: 4, padding: "4px 14px",
          fontFamily: "'Orbitron', monospace", fontSize: 11, fontWeight: 700, color: "#FFD700",
        }}>
          4,948 VOTES
        </div>
        <div style={{
          background: "rgba(230,48,0,0.2)", border: "1px solid rgba(230,48,0,0.5)",
          borderRadius: 4, padding: "4px 12px",
          fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: "#E63000",
        }}>
          CROWN UPDATING
        </div>
      </div>

      {/* Big title — color cycles every 2s */}
      <h1 style={{
        fontFamily: "'Anton', 'Impact', sans-serif",
        fontSize: "clamp(36px, 8vw, 64px)",
        lineHeight: 1,
        letterSpacing: "0.02em",
        marginBottom: 8,
        color: TITLE_COLORS[colorIdx],
        transition: "color 0.5s ease",
      }}>
        THE<br />MUSICIAN&apos;S<br />INDEX
      </h1>
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em", marginBottom: 14 }}>
        BERNTOUTGLOBAL LLC · THE SCENE IS LIVE NOW
      </div>

      {/* Challenge banner */}
      <div style={{
        background: "rgba(123,0,255,0.25)", border: "1px solid rgba(123,0,255,0.5)",
        borderRadius: 6, padding: "8px 14px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        maxWidth: 600, margin: "0 auto 12px",
      }}>
        <span style={{
          background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)",
          borderRadius: 4, padding: "4px 8px", fontSize: 10,
        }}>◀</span>
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#fff", letterSpacing: "0.08em" }}>
            CHALLENGE YOUR SONG HERE
          </div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>SONG FOR SONG · WORK FOR WORK</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link href="/rooms/challenge-arena" style={{ fontSize: 9, fontWeight: 700, color: "#00E5FF", textDecoration: "none" }}>
            START NOW
          </Link>
          <span style={{
            background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)",
            borderRadius: 4, padding: "4px 8px", fontSize: 10,
          }}>▶</span>
        </div>
      </div>

      {/* Action row 1 */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
        <Link href="/signup" style={btnStyle("rgba(0,255,127,0.15)", "#00FF7F", "rgba(0,255,127,0.4)")}>JOIN FREE</Link>
        <Link href="/login"  style={btnStyle("rgba(255,255,255,0.08)", "rgba(255,255,255,0.8)", "rgba(255,255,255,0.2)")}>LOGIN</Link>
        <Link href="/rooms/challenge-arena" style={btnStyle("rgba(255,215,0,0.15)", "#FFD700", "rgba(255,215,0,0.4)")}>CHALLENGE SONG</Link>
      </div>

      {/* Action row 2 */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
        <Link href="/rooms/cypher?autoSeat=1" style={btnStyle("rgba(0,229,255,0.15)", "#00E5FF", "rgba(0,229,255,0.4)")}>CYPHER ARENA</Link>
        <Link href="/magazine"               style={btnStyle("rgba(255,45,170,0.15)",  "#FF2DAA", "rgba(255,45,170,0.4)")}>MAGAZINE</Link>
        <Link href="/hub/sponsor"            style={btnStyle("rgba(155,89,182,0.15)", "#9B59B6", "rgba(155,89,182,0.4)")}>SPONSOR</Link>
      </div>

      {/* Action row 3 */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Link href="/hub/advertiser" style={btnStyle("rgba(230,48,0,0.2)", "#E63000", "rgba(230,48,0,0.4)")}>ADVERTISE</Link>
      </div>
    </section>
  );
}

function btnStyle(bg: string, color: string, border: string): React.CSSProperties {
  return {
    background: bg, color, border: `1px solid ${border}`,
    borderRadius: 5, padding: "7px 16px",
    fontSize: 11, fontWeight: 800,
    textDecoration: "none",
    letterSpacing: "0.05em", textTransform: "uppercase",
    display: "inline-block",
  };
}
