import Link from "next/link";
import { redirect } from "next/navigation";
import ArenaEventShell from "@/components/live/ArenaEventShell";
import LiveRoomWebRTCLayer from "@/components/live/LiveRoomWebRTCLayer";
import MonetizationRail from "@/components/monetization/MonetizationRail";
import type { Metadata } from "next";

const BATTLES: Record<string, {
  id: string; title: string; type: string; status: string;
  viewers: number; prize: string; color: string; winner?: string;
  roomId: string;
}> = {
  b1: { id: "b1", title: "Wavetek vs Krypt",         type: "1v1 RAP",    status: "LIVE",     viewers: 14200, prize: "$500",  color: "#FF2DAA", roomId: "battle-b1-wavetek-krypt" },
  b2: { id: "b2", title: "Bar God vs Verse Knight",  type: "FREESTYLE",  status: "UPCOMING", viewers: 0,     prize: "$250",  color: "#FFD700", roomId: "battle-b2-bargod-verseknight" },
  b3: { id: "b3", title: "Overdrive vs FlowMaster",  type: "MINI-BATTLE",status: "UPCOMING", viewers: 0,     prize: "$100",  color: "#00FFFF", roomId: "battle-b3-overdrive-flowmaster" },
  b4: { id: "b4", title: "MC Phantom vs Cold Spark", type: "1v1 RAP",    status: "ENDED",    viewers: 9800,  prize: "$500",  color: "#AA2DFF", winner: "MC Phantom", roomId: "battle-b4-phantom-coldspark" },
  b5: { id: "b5", title: "Zero Degrees vs Ace Villain",type:"FREESTYLE", status: "ENDED",    viewers: 7400,  prize: "$250",  color: "#00FF88", winner: "Ace Villain", roomId: "battle-b5-zerodegrees-acevillain" },
};

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const battle = BATTLES[id];
  if (!battle) return { title: "Battle | TMI" };
  return {
    title: `${battle.title} | TMI Battles`,
    description: `Watch ${battle.title} live on The Musician's Index. ${battle.type} · Prize: ${battle.prize}`,
  };
}

export default async function BattleArenaPage({ params }: Props) {
  const { id } = await params;
  const battle = BATTLES[id];

  if (!battle) {
    redirect("/battles");
  }

  const isLive    = battle.status === "LIVE";
  const isUpcoming = battle.status === "UPCOMING";
  const hasEnded  = battle.status === "ENDED";

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <ArenaEventShell eventType="battle" roomId={battle.roomId} watcherCount={battle.viewers} />

      {/* Back + breadcrumb */}
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "16px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/battles" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>
          ← ALL BATTLES
        </Link>
        <Link href="/home/5" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>
          CBC ARENA →
        </Link>
      </div>

      {/* Hero */}
      <div style={{
        maxWidth: 1080, margin: "0 auto", padding: "32px 24px 0",
        textAlign: "center",
      }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          {isLive && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(0,255,136,0.12)", border: "1px solid rgba(0,255,136,0.4)", borderRadius: 6, padding: "4px 12px", fontSize: 9, fontWeight: 800, color: "#00FF88", letterSpacing: "0.12em" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#00FF88", display: "inline-block" }} /> LIVE NOW
            </span>
          )}
          {isUpcoming && (
            <span style={{ background: "rgba(0,255,255,0.1)", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 6, padding: "4px 12px", fontSize: 9, fontWeight: 800, color: "#00FFFF", letterSpacing: "0.12em" }}>
              UPCOMING
            </span>
          )}
          {hasEnded && (
            <span style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, padding: "4px 12px", fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em" }}>
              ENDED
            </span>
          )}
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: battle.color }}>
            {battle.type}
          </span>
        </div>

        <h1 style={{ fontSize: "clamp(1.6rem,4vw,3rem)", fontWeight: 900, letterSpacing: "-0.01em", lineHeight: 1.15, marginBottom: 10 }}>
          {battle.title}
        </h1>

        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 20 }}>
          Prize: <strong style={{ color: "#FFD700" }}>{battle.prize}</strong>
          {battle.viewers > 0 && (
            <> &nbsp;·&nbsp; {battle.viewers.toLocaleString()} views</>
          )}
          {battle.winner && (
            <> &nbsp;·&nbsp; 🏆 Winner: <strong style={{ color: "#FFD700" }}>{battle.winner}</strong></>
          )}
        </div>

        {/* CTA row */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 32 }}>
          {isLive && (
            <Link
              href={`/live/rooms/${battle.roomId}?from=lobby-wall`}
              style={{ padding: "12px 32px", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: "linear-gradient(135deg,#FF2DAA,#AA2DFF)", borderRadius: 8, textDecoration: "none", boxShadow: "0 0 24px rgba(255,45,170,0.4)" }}>
              ▶ WATCH & VOTE LIVE
            </Link>
          )}
          {isUpcoming && (
            <Link
              href="/battles"
              style={{ padding: "12px 28px", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: "#00FFFF", border: "1px solid rgba(0,255,255,0.35)", borderRadius: 8, textDecoration: "none", background: "rgba(0,255,255,0.06)" }}>
              🔔 GET NOTIFIED
            </Link>
          )}
          {hasEnded && (
            <Link
              href={`/live/rooms/${battle.roomId}?from=lobby-wall`}
              style={{ padding: "12px 28px", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, textDecoration: "none" }}>
              📺 REPLAY
            </Link>
          )}
          <Link
            href="/battles"
            style={{ padding: "12px 22px", fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: battle.color, border: `1px solid ${battle.color}44`, borderRadius: 8, textDecoration: "none", background: `${battle.color}08` }}>
            ⚔️ ALL BATTLES
          </Link>
          <Link
            href="/challenges"
            style={{ padding: "12px 22px", fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 8, textDecoration: "none", background: "rgba(255,215,0,0.06)" }}>
            🎵 CHALLENGE A SONG
          </Link>
        </div>
      </div>

      {/* Live video embed (active room only) */}
      {isLive && (
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px 32px" }}>
          <LiveRoomWebRTCLayer roomId={battle.roomId} />
        </div>
      )}

      {/* Revenue rail */}
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px 32px" }}>
        <MonetizationRail
          target={{ battleId: id }}
          actions={["tip", "ticket", "season-pass"]}
          heading="BATTLE ECONOMY"
          layout="row"
        />
      </div>

      {/* Navigation to other battles */}
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px 32px" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.25em", color: "rgba(255,255,255,0.3)", fontWeight: 800, marginBottom: 16 }}>
          MORE BATTLES
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
          {Object.values(BATTLES)
            .filter(b => b.id !== id)
            .map(b => (
              <Link key={b.id} href={`/battles/${b.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${b.color}18`, borderRadius: 10, padding: "14px 16px", display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 18 }}>⚔️</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 800 }}>{b.title}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{b.type} · {b.prize}</div>
                  </div>
                  <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.1em", color: b.status === "LIVE" ? "#00FF88" : b.status === "UPCOMING" ? "#00FFFF" : "rgba(255,255,255,0.3)" }}>{b.status}</span>
                </div>
              </Link>
            ))}
        </div>
      </div>

      {/* Cypher + Challenge cross-promo */}
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px 32px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Link href="/cypher" style={{ textDecoration: "none" }}>
          <div style={{ background: "rgba(0,255,255,0.04)", border: "1px solid rgba(0,255,255,0.2)", borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>🎤</div>
            <div style={{ fontSize: 12, fontWeight: 900, color: "#00FFFF", marginBottom: 4 }}>MONDAY CYPHER</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>Open mic. 90-second bars. Crowd votes. Every Monday 8PM.</div>
            <div style={{ marginTop: 10, fontSize: 9, fontWeight: 800, color: "#00FFFF", letterSpacing: "0.1em" }}>ENTER CYPHER →</div>
          </div>
        </Link>
        <Link href="/challenges" style={{ textDecoration: "none" }}>
          <div style={{ background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>🎵</div>
            <div style={{ fontSize: 12, fontWeight: 900, color: "#FFD700", marginBottom: 4 }}>CHALLENGE YOUR SONG</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>Submit any track. Community votes. No live performance required.</div>
            <div style={{ marginTop: 10, fontSize: 9, fontWeight: 800, color: "#FFD700", letterSpacing: "0.1em" }}>CHALLENGE NOW →</div>
          </div>
        </Link>
      </div>
    </main>
  );
}