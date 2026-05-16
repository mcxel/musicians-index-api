"use client";

import Link from "next/link";
import "@/styles/tmiTypography.css";

export default function Home5BattleOfWeekRail() {
  return (
    <section style={shell("#ff6b35")}>
      <h3 className="tmi-battle-headline" style={{ margin: 0, fontSize: 14, marginBottom: 6 }}>Battle Of The Week</h3>
      <Link href="/battles/weekly" className="tmi-button-text" style={{ color: "#fff", textDecoration: "none", fontSize: 11 }}>Open Weekly Battle</Link>
    </section>
  );
}

const shell = (color: string) => ({ border: `1px solid ${color}55`, borderRadius: 10, padding: "12px 14px", background: `${color}18` });