"use client";

import { useMemo, useState } from "react";

type BookingState = "pending" | "accepted";

type BookingItem = {
  id: string;
  performer: string;
  date: string;
  state: BookingState;
};

const INITIAL_BOOKINGS: BookingItem[] = [
  { id: "bk-1", performer: "Nova Cipher", date: "2026-05-08", state: "pending" },
  { id: "bk-2", performer: "Ray Journey", date: "2026-05-11", state: "accepted" },
  { id: "bk-3", performer: "Kilo Verse", date: "2026-05-16", state: "pending" },
];

export default function VenueBookingRail() {
  const [inviteName, setInviteName] = useState("Mira Flux");
  const [bookings, setBookings] = useState<BookingItem[]>(INITIAL_BOOKINGS);

  const pending = useMemo(() => bookings.filter((b) => b.state === "pending").length, [bookings]);
  const accepted = useMemo(() => bookings.filter((b) => b.state === "accepted").length, [bookings]);

  const invite = () => {
    setBookings((prev) => [
      {
        id: `bk-${prev.length + 1}`,
        performer: inviteName.trim() || "Unnamed Performer",
        date: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
        state: "pending",
      },
      ...prev,
    ]);
  };

  const accept = (id: string) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, state: "accepted" } : b)));
  };

  return (
    <section className="rounded-xl border border-emerald-400/35 bg-black/45 p-4 backdrop-blur">
      <header className="mb-3">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-emerald-300">Booking Rail</p>
        <h2 className="text-lg font-black uppercase tracking-wide text-white">Performer Booking Controls</h2>
      </header>

      <div className="mb-3 grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg border border-emerald-300/25 bg-emerald-950/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">Invites Pending</p>
          <p className="text-xl font-black text-emerald-200">{pending}</p>
        </div>
        <div className="rounded-lg border border-cyan-300/25 bg-cyan-950/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">Accepted</p>
          <p className="text-xl font-black text-cyan-200">{accepted}</p>
        </div>
        <div className="rounded-lg border border-violet-300/25 bg-violet-950/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">Calendar Slots</p>
          <p className="text-xl font-black text-violet-200">{bookings.length}</p>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <input
          className="min-w-[220px] flex-1 rounded border border-white/20 bg-black/40 px-2 py-1.5 text-xs text-white"
          value={inviteName}
          onChange={(e) => setInviteName(e.target.value)}
          aria-label="Invite performer"
        />
        <button
          type="button"
          onClick={invite}
          className="rounded border border-emerald-300/40 bg-emerald-400/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-emerald-100"
        >
          Invite Performer →
        </button>
      </div>

      <div className="space-y-2">
        {bookings.map((b) => (
          <article key={b.id} className="rounded-lg border border-white/10 bg-zinc-950/60 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-black uppercase tracking-[0.12em] text-white">{b.performer}</p>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${
                  b.state === "accepted"
                    ? "border-emerald-300/40 bg-emerald-500/10 text-emerald-200"
                    : "border-amber-300/40 bg-amber-500/10 text-amber-200"
                }`}
              >
                {b.state}
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-400">Schedule: {b.date}</p>
            {b.state === "pending" ? (
              <button
                type="button"
                onClick={() => accept(b.id)}
                className="mt-2 rounded border border-cyan-300/35 bg-cyan-400/10 px-2 py-1 text-[11px] font-black uppercase tracking-[0.1em] text-cyan-100"
              >
                Accept Booking ▶
              </button>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
