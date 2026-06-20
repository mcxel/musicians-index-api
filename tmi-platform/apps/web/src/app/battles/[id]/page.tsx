import Link from "next/link";
import { redirect } from "next/navigation";
import ArenaEventShell from "@/components/live/ArenaEventShell";
import LiveRoomWebRTCLayer from "@/components/live/LiveRoomWebRTCLayer";
import MonetizationRail from "@/components/monetization/MonetizationRail";
import { battleBillboardLobbyWallEngine } from "@/lib/competition/BattleBillboardLobbyWallEngine";
import type { Metadata } from "next";

const ACCENT = "#FF2DAA";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const card = battleBillboardLobbyWallEngine.getCards().find((c) => c.battleId === id);
  if (!card) return { title: "Battle | TMI" };
  return {
    title: `${card.challengerName} vs ${card.targetName} | TMI Battles`,
    description: `Watch ${card.challengerName} vs ${card.targetName} live on The Musician's Index. ${card.formatLabel}`,
  };
}

// Real lookup against the canonical battle engine — previously this page
// looked up a hardcoded record with fabricated viewer counts/prizes/winners
// (Rule 20). No fake fallback: if the engine has nothing for this id, redirect
// to the real hub instead of inventing a battle.
export default async function BattleArenaPage({ params }: Props) {
  const { id } = await params;
  const allCards = battleBillboardLobbyWallEngine.getCards();
  const card = allCards.find((c) => c.battleId === id);

  if (!card) {
    redirect("/battles");
  }

  const liveRoomCard = battleBillboardLobbyWallEngine.getLiveRoomCards().find((c) => c.battleId === id);
  const roomId = liveRoomCard?.roomId ?? `battle-${id}`;
  const title = `${card.challengerName} vs ${card.targetName}`;
  const opponentA = card.challengerName;
  const opponentB = card.targetName;

  const isLive    = card.status === "live";
  const isUpcoming = card.status === "accepted";
  const hasEnded  = card.status === "completed";

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <ArenaEventShell eventType="battle" roomId={roomId} />

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
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: ACCENT }}>
            {card.formatLabel}
          </span>
        </div>

        <h1 style={{ fontSize: "clamp(1.6rem,4vw,3rem)", fontWeight: 900, letterSpacing: "-0.01em", lineHeight: 1.15, marginBottom: 10 }}>
          {title}
        </h1>

        {/* CTA row */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 32 }}>
          {isLive && (
            <Link
              href={`/live/rooms/${roomId}?from=lobby-wall&battleId=${encodeURIComponent(id)}&opponentA=${encodeURIComponent(opponentA)}&opponentB=${encodeURIComponent(opponentB)}&accentA=${encodeURIComponent(ACCENT)}`}
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
              href={`/live/rooms/${roomId}?from=lobby-wall`}
              style={{ padding: "12px 28px", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, textDecoration: "none" }}>
              📺 REPLAY
            </Link>
          )}
          <Link
            href="/battles"
            style={{ padding: "12px 22px", fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: ACCENT, border: `1px solid ${ACCENT}44`, borderRadius: 8, textDecoration: "none", background: `${ACCENT}08` }}>
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
          <LiveRoomWebRTCLayer roomId={roomId} />
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

      {/* Navigation to other battles — real cards from the same engine */}
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px 32px" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.25em", color: "rgba(255,255,255,0.3)", fontWeight: 800, marginBottom: 16 }}>
          MORE BATTLES
        </div>
        {allCards.filter(c => c.battleId !== id).length === 0 && (
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>No other battles right now.</p>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
          {allCards
            .filter(c => c.battleId !== id)
            .map(c => (
              <Link key={c.battleId} href={c.route} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${ACCENT}18`, borderRadius: 10, padding: "14px 16px", display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 18 }}>⚔️</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 800 }}>{c.challengerName} vs {c.targetName}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{c.formatLabel}</div>
                  </div>
                  <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.1em", color: c.status === "live" ? "#00FF88" : c.status === "accepted" ? "#00FFFF" : "rgba(255,255,255,0.3)" }}>{c.status.toUpperCase()}</span>
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