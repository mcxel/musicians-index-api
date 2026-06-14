import type { Metadata } from "next";
import Link from "next/link";
import BillboardArena from "@/components/arena/BillboardArena";
import ArenaRadar from "@/components/arena/ArenaRadar";

export const metadata: Metadata = {
  title: "Arena — Battle · Cypher · Challenge | TMI",
  description: "One live arena system — 1v1 battles, open cyphers, and song challenges running all day.",
};

export default function ArenaPage() {
  return (
    <>
      {/* Arena Triangle header — BATTLE | CYPHER | CHALLENGE */}
      <div style={{ background: "#050815", color: "#fff", fontFamily: "'Inter',sans-serif" }}>
        {/* Triangle masthead */}
        <div style={{
          background: "linear-gradient(135deg,rgba(255,45,170,.12),rgba(255,215,0,.08),rgba(0,229,255,.1))",
          borderBottom: "2px solid rgba(255,215,0,.25)",
          padding: "18px 24px", textAlign: "center",
        }}>
          <div style={{ fontSize: "clamp(18px,3.5vw,26px)", fontWeight: 900, letterSpacing: "0.06em", marginBottom: 4 }}>
            <span style={{ color: "#FF2DAA" }}>BATTLE</span>
            <span style={{ color: "rgba(255,255,255,.25)", margin: "0 12px" }}>·</span>
            <span style={{ color: "#00E5FF" }}>CYPHER</span>
            <span style={{ color: "rgba(255,255,255,.25)", margin: "0 12px" }}>·</span>
            <span style={{ color: "#FFD700" }}>CHALLENGE</span>
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", letterSpacing: "0.15em", fontWeight: 700 }}>
            ONE ARENA SYSTEM — RUNS ALL DAY — AUDIENCE ALWAYS WATCHING
          </div>
        </div>

        {/* 3-column triangle */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          borderBottom: "1px solid rgba(255,255,255,.07)",
          maxWidth: 1100, margin: "0 auto",
        }}>
          {/* BATTLE */}
          <Link href="/battles" style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ background: "linear-gradient(180deg,rgba(255,45,170,.1),rgba(5,8,21,1))", borderRight: "1px solid rgba(255,255,255,.07)", padding: "22px 18px", cursor: "pointer" }}>
              <div style={{ textAlign: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#FF2DAA", letterSpacing: "0.08em", marginBottom: 4 }}>BATTLE</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)" }}>1v1 Head-to-Head</div>
              </div>
              <div style={{ background: "rgba(255,45,170,.07)", border: "1px solid rgba(255,45,170,.25)", borderRadius: 8, padding: "14px", marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ textAlign: "center", flex: 1 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,45,170,.2)", border: "2px solid #FF2DAA", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 4px", fontSize: 13, fontWeight: 800 }}>WV</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>Wavetek</div>
                    <div style={{ fontSize: 8, color: "rgba(255,255,255,.35)" }}>Challenger</div>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "#FF2DAA", padding: "0 8px" }}>VS</div>
                  <div style={{ textAlign: "center", flex: 1 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,215,0,.15)", border: "2px solid #FFD700", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 4px", fontSize: 13, fontWeight: 800, color: "#FFD700" }}>BG</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>Bar God</div>
                    <div style={{ fontSize: 8, color: "rgba(255,255,255,.35)" }}>Defender</div>
                  </div>
                </div>
                <div style={{ background: "rgba(0,0,0,.35)", borderRadius: 4, padding: "7px", textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,.35)", marginBottom: 4 }}>ROUND 2 OF 5</div>
                  <div style={{ display: "flex", height: 5, borderRadius: 3, overflow: "hidden", gap: 2 }}>
                    {["#FF2DAA","#FFD700","rgba(255,255,255,.15)","rgba(255,255,255,.15)","rgba(255,255,255,.15)"].map((c,i) => (
                      <div key={i} style={{ flex: 1, background: c }} />
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,.45)", lineHeight: 1.7 }}>
                <div>⚔️ Judged by crowd votes + panel</div>
                <div>🏆 Winner stays, next challenger enters</div>
                <div>🎭 Arena seats 18,500 — full audience</div>
              </div>
              <div style={{ marginTop: 14, padding: "8px 0", textAlign: "center", fontSize: 9, fontWeight: 800, color: "#FF2DAA", letterSpacing: "0.1em", borderTop: "1px solid rgba(255,45,170,.15)" }}>
                VIEW BATTLES →
              </div>
            </div>
          </Link>

          {/* CYPHER */}
          <Link href="/cypher" style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ background: "linear-gradient(180deg,rgba(0,229,255,.08),rgba(5,8,21,1))", borderRight: "1px solid rgba(255,255,255,.07)", padding: "22px 18px", cursor: "pointer" }}>
              <div style={{ textAlign: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#00E5FF", letterSpacing: "0.08em", marginBottom: 4 }}>CYPHER</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)" }}>Open Mic · All Are Welcome</div>
              </div>
              <div style={{ background: "rgba(0,229,255,.06)", border: "1px solid rgba(0,229,255,.2)", borderRadius: 8, padding: "14px", marginBottom: 12 }}>
                <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 10px" }}>
                  <div style={{ width: 80, height: 80, borderRadius: "50%", border: "1.5px solid rgba(0,229,255,.3)" }} />
                  <div style={{ width: 56, height: 56, borderRadius: "50%", border: "1.5px dashed rgba(0,229,255,.18)", position: "absolute", top: 12, left: 12 }} />
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 22 }}>🎤</div>
                  {["N1","N2","N3"].map((label, i) => {
                    const angles = [90, 180, 270];
                    const rad = (angles[i]! * Math.PI) / 180;
                    return (
                      <div key={label} style={{
                        position: "absolute",
                        left: `calc(50% + ${38 * Math.cos(rad)}px - 8px)`,
                        top:  `calc(50% + ${38 * Math.sin(rad)}px - 8px)`,
                        width: 16, height: 16, borderRadius: "50%",
                        background: "rgba(0,229,255,.25)", border: "1px solid #00E5FF",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 7, fontWeight: 800,
                      }}>{label}</div>
                    );
                  })}
                </div>
                <div style={{ textAlign: "center", fontSize: 9, color: "rgba(255,255,255,.4)" }}>Rotate around the mic all day</div>
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,.45)", lineHeight: 1.7 }}>
                <div>🎤 Everyone gets the mic in rotation</div>
                <div>⚡ Drop bars, get voted up instantly</div>
                <div>🎭 Theater seats 2,730 — intimate</div>
              </div>
              <div style={{ marginTop: 14, padding: "8px 0", textAlign: "center", fontSize: 9, fontWeight: 800, color: "#00E5FF", letterSpacing: "0.1em", borderTop: "1px solid rgba(0,229,255,.15)" }}>
                ENTER CYPHER →
              </div>
            </div>
          </Link>

          {/* CHALLENGE */}
          <Link href="/challenges" style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ background: "linear-gradient(180deg,rgba(255,215,0,.08),rgba(5,8,21,1))", padding: "22px 18px", cursor: "pointer" }}>
              <div style={{ textAlign: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#FFD700", letterSpacing: "0.08em", marginBottom: 4 }}>CHALLENGE</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)" }}>Song vs Song · Continuous</div>
              </div>
              <div style={{ background: "rgba(255,215,0,.06)", border: "1px solid rgba(255,215,0,.2)", borderRadius: 8, padding: "14px", marginBottom: 12 }}>
                {[
                  { name: "Neon Drop",   votes: 847, color: "#00FF88", leading: true  },
                  { name: "Storm Wave",  votes: 723, color: "#FF2DAA", leading: false },
                  { name: "Crown Riot",  votes: 591, color: "#FFD700", leading: false },
                ].map((t, i) => (
                  <div key={t.name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,.3)", width: 12, flexShrink: 0 }}>#{i+1}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: t.leading ? "#fff" : "rgba(255,255,255,.6)" }}>{t.name}</span>
                        <span style={{ fontSize: 9, color: t.color }}>{t.votes}</span>
                      </div>
                      <div style={{ height: 3, background: "rgba(255,255,255,.1)", borderRadius: 2 }}>
                        <div style={{ height: "100%", width: `${Math.round(t.votes / 9)}%`, background: t.color, borderRadius: 2 }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,.45)", lineHeight: 1.7 }}>
                <div>🎵 Submit any track — recorded or live</div>
                <div>🗳️ Community votes determine the winner</div>
                <div>🏆 No live performance required</div>
              </div>
              <div style={{ marginTop: 14, padding: "8px 0", textAlign: "center", fontSize: 9, fontWeight: 800, color: "#FFD700", letterSpacing: "0.1em", borderTop: "1px solid rgba(255,215,0,.15)" }}>
                SUBMIT CHALLENGE →
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Genre Arenas — Always On */}
      <div style={{ background: "#050510", padding: "28px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 900, color: "rgba(255,255,255,0.3)", letterSpacing: "0.25em", marginBottom: 4 }}>GENRE ARENAS · ALWAYS ON · FREE TO ENTER</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>10 Live Arenas Running 24/7</div>
          </div>
          <Link href="/arena/hip-hop" style={{ fontSize: 9, fontWeight: 800, color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 6, padding: "5px 12px", textDecoration: "none", letterSpacing: "0.1em" }}>
            VIEW ALL →
          </Link>
        </div>
        <ArenaRadar accent="#FF2DAA" maxItems={10} />
      </div>

      {/* Billboard Arena districts below */}
      <BillboardArena />
    </>
  );
}
