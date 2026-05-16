"use client";

import { useState } from "react";

type InboxSource = "booking" | "artist" | "venue" | "fan" | "support" | "staff" | "alert" | "bot";

interface InboxMessage {
  id: string;
  from: string;
  source: InboxSource;
  subject: string;
  preview: string;
  ts: string;
  read: boolean;
  priority: "high" | "normal" | "low";
}

const SEED_MESSAGES: InboxMessage[] = [
  { id: "m1", from: "Crown Stage",       source: "venue",   subject: "Venue confirmation — Sat 8pm",         preview: "TMI Monthly Idol Finale stage is confirmed...",        ts: "4m",  read: false, priority: "high" },
  { id: "m2", from: "KOVA",              source: "artist",  subject: "Set time adjustment request",          preview: "Requesting 30-min shift to 8:30pm slot...",            ts: "11m", read: false, priority: "high" },
  { id: "m3", from: "Booking System",    source: "booking", subject: "3 new bookings — Electric Blue Club",  preview: "Table 14, Table 22, and VIP section booked...",         ts: "18m", read: false, priority: "normal" },
  { id: "m4", from: "Safety Bot",        source: "bot",     subject: "Incident report — Room 12",            preview: "Moderation trigger at 14:32 UTC...",                    ts: "22m", read: true,  priority: "high" },
  { id: "m5", from: "Fan #u-4481",       source: "fan",     subject: "Ticket transfer inquiry",              preview: "I purchased 2 tickets and need to transfer one...",     ts: "35m", read: true,  priority: "normal" },
  { id: "m6", from: "Support Agent",     source: "support", subject: "Escalation: payout delay",             preview: "Artist DJ Fenix is asking about payout from...",        ts: "1h",  read: true,  priority: "normal" },
  { id: "m7", from: "Micah",             source: "staff",   subject: "Weekly report ready",                  preview: "Q2 analytics report is attached for review...",         ts: "2h",  read: true,  priority: "low" },
  { id: "m8", from: "Julius Alerts",     source: "alert",   subject: "Points threshold breach",              preview: "User u-0912 hit streak cap. Auto-reward queued...",     ts: "3h",  read: true,  priority: "low" },
];

const SOURCE_STYLE: Record<InboxSource, string> = {
  booking: "text-amber-300",
  artist:  "text-fuchsia-300",
  venue:   "text-cyan-300",
  fan:     "text-green-300",
  support: "text-blue-300",
  staff:   "text-violet-300",
  alert:   "text-rose-300",
  bot:     "text-zinc-400",
};

const PRIORITY_BORDER: Record<InboxMessage["priority"], string> = {
  high:   "border-l-rose-500",
  normal: "border-l-cyan-500/50",
  low:    "border-l-zinc-600",
};

export default function UnifiedInbox() {
  const [messages, setMessages] = useState(SEED_MESSAGES);
  const [activeFilter, setActiveFilter] = useState<InboxSource | "all">("all");

  const unread = messages.filter((m) => !m.read).length;
  const visible = activeFilter === "all" ? messages : messages.filter((m) => m.source === activeFilter);

  function markRead(id: string) {
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, read: true } : m));
  }

  const sources: Array<InboxSource | "all"> = ["all", "booking", "artist", "venue", "fan", "support", "staff", "alert", "bot"];

  return (
    <section className="flex h-full flex-col rounded-xl border border-violet-400/30 bg-black/60 p-3">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-400">Unified Inbox</p>
          <p className="text-[11px] font-black uppercase text-white">Global Messages</p>
        </div>
        {unread > 0 && (
          <span className="rounded-full border border-rose-500/50 bg-rose-500/15 px-2 py-0.5 text-[9px] font-black text-rose-300">
            {unread} NEW
          </span>
        )}
      </header>

      {/* Source filter tabs */}
      <div className="mb-2 flex flex-wrap gap-1">
        {sources.map((s) => (
          <button
            key={s}
            onClick={() => setActiveFilter(s)}
            className={`rounded border px-2 py-0.5 text-[8px] font-black uppercase transition ${
              activeFilter === s
                ? "border-violet-400/60 bg-violet-500/15 text-violet-200"
                : "border-white/10 text-zinc-500 hover:border-white/25 hover:text-zinc-300"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Message list */}
      <div className="flex-1 space-y-1.5 overflow-y-auto">
        {visible.map((msg) => (
          <div
            key={msg.id}
            onClick={() => markRead(msg.id)}
            className={`cursor-pointer rounded-lg border-l-2 border border-white/10 bg-black/45 p-2 transition hover:bg-black/60 ${PRIORITY_BORDER[msg.priority]} ${!msg.read ? "bg-zinc-900/60" : ""}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="mb-0.5 flex items-center gap-1.5">
                  <span className={`text-[9px] font-black uppercase ${SOURCE_STYLE[msg.source]}`}>{msg.source}</span>
                  <span className="truncate text-[9px] text-zinc-300">{msg.from}</span>
                  <span className="ml-auto shrink-0 text-[8px] text-zinc-500">{msg.ts}</span>
                </div>
                <p className={`text-[10px] font-bold leading-tight ${msg.read ? "text-zinc-400" : "text-white"}`}>{msg.subject}</p>
                <p className="mt-0.5 truncate text-[8px] text-zinc-500">{msg.preview}</p>
              </div>
              {!msg.read && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
