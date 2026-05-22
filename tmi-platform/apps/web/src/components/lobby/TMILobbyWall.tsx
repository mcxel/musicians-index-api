"use client";

/**
 * TMILobbyWall.tsx
 * Live audience lobby wall for The Musician's Index.
 *
 * What this does:
 *  - Shows all audience members as video tiles (like a live Zoom grid)
 *  - Shows the performer(s) on a larger primary feed
 *  - Live chat column alongside the audience
 *  - Occupancy percentage and room status
 *  - Fan can switch between AUDIENCE VIEW and DASHBOARD VIEW
 *  - PiP video overlay persists when fan goes to dashboard
 *  - Seating sections (front row, general, balcony)
 *
 * Drop at: apps/web/src/components/lobby/TMILobbyWall.tsx
 */

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import TMIVideoRoom from "../media/TMIVideoRoom";

/* ─── Types ─────────────────────────────────────────────────────────────── */
type View = "audience" | "dashboard";
type SeatSection = "front_row" | "general" | "balcony";

interface Seat {
  id: string;
  section: SeatSection;
  userId?: string;
  userName?: string;
  avatarColor?: string;
  isLive: boolean;
  tier: string;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  ts: number;
  type: "chat" | "reaction" | "tip" | "shoutout";
  emoji?: string;
  amount?: number;
}

interface LobbyWallProps {
  roomId: string;
  roomType?: "battle" | "cypher" | "stage" | "venue";
  eventTitle: string;
  performerName: string;
  performerId: string;
  userId: string;
  userName: string;
  userRole?: "fan" | "performer" | "admin";
  userTier?: string;
  totalSeats?: number;
  className?: string;
}

/* ─── Seat grid colors by tier ─────────────────────────────────────────── */
const SEAT_COLORS: Record<SeatSection, string> = {
  front_row: "#f59e0b",
  general:   "#06b6d4",
  balcony:   "#8b5cf6",
};

/* ─── Mock seat data (replace with real API data) ───────────────────────── */
function generateSeats(total: number): Seat[] {
  const names = [
    "Kreach", "KG Supreme", "NovaStar", "Freq Wave", "Savage",
    "DJ Marcel", "B.J. M Beat", "Lagos King", "AtlFan22", "ChicoVibes",
    "FreqRider", "ZuriBloom", "Krypt_Rider", "MusicHead", "BeatSeeker",
  ];
  const tiers = ["Diamond", "Gold", "Silver", "Free"];
  const colors = ["#06b6d4", "#f59e0b", "#a855f7", "#22c55e", "#ef4444", "#ff6600"];

  return Array.from({ length: total }, (_, i) => {
    const occupied = Math.random() < 0.72;
    const section: SeatSection =
      i < total * 0.15
        ? "front_row"
        : i < total * 0.70
        ? "general"
        : "balcony";
    return {
      id: `seat-${i + 1}`,
      section,
      userId: occupied ? `user_${i}` : undefined,
      userName: occupied ? names[i % names.length] : undefined,
      avatarColor: occupied ? colors[i % colors.length] : undefined,
      isLive: occupied && Math.random() < 0.3,
      tier: tiers[Math.floor(Math.random() * tiers.length)],
    };
  });
}

/* ─── Live chat seed ─────────────────────────────────────────────────────── */
const CHAT_SEED: ChatMessage[] = [
  { id: "c1", userId: "u1", userName: "Kreach", text: "Fire!! 🔥", ts: Date.now() - 45000, type: "chat" },
  { id: "c2", userId: "u2", userName: "NovaStar", text: "This beat is hard", ts: Date.now() - 38000, type: "chat" },
  { id: "c3", userId: "u3", userName: "Lagos King", text: "", ts: Date.now() - 30000, type: "reaction", emoji: "👑" },
  { id: "c4", userId: "u4", userName: "ZuriBloom", text: "Sent $10 tip!", ts: Date.now() - 22000, type: "tip", amount: 10 },
  { id: "c5", userId: "u5", userName: "Freq Wave", text: "When's the battle starting?", ts: Date.now() - 15000, type: "chat" },
  { id: "c6", userId: "u6", userName: "ChicoVibes", text: "", ts: Date.now() - 8000, type: "reaction", emoji: "🎤" },
];

/* ─── Chat message row ───────────────────────────────────────────────────── */
function ChatRow({ msg }: { msg: ChatMessage }) {
  if (msg.type === "tip") {
    return (
      <div className="flex items-center gap-1.5 py-1.5 border-b border-white/5">
        <span className="text-yellow-400 text-xs">💰</span>
        <span className="text-yellow-400 text-[10px] font-black">{msg.userName}</span>
        <span className="text-white/50 text-[10px]">tipped ${msg.amount}</span>
      </div>
    );
  }
  if (msg.type === "reaction") {
    return (
      <div className="flex items-center gap-1.5 py-1">
        <span className="text-base">{msg.emoji}</span>
        <span className="text-white/30 text-[9px]">{msg.userName}</span>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-1.5 py-1.5 border-b border-white/5">
      <span className="text-[10px] font-bold text-cyan-400 flex-shrink-0">{msg.userName}</span>
      <span className="text-[10px] text-white/70 leading-snug">{msg.text}</span>
    </div>
  );
}

/* ─── Seat tile ──────────────────────────────────────────────────────────── */
function SeatTile({ seat }: { seat: Seat }) {
  if (!seat.userId) {
    return (
      <div
        className="aspect-square rounded-lg border border-white/5 bg-white/3 flex items-center justify-center"
        style={{ borderColor: SEAT_COLORS[seat.section] + "20" }}
      >
        <span className="text-[8px] text-white/10">•</span>
      </div>
    );
  }

  return (
    <div
      className="aspect-square rounded-lg border relative overflow-hidden flex items-center justify-center"
      style={{
        borderColor: seat.isLive ? SEAT_COLORS[seat.section] : SEAT_COLORS[seat.section] + "40",
        background: seat.avatarColor + "15",
      }}
      title={seat.userName}
    >
      {/* Avatar initial */}
      <span
        className="text-sm font-black"
        style={{ color: seat.avatarColor }}
      >
        {seat.userName?.charAt(0)}
      </span>

      {/* Live indicator */}
      {seat.isLive && (
        <span
          className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ background: SEAT_COLORS[seat.section] }}
        />
      )}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function TMILobbyWall({
  roomId,
  roomType = "stage",
  eventTitle,
  performerName,
  performerId,
  userId,
  userName,
  userRole = "fan",
  userTier = "Free",
  totalSeats = 100,
  className = "",
}: LobbyWallProps) {
  const [view,         setView]         = useState<View>("audience");
  const [seats]                         = useState(() => generateSeats(totalSeats));
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(CHAT_SEED);
  const [chatInput,    setChatInput]    = useState("");
  const [showPiP,      setShowPiP]      = useState(false);
  const [selectedSection, setSelectedSection] = useState<SeatSection | "all">("all");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const occupiedSeats = seats.filter((s) => s.userId);
  const occupancy     = Math.round((occupiedSeats.length / totalSeats) * 100);

  /* Auto-scroll chat */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  /* Simulated incoming messages */
  useEffect(() => {
    const interval = setInterval(() => {
      const reactions = ["🔥", "💎", "🎤", "👑", "⚡", "🏆"];
      const names = ["AtlFan22", "BeatSeeker", "MusicHead", "FreqRider"];
      const id = `msg-${Date.now()}`;
      const isReaction = Math.random() < 0.4;

      setChatMessages((prev) => [
        ...prev.slice(-40),
        {
          id,
          userId: `u${Date.now()}`,
          userName: names[Math.floor(Math.random() * names.length)],
          text: isReaction ? "" : ["That verse!! 🔥", "Keep it going!", "TMI is different", "Live right now!"][Math.floor(Math.random() * 4)],
          ts: Date.now(),
          type: isReaction ? "reaction" : "chat",
          emoji: isReaction ? reactions[Math.floor(Math.random() * reactions.length)] : undefined,
        },
      ]);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  function sendChat(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      {
        id: `my-${Date.now()}`,
        userId,
        userName,
        text: chatInput.trim(),
        ts: Date.now(),
        type: "chat",
      },
    ]);
    setChatInput("");
  }

  /* ── When fan switches to dashboard, show PiP ── */
  function handleViewSwitch(newView: View) {
    if (newView === "dashboard") setShowPiP(true);
    if (newView === "audience") setShowPiP(false);
    setView(newView);
  }

  const filteredSeats = selectedSection === "all"
    ? seats
    : seats.filter((s) => s.section === selectedSection);

  return (
    <div className={`min-h-screen bg-[#05050c] text-white flex flex-col ${className}`}>

      {/* ── TOP BAR ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/60 backdrop-blur sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            LIVE
          </span>
          <span className="text-white font-bold text-sm truncate max-w-[180px]">{eventTitle}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* View toggle */}
          <div className="flex bg-white/5 rounded-lg border border-white/10 p-0.5">
            <button
              onClick={() => handleViewSwitch("audience")}
              className={`text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider transition-all ${
                view === "audience" ? "bg-cyan-600 text-black" : "text-white/50 hover:text-white"
              }`}
            >
              🎭 Audience
            </button>
            <button
              onClick={() => handleViewSwitch("dashboard")}
              className={`text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider transition-all ${
                view === "dashboard" ? "bg-purple-600 text-white" : "text-white/50 hover:text-white"
              }`}
            >
              📊 Dashboard
            </button>
          </div>

          {/* Occupancy */}
          <span className="text-[9px] text-white/40 font-mono">
            {occupancy}% full
          </span>
        </div>
      </div>

      {/* ── PiP VIDEO OVERLAY (persists when on dashboard view) ── */}
      {showPiP && (
        <div className="fixed bottom-20 right-4 z-50 shadow-2xl">
          <TMIVideoRoom
            roomId={roomId}
            roomType={roomType}
            userId={userId}
            userName={userName}
            role="viewer"
            isPiP
            onLeft={() => setShowPiP(false)}
          />
        </div>
      )}

      {/* ══ AUDIENCE VIEW ══ */}
      {view === "audience" && (
        <div className="flex flex-1 overflow-hidden">
          {/* Main area: performer feed + seats */}
          <div className="flex-1 flex flex-col overflow-y-auto">

            {/* Performer video */}
            <div className="mx-4 mt-4">
              <div className="text-[9px] text-white/30 font-black uppercase tracking-widest mb-2">
                {performerName} · On Stage
              </div>
              <TMIVideoRoom
                roomId={`${roomId}-performer`}
                roomType={roomType}
                userId={performerId}
                userName={performerName}
                role="viewer"
                showControls={false}
                className="aspect-video rounded-xl"
                onError={() => {}} // silently handle — performer may not be live yet
              />
            </div>

            {/* Section filter */}
            <div className="flex gap-1 px-4 mt-4">
              {(["all", "front_row", "general", "balcony"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSection(s)}
                  className={`text-[8px] font-black px-2 py-1 rounded uppercase tracking-wider transition-all ${
                    selectedSection === s
                      ? "bg-white/20 text-white"
                      : "bg-white/5 text-white/40 hover:bg-white/10"
                  }`}
                  style={selectedSection === s && s !== "all" ? { color: SEAT_COLORS[s as SeatSection] } : {}}
                >
                  {s === "all" ? "All" : s.replace("_", " ")}
                </button>
              ))}
            </div>

            {/* Audience seat grid */}
            <div className="px-4 py-3 pb-24">
              <div className="text-[9px] text-white/30 font-black uppercase tracking-widest mb-2">
                Live Audience · {occupiedSeats.length}/{totalSeats} seated
              </div>
              <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(36px, 1fr))" }}>
                {filteredSeats.map((seat) => (
                  <SeatTile key={seat.id} seat={seat} />
                ))}
              </div>
            </div>
          </div>

          {/* Chat sidebar */}
          <div className="w-64 flex-shrink-0 border-l border-white/10 flex flex-col bg-black/40">
            <div className="px-3 py-2 border-b border-white/10">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Live Chat</p>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
              {chatMessages.map((msg) => <ChatRow key={msg.id} msg={msg} />)}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={sendChat} className="p-2 border-t border-white/10 flex gap-1.5">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Say something..."
                maxLength={120}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-white/20 outline-none focus:border-cyan-500/50"
              />
              <button
                type="submit"
                className="bg-cyan-600 text-black text-[9px] font-black px-2 py-1.5 rounded-lg"
              >
                ↑
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ══ DASHBOARD VIEW ══ */}
      {view === "dashboard" && (
        <div className="flex-1 px-4 py-6 space-y-4 overflow-y-auto pb-24">
          {/* PiP notice */}
          <div className="border border-cyan-500/20 bg-cyan-950/20 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-cyan-400">Live stream continues in corner</p>
              <p className="text-[9px] text-white/40 mt-0.5">Tap Audience to return to full view</p>
            </div>
            <button
              onClick={() => handleViewSwitch("audience")}
              className="text-[9px] font-black px-3 py-1.5 bg-cyan-600 text-black rounded-lg uppercase"
            >
              Return
            </button>
          </div>

          {/* Fan stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "XP Earned", value: "12,450", color: "#f59e0b" },
              { label: "Credits",   value: "2,840",  color: "#22c55e" },
              { label: "Tier",      value: userTier, color: "#06b6d4" },
              { label: "Rooms Joined", value: "34",  color: "#a855f7" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="border border-white/10 bg-white/3 rounded-xl p-4"
              >
                <p className="text-xl font-black" style={{ color: stat.color }}>
                  {stat.value}
                </p>
                <p className="text-[9px] text-white/40 uppercase tracking-wider mt-0.5">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Quick links */}
          <div className="border border-white/10 rounded-xl p-3 space-y-2">
            <p className="text-[9px] text-white/30 font-black uppercase tracking-widest mb-3">Quick Actions</p>
            {[
              { label: "My Profile",   href: `/hub/fan` },
              { label: "Tip Artist",   href: `/tip/${performerId}` },
              { label: "Messages",     href: `/messages` },
              { label: "Leaderboard",  href: `/top-10` },
              { label: "Season Pass",  href: `/season-pass` },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 hover:text-cyan-400 transition-colors"
              >
                <span className="text-xs text-white/70">{link.label}</span>
                <span className="text-white/30 text-xs">→</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
