"use client";
/**
 * Challenge Arena — Song vs Song · Winner Stays · Nonstop Queue
 *
 * The format:
 *   Current holder's song plays → challenger's song plays
 *   Audience votes in real time (one vote per session)
 *   Winner stays. Loser exits. Next challenger enters immediately.
 *   It never stops. All day. All night.
 *
 * Venue: Arena (18,500 cap) — same engine as Battle Arena
 * Revenue: tips, tickets, sponsor slots all active
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useEvolutionToast } from "@/components/avatar/EvolutionToast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AudienceScene from "@/components/live/AudienceScene";
import UnifiedAdSlot from "@/components/ads/UnifiedAdSlot";
import MediaUploadWidget from "@/components/media/MediaUploadWidget";

// ── Seed queue ────────────────────────────────────────────────────────────────
const SEED_QUEUE = [
  { id: "ch1", name: "Wavetek",      genre: "Hip-Hop",  song: "Big Moves",        color: "#FF2DAA", emoji: "🎤", wins: 8,  platform: "SoundCloud" },
  { id: "ch2", name: "Nova Cipher",  genre: "R&B",      song: "Crown Season",     color: "#FFD700", emoji: "👑", wins: 0,  platform: "Spotify" },
  { id: "ch3", name: "Krypt",        genre: "Drill",    song: "Storm Warning",    color: "#AA2DFF", emoji: "🔥", wins: 0,  platform: "YouTube" },
  { id: "ch4", name: "Bar God",      genre: "Lyrical",  song: "No Contest",       color: "#00FFFF", emoji: "⚔️", wins: 0,  platform: "SoundCloud" },
  { id: "ch5", name: "FlowMaster",   genre: "Gospel",   song: "Higher Ground",    color: "#00FF88", emoji: "🙌", wins: 0,  platform: "Apple Music" },
  { id: "ch6", name: "Zuri Bloom",   genre: "Alt-Soul", song: "Glass Butterfly",  color: "#FF6B35", emoji: "🦋", wins: 0,  platform: "Spotify" },
  { id: "ch7", name: "Lagos Burst",  genre: "Afrobeats",song: "Naija Wave",       color: "#FFD700", emoji: "🌍", wins: 0,  platform: "YouTube" },
];

type Challenger = typeof SEED_QUEUE[0];

function VoteBar({ holderVotes, challengerVotes, holderColor, challengerColor }: { holderVotes: number; challengerVotes: number; holderColor: string; challengerColor: string }) {
  const total = holderVotes + challengerVotes || 1;
  const holderPct = Math.round((holderVotes / total) * 100);
  const challengerPct = 100 - holderPct;
  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", marginBottom: 6 }}>
        <div style={{ width: `${holderPct}%`, background: holderColor, transition: "width 0.6s ease" }} />
        <div style={{ flex: 1, background: challengerColor, transition: "width 0.6s ease" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, fontWeight: 900 }}>
        <span style={{ color: holderColor }}>{holderPct}% ({holderVotes.toLocaleString()})</span>
        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 8 }}>LIVE VOTES</span>
        <span style={{ color: challengerColor }}>{challengerPct}% ({challengerVotes.toLocaleString()})</span>
      </div>
    </div>
  );
}

function ArtistCard({ artist, role, votes, onVote, hasVoted, accentColor }: { artist: Challenger; role: "holder" | "challenger"; votes: number; onVote: () => void; hasVoted: boolean; accentColor: string }) {
  return (
    <div style={{ background: `${artist.color}0A`, border: `1.5px solid ${artist.color}${hasVoted ? "55" : "33"}`, borderRadius: 16, padding: "20px", textAlign: "center", flex: 1 }}>
      <div style={{ fontSize: 8, letterSpacing: "0.2em", color: artist.color, fontWeight: 900, marginBottom: 8 }}>
        {role === "holder" ? "👑 CROWN HOLDER" : "⚡ CHALLENGER"}
      </div>
      <div style={{ fontSize: 32, marginBottom: 8 }}>{artist.emoji}</div>
      <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 2 }}>{artist.name}</div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>{artist.genre}</div>
      <div style={{ fontSize: 12, color: artist.color, fontWeight: 700, marginBottom: 4 }}>🎵 "{artist.song}"</div>
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>{artist.platform}</div>
      {role === "holder" && artist.wins > 0 && (
        <div style={{ fontSize: 8, fontWeight: 900, color: "#FFD700", background: "rgba(255,215,0,0.12)", border: "1px solid rgba(255,215,0,0.3)", padding: "3px 10px", borderRadius: 20, marginBottom: 12, display: "inline-block", letterSpacing: "0.1em" }}>{artist.wins} WIN STREAK</div>
      )}
      <button
        onClick={onVote}
        disabled={hasVoted}
        style={{ width: "100%", padding: "11px 0", borderRadius: 10, border: "none", background: hasVoted ? "rgba(255,255,255,0.06)" : `linear-gradient(90deg, ${artist.color}, ${artist.color}88)`, color: hasVoted ? "rgba(255,255,255,0.3)" : "#000", fontWeight: 900, fontSize: 11, cursor: hasVoted ? "not-allowed" : "pointer", letterSpacing: "0.1em" }}
      >
        {hasVoted ? "VOTED ✓" : `VOTE ${role === "holder" ? "HOLDER" : "CHALLENGER"}`}
      </button>
    </div>
  );
}

export default function ChallengeArenaPage() {
  const router = useRouter();
  const [queue, setQueue] = useState<Challenger[]>(SEED_QUEUE.slice(1));
  const [holder, setHolder] = useState<Challenger>(SEED_QUEUE[0]!);
  const [challenger, setChallenger] = useState<Challenger>(SEED_QUEUE[1]!);
  const [holderVotes, setHolderVotes] = useState(0);
  const [challengerVotes, setChallengerVotes] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedFor, setVotedFor] = useState<"holder" | "challenger" | null>(null);
  const [roundTime, setRoundTime] = useState(120);
  const { showXp, showTierUp, ToastRenderer } = useEvolutionToast();
  const [roundNum, setRoundNum] = useState(1);
  const [phase, setPhase] = useState<"live" | "deciding" | "result">("live");
  const [winner, setWinner] = useState<"holder" | "challenger" | null>(null);
  const [totalViewers] = useState(0);
  const [entryInput, setEntryInput] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Round countdown
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setRoundTime(t => {
        if (t <= 1) {
          setPhase("deciding");
          setTimeout(() => resolveRound(), 2000);
          return 120;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  async function resolveRound() {
    const holderWins = holderVotes > challengerVotes;
    setWinner(holderWins ? "holder" : "challenger");
    setPhase("result");

    // Award XP for winning a challenge round (current user as winner)
    try {
      const res = await fetch("/api/tokens/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "current-user", event: "win_challenge" }),
      });
      const data = await res.json();
      showXp(data.xpAwarded ?? 80, "Challenge Victory");
      if (data.tierChanged && data.newTier) showTierUp(data.newTier);
    } catch { /* non-blocking */ }

    setTimeout(() => {
      if (!holderWins) {
        const newHolder = { ...challenger, wins: 1 };
        const nextChallenger = queue[0] ?? SEED_QUEUE[Math.floor(Math.random() * SEED_QUEUE.length)]!;
        setHolder(newHolder);
        setChallenger({ ...nextChallenger, wins: 0 });
        setQueue(q => [...q.slice(1), holder]);
      } else {
        const nextChallenger = queue[0] ?? SEED_QUEUE[Math.floor(Math.random() * SEED_QUEUE.length)]!;
        setHolder(h => ({ ...h, wins: h.wins + 1 }));
        setChallenger({ ...nextChallenger, wins: 0 });
        setQueue(q => [...q.slice(1), challenger]);
      }
      setHolderVotes(0);
      setChallengerVotes(0);
      setHasVoted(false);
      setVotedFor(null);
      setWinner(null);
      setPhase("live");
      setRoundNum(r => r + 1);
    }, 3000);
  }

  async function vote(side: "holder" | "challenger") {
    if (hasVoted) return;
    setHasVoted(true);
    // Award XP for voting
    try {
      const res = await fetch("/api/tokens/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "current-user", event: "vote_battle" }),
      });
      const data = await res.json();
      showXp(data.xpAwarded ?? 10, "Voted");
      if (data.tierChanged && data.newTier) showTierUp(data.newTier);
    } catch { /* non-blocking */ }
    setVotedFor(side);
    if (side === "holder") setHolderVotes(v => v + 1);
    else setChallengerVotes(v => v + 1);
  }

  function submitChallenge() {
    if (!entryInput.trim()) return;
    setQueue(q => [...q, { id: `user-${Date.now()}`, name: entryInput.trim(), genre: "Various", song: "My Song", color: "#FF6B35", emoji: "🎵", wins: 0, platform: "Upload" }]);
    setEntryInput("");
  }

  const mins = Math.floor(roundTime / 60);
  const secs = roundTime % 60;

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      {ToastRenderer}
      <style>{`@keyframes caBlink{0%,100%{opacity:1}50%{opacity:0}} @keyframes caResultPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}`}</style>

      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, background: "rgba(5,5,16,0.95)", borderBottom: "1px solid rgba(255,215,0,0.15)", padding: "10px 20px", display: "flex", gap: 14, alignItems: "center", backdropFilter: "blur(14px)", zIndex: 50 }}>
        <Link href="/compete" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Arena Triangle</Link>
        <span style={{ fontSize: 11, fontWeight: 900, color: "#FFD700", letterSpacing: "0.08em" }}>⚡ CHALLENGE ARENA</span>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginLeft: "auto" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF2020", display: "inline-block", animation: "caBlink 1s step-end infinite" }} />
          <span style={{ fontSize: 9, fontWeight: 900, color: "#FF2020", letterSpacing: "0.12em" }}>LIVE</span>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginLeft: 4 }}>{totalViewers.toLocaleString()} watching</span>
        </div>
      </nav>

      {/* 3D Arena preview */}
      <div style={{ height: 220, position: "relative", overflow: "hidden" }}>
        <AudienceScene venue={1} watcherCount={18500} view="fan" accentColor="#FFD700" bpm={130} screenLabel={`ROUND ${roundNum} · CHALLENGE ARENA`} screenSubLabel={`${holder.name} vs ${challenger.name}`} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 30%, #050510 100%)" }} />
        <div style={{ position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,215,0,0.4)", borderRadius: 8, padding: "6px 20px", backdropFilter: "blur(8px)", textAlign: "center" }}>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", letterSpacing: "0.15em" }}>ROUND ENDS IN</div>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 22, fontWeight: 900, color: roundTime < 30 ? "#FF2020" : "#FFD700", fontVariantNumeric: "tabular-nums" }}>
            {mins}:{secs.toString().padStart(2, "0")}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "0 16px" }}>

        {/* Result overlay */}
        {phase === "result" && winner && (
          <div style={{ background: winner === "holder" ? "rgba(255,215,0,0.12)" : "rgba(255,45,170,0.12)", border: `2px solid ${winner === "holder" ? "#FFD700" : "#FF2DAA"}`, borderRadius: 14, padding: "16px 20px", marginBottom: 16, textAlign: "center", animation: "caResultPulse 0.5s ease-in-out" }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: winner === "holder" ? "#FFD700" : "#FF2DAA", letterSpacing: "0.2em" }}>
              {winner === "holder" ? "👑 CROWN HOLDER WINS! NEXT CHALLENGER ENTERING…" : "⚡ CHALLENGER TAKES THE CROWN!"}
            </div>
          </div>
        )}

        {/* Main battle */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 800, marginBottom: 12, textAlign: "center" }}>SONG VS SONG · WINNER STAYS · NONSTOP</div>
          <div style={{ display: "flex", gap: 12, alignItems: "stretch" }}>
            <ArtistCard artist={holder} role="holder" votes={holderVotes} onVote={() => vote("holder")} hasVoted={hasVoted} accentColor="#FFD700" />

            {/* VS divider */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, flexShrink: 0 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #FF2DAA, #FFD700)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 12, color: "#000" }}>VS</div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", textAlign: "center" }}>ROUND<br />{roundNum}</div>
            </div>

            <ArtistCard artist={challenger} role="challenger" votes={challengerVotes} onVote={() => vote("challenger")} hasVoted={hasVoted} accentColor="#FF2DAA" />
          </div>

          {/* Vote bar */}
          <div style={{ marginTop: 14, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 16px" }}>
            <VoteBar holderVotes={holderVotes} challengerVotes={challengerVotes} holderColor={holder.color} challengerColor={challenger.color} />
            {hasVoted && votedFor && (
              <div style={{ marginTop: 8, textAlign: "center", fontSize: 10, color: votedFor === "holder" ? holder.color : challenger.color, fontWeight: 700 }}>
                You voted for {votedFor === "holder" ? holder.name : challenger.name} ✓
              </div>
            )}
          </div>
        </div>

        {/* Revenue hooks */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20, justifyContent: "center" }}>
          {[
            { label: `💰 Tip ${holder.name}`, href: `/api/stripe/checkout?priceId=price_tip&amount=500&productName=${encodeURIComponent("Tip "+holder.name)}&mode=payment`, color: "#FFD700" },
            { label: `💰 Tip ${challenger.name}`, href: `/api/stripe/checkout?priceId=price_tip&amount=500&productName=${encodeURIComponent("Tip "+challenger.name)}&mode=payment`, color: "#FF2DAA" },
            { label: "🎫 Get Ticket", href: `/tickets?event=challenge-arena`, color: "#00FFFF" },
            { label: "🤝 Sponsor Round", href: `/sponsor/battles?venue=challenge-arena`, color: "#AA2DFF" },
            { label: "👑 Subscribe", href: "/subscribe", color: "#00FF88" },
          ].map(h => (
            <Link key={h.label} href={h.href} style={{ padding: "7px 16px", borderRadius: 20, fontSize: 9, fontWeight: 800, color: h.color, border: `1px solid ${h.color}30`, textDecoration: "none", background: `${h.color}08`, letterSpacing: "0.06em" }}>
              {h.label}
            </Link>
          ))}
        </div>

        {/* Ad slot */}
        <UnifiedAdSlot venue="shows" slotKey="gameShowBanner" format="horizontal" accentColor="#FFD700" label="SPONSOR THIS ROUND" style={{ marginBottom: 20 }} />

        {/* Queue + Entry */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
          {/* Queue */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "18px" }}>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 800, marginBottom: 14 }}>CHALLENGERS QUEUE ({queue.length})</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {queue.slice(0, 6).map((c, i) => (
                <div key={c.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "8px 10px", background: "rgba(255,255,255,0.02)", borderRadius: 8 }}>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", minWidth: 16 }}>#{i + 1}</span>
                  <span style={{ fontSize: 18 }}>{c.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{c.name}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>"{c.song}" · {c.genre}</div>
                  </div>
                  <span style={{ fontSize: 7, color: c.color, fontWeight: 800, background: `${c.color}15`, padding: "2px 8px", borderRadius: 10, letterSpacing: "0.08em", whiteSpace: "nowrap" }}>{c.platform}</span>
                </div>
              ))}
              {queue.length > 6 && <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textAlign: "center" }}>+{queue.length - 6} more in queue</div>}
            </div>
          </div>

          {/* Enter the challenge */}
          <div style={{ background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 16, padding: "18px" }}>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#FFD700", fontWeight: 800, marginBottom: 12 }}>⚡ CHALLENGE THE CROWN</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 14 }}>
              Submit your song. When your turn comes, both songs play live and the crowd votes. Winner stays.
            </div>
            {/* Upload your track directly */}
            <MediaUploadWidget
              mediaType="challenge_entry"
              ownerId="current-user"
              ownerName="You"
              ownerRole="performer"
              linkedEntityId="challenge-arena"
              linkedEntityType="challenge"
              accentColor="#FFD700"
              placeholder="Upload your track…"
              onSuccess={({ title }) => {
                if (title) {
                  setQueue(q => [...q, { id: `user-${Date.now()}`, name: title, genre: "Various", song: title, color: "#FF6B35", emoji: "🎵", wins: 0, platform: "Upload" }]);
                }
              }}
            />
            <div style={{ marginTop: 8, textAlign: "center", fontSize: 9, color: "rgba(255,255,255,0.3)" }}>—— or add by name ——</div>
            <input
              placeholder="Your performer name…"
              value={entryInput}
              onChange={e => setEntryInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submitChallenge()}
              style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 8, color: "#fff", fontSize: 12, outline: "none", marginTop: 8, marginBottom: 8, boxSizing: "border-box" }}
            />
            <button onClick={submitChallenge} disabled={!entryInput.trim()} style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "none", background: entryInput.trim() ? "rgba(255,215,0,0.2)" : "rgba(255,255,255,0.04)", color: entryInput.trim() ? "#FFD700" : "rgba(255,255,255,0.2)", fontWeight: 800, fontSize: 10, cursor: entryInput.trim() ? "pointer" : "not-allowed", letterSpacing: "0.08em", outline: "1px solid rgba(255,215,0,0.2)" }}>
              JOIN BY NAME →
            </button>

            {/* Stats */}
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-around" }}>
              {[
                { label: "ROUNDS", value: roundNum.toString(), color: "#FFD700" },
                { label: "WATCHING", value: totalViewers.toLocaleString(), color: "#FF2DAA" },
                { label: "IN QUEUE", value: queue.length.toString(), color: "#00FFFF" },
              ].map(s => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How it works */}
        <div style={{ marginTop: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "16px 20px" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)", fontWeight: 800, marginBottom: 12 }}>HOW IT WORKS</div>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {["Submit your song → join the queue", "Your turn: song plays live to the crowd", "Audience votes live (1 vote per round)", "Win → you hold the crown, next challenger enters", "Lose → you go back in queue"].map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
                <span style={{ color: "#FFD700", fontWeight: 900, flexShrink: 0 }}>{i + 1}.</span>{s}
              </div>
            ))}
          </div>
        </div>

        {/* Nav links */}
        <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/battles/live" style={{ padding: "7px 16px", borderRadius: 20, fontSize: 9, fontWeight: 800, color: "#FF2DAA", border: "1px solid rgba(255,45,170,0.3)", textDecoration: "none", background: "rgba(255,45,170,0.06)" }}>⚔️ BATTLES</Link>
          <Link href="/cypher" style={{ padding: "7px 16px", borderRadius: 20, fontSize: 9, fontWeight: 800, color: "#00FFFF", border: "1px solid rgba(0,255,255,0.3)", textDecoration: "none", background: "rgba(0,255,255,0.06)" }}>🎤 CYPHER</Link>
          <Link href="/compete" style={{ padding: "7px 16px", borderRadius: 20, fontSize: 9, fontWeight: 800, color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)", textDecoration: "none", background: "rgba(255,215,0,0.06)" }}>🏛️ ALL ARENAS</Link>
          <Link href="/rankings" style={{ padding: "7px 16px", borderRadius: 20, fontSize: 9, fontWeight: 800, color: "#AA2DFF", border: "1px solid rgba(170,45,255,0.3)", textDecoration: "none", background: "rgba(170,45,255,0.06)" }}>👑 RANKINGS</Link>
        </div>
      </div>
    </main>
  );
}
