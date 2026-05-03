"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

type Seat    = { id: number; taken: boolean; name?: string; icon?: string };
type LobbyMsg= { id: string; user: string; text: string };

const ROOMS: Record<string, {
  name: string; artist: string; artistSlug: string; track: string; genre: string;
  viewers: number; ticketed: boolean; price: number; color: string; description: string;
}> = {
  world:      { name: "Live World",           artist: "TMI All-Stars",    artistSlug: "tmi",         track: "Open World Session",           genre: "Multi-Genre",  viewers: 22400, ticketed: false, price: 0,  color: "#00FFFF", description: "The main TMI world room — always open. All genres, all artists, all fans." },
  cypher:     { name: "Monday Cypher #4",     artist: "Wavetek",          artistSlug: "wavetek",     track: "90-Second Freestyle Rounds",   genre: "Hip-Hop",      viewers: 15800, ticketed: false, price: 0,  color: "#FF2DAA", description: "Weekly open-mic cypher — every Monday. 90-second rounds. Top 3 win XP." },
  battles:    { name: "Wavetek vs Krypt",     artist: "Wavetek & Krypt",  artistSlug: "wavetek",     track: "Head-to-Head Battle Set",      genre: "Battle Rap",   viewers: 14200, ticketed: false, price: 0,  color: "#FFD700", description: "Live 1v1 battle — audience votes in real time. No edits. No cuts." },
  "concert-1":{ name: "Neon Vibe Residency", artist: "Neon Vibe",        artistSlug: "neon-vibe",   track: "Electronic Residency Vol. 4",  genre: "Electronic",   viewers: 8400,  ticketed: true,  price: 9,  color: "#AA2DFF", description: "Monday electronic residency. Ticketed access — full setlist, immersive audio." },
  zuri:       { name: "Zuri Bloom Session",  artist: "Zuri Bloom",       artistSlug: "zuri-bloom",  track: "Roots & Routes EP Preview",    genre: "Afrobeats",    viewers: 560,   ticketed: true,  price: 12, color: "#00FF88", description: "Intimate listening session with Zuri Bloom. Ticket holders only." },
  dd4:        { name: "Dirty Dozens E04",    artist: "12 Artists",       artistSlug: "dirty-dozens",track: "Episode 4 — Live Elimination", genre: "Multi",        viewers: 3200,  ticketed: false, price: 0,  color: "#FFD700", description: "12 artists. 12 rounds. One elimination per round. Audience votes decide." },
  wavetek:    { name: "Fifth Ward Live",     artist: "Wavetek",          artistSlug: "wavetek",     track: "Fifth Ward Sessions Vol. 2",   genre: "Hip-Hop",      viewers: 1900,  ticketed: true,  price: 9,  color: "#FF2DAA", description: "Wavetek's signature live set from the Fifth Ward. Exclusive ticket access." },
};

const SEED_SEATS: Seat[] = [
  { id: 1,  taken: true,  name: "Krypt Fan",     icon: "🔒" },
  { id: 2,  taken: true,  name: "zuribloom_fan", icon: "🌍" },
  { id: 3,  taken: false },
  { id: 4,  taken: true,  name: "producer_88",   icon: "🎛️" },
  { id: 5,  taken: false },
  { id: 6,  taken: true,  name: "mega_fan_007",  icon: "👑" },
  { id: 7,  taken: true,  name: "fan_xyz_421",   icon: "🎤" },
  { id: 8,  taken: false },
  { id: 9,  taken: true,  name: "krypt_rider",   icon: "⚡" },
  { id: 10, taken: false },
  { id: 11, taken: true,  name: "Wavetek_Fan1",  icon: "🔥" },
  { id: 12, taken: false },
];

const SEED_LOBBY: LobbyMsg[] = [
  { id: "l1", user: "krypt_rider",   text: "🔥🔥🔥 this set is CRAZY" },
  { id: "l2", user: "zuribloom_fan", text: "bars for days bro 💯" },
  { id: "l3", user: "mega_fan_007",  text: "drop the merch already!!" },
  { id: "l4", user: "fan_xyz_421",   text: "when is the collab dropping?" },
  { id: "l5", user: "producer_88",   text: "that sample flip was heat 🎛️" },
  { id: "l6", user: "Wavetek_Fan1",  text: "WAVETEK NUMBER 1 💪" },
];

const TIP_AMOUNTS = [5, 10, 25] as const;

type TicketRecord = { id?: string; eventId?: string; roomSlug?: string; status?: string };

function normalizeChatMessages(data: unknown): LobbyMsg[] {
  const msgs = (data as { messages?: unknown[] })?.messages;
  if (!Array.isArray(msgs) || msgs.length === 0) return [];
  return (msgs as Record<string, unknown>[]).map((m, i) => ({
    id:   String(m.id   ?? `m-${i}`),
    user: String((m.user as { name?: string })?.name ?? m.userId ?? "Fan"),
    text: String(m.content ?? ""),
  }));
}

function normalizeMembers(data: unknown): Seat[] {
  if (!Array.isArray(data) || data.length === 0) return SEED_SEATS;
  return SEED_SEATS.map((seat, i) => {
    const member = (data as Record<string, unknown>[])[i];
    if (!member) return seat;
    return { ...seat, taken: true, name: String(member.userId ?? "Fan").slice(0, 12), icon: "🎵" };
  });
}

export default function LiveRoomPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const room = ROOMS[slug];

  const [hasTicket,  setHasTicket]  = useState<boolean | null>(null);
  const [seats,      setSeats]      = useState<Seat[]>(SEED_SEATS);
  const [mySeat,     setMySeat]     = useState<number | null>(null);
  const [lobby,      setLobby]      = useState<LobbyMsg[]>(SEED_LOBBY);
  const [chatInput,  setChatInput]  = useState("");
  const [tipAmt,     setTipAmt]     = useState<number>(5);
  const [tipped,     setTipped]     = useState(false);
  const [chatApiOn,  setChatApiOn]  = useState(false);
  const lobbyBottomRef = useRef<HTMLDivElement>(null);

  // Resolve ticket ownership and room state on mount
  useEffect(() => {
    if (!room) return;

    if (!room.ticketed) {
      // Free room — join immediately, persist via API
      setHasTicket(true);
      void fetch(`/api/rooms/${slug}/join`, { method: "POST", credentials: "include",
        headers: { "content-type": "application/json" }, body: JSON.stringify({ role: "AUDIENCE" }) }).catch(() => {});
      return;
    }

    // Ticketed room — verify ownership via API
    fetch("/api/tickets/mine", { cache: "no-store", credentials: "include" })
      .then(r => r.json())
      .then((d: unknown) => {
        const list = Array.isArray(d) ? (d as TicketRecord[]) :
                     Array.isArray((d as { tickets?: TicketRecord[] })?.tickets) ? (d as { tickets: TicketRecord[] }).tickets : [];
        const owns = list.some(t =>
          t.roomSlug === slug || t.eventId === slug || t.status === "ACTIVE"
        );
        setHasTicket(owns);
        if (owns) {
          void fetch(`/api/rooms/${slug}/join`, { method: "POST", credentials: "include",
            headers: { "content-type": "application/json" }, body: JSON.stringify({ role: "AUDIENCE" }) }).catch(() => {});
        }
      })
      .catch(() => setHasTicket(false));
  }, [slug, room]);

  // Load chat history and members once access is confirmed
  useEffect(() => {
    if (!hasTicket) return;

    fetch(`/api/rooms/${slug}/chat?limit=30`, { cache: "no-store", credentials: "include" })
      .then(r => r.json())
      .then((d: unknown) => {
        const msgs = normalizeChatMessages(d);
        if (msgs.length > 0) { setLobby(msgs); setChatApiOn(true); }
      })
      .catch(() => {});

    fetch(`/api/rooms/${slug}/members`, { cache: "no-store", credentials: "include" })
      .then(r => r.json())
      .then((d: unknown) => {
        const normalized = normalizeMembers(d);
        setSeats(normalized);
      })
      .catch(() => {});
  }, [hasTicket, slug]);

  // Persist leave on unmount
  useEffect(() => {
    if (!hasTicket) return;
    return () => {
      void fetch(`/api/rooms/${slug}/leave`, { method: "POST", credentials: "include" }).catch(() => {});
    };
  }, [hasTicket, slug]);

  useEffect(() => {
    lobbyBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lobby]);

  const claimSeat = useCallback(async (id: number) => {
    if (seats.find(s => s.id === id)?.taken && mySeat !== id) return;

    const isLeaving = mySeat === id;
    setSeats(prev => prev.map(s => {
      if (s.id === mySeat && mySeat !== id) return { ...s, taken: false, name: undefined, icon: undefined };
      if (s.id === id && !isLeaving)        return { ...s, taken: true,  name: "You", icon: "🎵" };
      if (s.id === id && isLeaving)         return { ...s, taken: false, name: undefined, icon: undefined };
      return s;
    }));
    setMySeat(isLeaving ? null : id);
  }, [seats, mySeat]);

  const sendChat = useCallback(async () => {
    const text = chatInput.trim();
    if (!text) return;
    setChatInput("");

    const optimistic: LobbyMsg = { id: `u${Date.now()}`, user: "You", text };
    setLobby(prev => [...prev, optimistic]);

    if (chatApiOn) {
      await fetch(`/api/rooms/${slug}/chat`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: text }),
      }).catch(() => {});
    }
  }, [chatInput, chatApiOn, slug]);

  const sendTip = useCallback(async () => {
    setTipped(true);
    setTimeout(() => setTipped(false), 2800);

    await fetch("/api/tips", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ amount: tipAmt, roomSlug: slug, recipientId: room?.artistSlug }),
    }).catch(() => {});
  }, [tipAmt, slug, room?.artistSlug]);

  if (!room) {
    return (
      <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", display: "grid", placeItems: "center", padding: 24 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
          <h1 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>Room Not Found</h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>This room doesn&apos;t exist or has ended.</p>
          <Link href="/live" style={{ fontSize: 10, fontWeight: 800, color: "#00FFFF", textDecoration: "none", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 8, padding: "10px 20px" }}>← LIVE ROOMS</Link>
        </div>
      </main>
    );
  }

  // Ticket check in progress
  if (hasTicket === null) {
    return (
      <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", display: "grid", placeItems: "center" }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Verifying access…</div>
      </main>
    );
  }

  // No ticket — show purchase gate (real checkout, not localStorage)
  if (!hasTicket) {
    return (
      <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", display: "grid", placeItems: "center", padding: 24 }}>
        <div style={{ maxWidth: 440, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 52, marginBottom: 20 }}>🎟️</div>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: room.color, marginBottom: 12 }}>TICKETED ROOM</div>
          <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>{room.name}</h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 28, lineHeight: 1.7 }}>{room.description}</p>
          <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${room.color}30`, borderRadius: 14, padding: "22px 28px", marginBottom: 24 }}>
            <div style={{ fontSize: 34, fontWeight: 900, color: room.color, marginBottom: 4 }}>${room.price}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>One-time access · Instant entry</div>
          </div>
          {/* Real checkout — no localStorage bypass */}
          <Link
            href={`/checkout?item=${slug}&price=${room.price}&type=room-ticket`}
            style={{ display: "block", width: "100%", padding: "14px 0", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: `linear-gradient(135deg,${room.color},${room.color}99)`, borderRadius: 12, textDecoration: "none", marginBottom: 14, textAlign: "center" }}
          >
            GET TICKET — ${room.price}
          </Link>
          <Link href="/tickets" style={{ display: "block", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", textDecoration: "none", marginBottom: 8 }}>
            Check existing tickets
          </Link>
          <Link href="/live" style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.25)", textDecoration: "none" }}>← BACK TO LIVE ROOMS</Link>
        </div>
      </main>
    );
  }

  const takenCount = seats.filter(s => s.taken).length;
  const joined = mySeat !== null;

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 60, paddingTop: 56 }}>
      {/* Top bar */}
      <div style={{ padding: "13px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <Link href="/live" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>← LIVE ROOMS</Link>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00FF88", display: "inline-block", boxShadow: "0 0 8px #00FF88" }} />
          <span style={{ fontSize: 10, fontWeight: 800, color: "#00FF88" }}>LIVE</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>· {room.viewers.toLocaleString()} watching</span>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Performer stage panel */}
        <section style={{ background: "rgba(5,5,16,0.95)", border: `1px solid ${room.color}30`, borderRadius: 16, padding: "26px 28px 22px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${room.color},${room.color}55,transparent)` }} />
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.2em", color: room.color, marginBottom: 10 }}>NOW PERFORMING</div>
              <h1 style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>{room.artist}</h1>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>{room.track}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 700, letterSpacing: "0.12em" }}>
                {room.genre} · {room.name}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em" }}>TIP AMOUNT</div>
              <div style={{ display: "flex", gap: 8 }}>
                {TIP_AMOUNTS.map(amt => (
                  <button
                    key={amt}
                    onClick={() => setTipAmt(amt)}
                    style={{ padding: "6px 14px", fontSize: 11, fontWeight: 800, borderRadius: 8, border: "1px solid rgba(255,215,0,0.4)", cursor: "pointer", color: tipAmt === amt ? "#050510" : "#FFD700", background: tipAmt === amt ? "#FFD700" : "rgba(255,215,0,0.08)" }}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
              <button
                onClick={() => void sendTip()}
                style={{ padding: "10px 20px", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: "#050510", background: tipped ? "#00FF88" : "#FFD700", borderRadius: 10, border: "none", cursor: "pointer", transition: "background 0.3s" }}
              >
                {tipped ? "TIP SENT 🔥" : `TIP $${tipAmt}`}
              </button>
              <Link
                href={`/artists/${room.artistSlug}`}
                style={{ fontSize: 9, fontWeight: 700, color: room.color, textDecoration: "none", textAlign: "center", border: `1px solid ${room.color}40`, borderRadius: 8, padding: "7px 14px" }}
              >
                ARTIST PAGE →
              </Link>
            </div>
          </div>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

          {/* Audience seat grid */}
          <section style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>AUDIENCE SEATS</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginBottom: 16 }}>
              {takenCount}/{seats.length} occupied
              {joined && <span style={{ color: "#FF2DAA", marginLeft: 8 }}>· You&apos;re in seat {mySeat}</span>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {seats.map(seat => {
                const isMe  = mySeat === seat.id;
                const open  = !seat.taken;
                return (
                  <button
                    key={seat.id}
                    onClick={() => (open || isMe) ? void claimSeat(seat.id) : undefined}
                    style={{
                      padding: "10px 4px", borderRadius: 10,
                      border: isMe ? "2px solid #FF2DAA" : open ? "1px dashed rgba(255,255,255,0.18)" : "1px solid rgba(255,255,255,0.07)",
                      background: isMe ? "rgba(255,45,170,0.15)" : open ? "rgba(255,255,255,0.01)" : "rgba(255,255,255,0.03)",
                      cursor: open || isMe ? "pointer" : "default",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{seat.taken ? (seat.icon ?? "👤") : "+"}</span>
                    <span style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>
                      {seat.taken ? (seat.name ?? "Fan") : "open"}
                    </span>
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: 14, fontSize: 9, color: "rgba(255,255,255,0.22)", textAlign: "center" }}>
              {joined ? "Tap your seat to leave" : "Tap an open seat to join"}
            </div>
          </section>

          {/* Lobby wall */}
          <section style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)" }}>LOBBY WALL</div>
              {!chatApiOn && <span style={{ fontSize: 8, color: "#FFD700", fontWeight: 700 }}>PREVIEW</span>}
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, overflowY: "auto", maxHeight: 220, marginBottom: 14 }}>
              {lobby.map(msg => (
                <div key={msg.id} style={{ display: "flex", gap: 6, fontSize: 11 }}>
                  <span style={{ fontWeight: 800, color: msg.user === "You" ? "#FF2DAA" : "#00FFFF", flexShrink: 0 }}>{msg.user}</span>
                  <span style={{ color: "rgba(255,255,255,0.65)" }}>{msg.text}</span>
                </div>
              ))}
              <div ref={lobbyBottomRef} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && void sendChat()}
                placeholder="Say something…"
                style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 12, outline: "none" }}
              />
              <button
                onClick={() => void sendChat()}
                style={{ padding: "8px 14px", fontSize: 9, fontWeight: 800, letterSpacing: "0.08em", color: "#050510", background: "#00FFFF", borderRadius: 8, border: "none", cursor: "pointer" }}
              >
                SEND
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
