"use client";

import Link from "next/link";

type GameStatus = "LIVE" | "COMING SOON" | "QUEUE OPEN";

interface GameCard {
  id: string;
  title: string;
  status: GameStatus;
  pointsNote: string;
  ctaLabel: string;
  href: string;
  color: "cyan" | "fuchsia" | "amber" | "green" | "violet" | "rose";
}

const GAMES: GameCard[] = [
  { id: "dirty-dozens",       title: "Dirty Dozens",        status: "LIVE",        pointsNote: "+120 pts per win",   ctaLabel: "Enter Now",    href: "/games/dirty-dozens",   color: "fuchsia" },
  { id: "mini-dirty-dozens",  title: "Mini Dirty Dozens",   status: "QUEUE OPEN",  pointsNote: "+60 pts per round",  ctaLabel: "Join Queue",   href: "/games/dirty-dozens",   color: "fuchsia" },
  { id: "joke-offs",          title: "Joke-Offs",           status: "LIVE",        pointsNote: "+80 pts per win",    ctaLabel: "Enter Now",    href: "/games/joke-offs",      color: "amber" },
  { id: "mini-joke-offs",     title: "Mini Joke-Offs",      status: "COMING SOON", pointsNote: "+40 pts per round",  ctaLabel: "Get Notified", href: "/games/joke-offs",      color: "amber" },
  { id: "dance-offs",         title: "Dance-Offs",          status: "QUEUE OPEN",  pointsNote: "+100 pts per win",   ctaLabel: "Join Queue",   href: "/games/dance-offs",     color: "cyan" },
  { id: "mini-dance-offs",    title: "Mini Dance-Offs",     status: "COMING SOON", pointsNote: "+50 pts per round",  ctaLabel: "Get Notified", href: "/games/dance-offs",     color: "cyan" },
  { id: "cypher-arena",       title: "Cypher Arena",        status: "LIVE",        pointsNote: "+150 pts per crown", ctaLabel: "Watch Live",   href: "/games/cypher-arena",   color: "green" },
  { id: "mini-cyphers",       title: "Mini Cyphers",        status: "QUEUE OPEN",  pointsNote: "+70 pts per entry",  ctaLabel: "Join Queue",   href: "/games/cypher-arena",   color: "green" },
  { id: "battles",            title: "Battles",             status: "LIVE",        pointsNote: "+130 pts per win",   ctaLabel: "Watch Live",   href: "/games/battle",         color: "rose" },
  { id: "mini-battles",       title: "Mini Battles",        status: "QUEUE OPEN",  pointsNote: "+65 pts per entry",  ctaLabel: "Join Queue",   href: "/games/battle",         color: "rose" },
  { id: "name-that-tune",     title: "Name That Tune",      status: "COMING SOON", pointsNote: "+50 pts per round",  ctaLabel: "Get Notified", href: "/games/name-that-tune", color: "violet" },
  { id: "trivia-poll-quiz",   title: "Trivia / Poll / Quiz", status: "LIVE",       pointsNote: "+40 pts per win",    ctaLabel: "Play Now",     href: "/games/trivia",         color: "violet" },
  { id: "stream-and-win",     title: "Stream & Win",        status: "LIVE",        pointsNote: "+20 pts per 5min",   ctaLabel: "Start Earning", href: "/games/stream-and-win", color: "cyan" },
  { id: "deal-prize-rooms",   title: "Deal / Prize Rooms",  status: "COMING SOON", pointsNote: "Prize pool entry",   ctaLabel: "Get Notified", href: "/games/prize-room",     color: "amber" },
];

const STATUS_STYLES: Record<GameStatus, string> = {
  "LIVE":        "border-green-400/60 bg-green-500/15 text-green-200",
  "QUEUE OPEN":  "border-cyan-400/60 bg-cyan-500/15 text-cyan-200",
  "COMING SOON": "border-zinc-500/50 bg-zinc-800/40 text-zinc-400",
};

const COLOR_STYLES: Record<GameCard["color"], { border: string; cta: string; label: string }> = {
  cyan:    { border: "border-cyan-300/30 hover:border-cyan-300/70",    cta: "border-cyan-300/50 hover:bg-cyan-500/20 text-cyan-100",    label: "text-cyan-200" },
  fuchsia: { border: "border-fuchsia-300/30 hover:border-fuchsia-300/70", cta: "border-fuchsia-300/50 hover:bg-fuchsia-500/20 text-fuchsia-100", label: "text-fuchsia-200" },
  amber:   { border: "border-amber-300/30 hover:border-amber-300/70",   cta: "border-amber-300/50 hover:bg-amber-500/20 text-amber-100",   label: "text-amber-200" },
  green:   { border: "border-green-300/30 hover:border-green-300/70",   cta: "border-green-300/50 hover:bg-green-500/20 text-green-100",   label: "text-green-200" },
  violet:  { border: "border-violet-300/30 hover:border-violet-300/70", cta: "border-violet-300/50 hover:bg-violet-500/20 text-violet-100", label: "text-violet-200" },
  rose:    { border: "border-rose-300/30 hover:border-rose-300/70",     cta: "border-rose-300/50 hover:bg-rose-500/20 text-rose-100",     label: "text-rose-200" },
};

interface GamesBillboardJumpSessionProps {
  /** Limit visible cards. Defaults to all 14. */
  limit?: number;
  className?: string;
}

export default function GamesBillboardJumpSession({ limit, className = "" }: GamesBillboardJumpSessionProps) {
  const visible = limit ? GAMES.slice(0, limit) : GAMES;

  return (
    <section className={`w-full rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-[2px] ${className}`}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">TMI Games</p>
          <h2 className="text-sm font-black uppercase tracking-tight text-white">
            Games Billboard
          </h2>
        </div>
        <Link
          href="/games"
          className="rounded border border-white/20 bg-black/40 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-zinc-200 hover:border-white/50 hover:bg-white/5"
        >
          All Games →
        </Link>
      </div>

      {/* Grid */}
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-7">
        {visible.map((game) => {
          const c = COLOR_STYLES[game.color];
          return (
            <article
              key={game.id}
              className={`group flex flex-col rounded-lg border bg-black/55 p-3 transition hover:-translate-y-0.5 hover:bg-black/70 ${c.border}`}
            >
              {/* Status badge */}
              <div className="mb-2 flex items-center gap-1.5">
                <span className={`rounded border px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.1em] ${STATUS_STYLES[game.status]}`}>
                  {game.status}
                </span>
              </div>

              {/* Title */}
              <p className={`mb-1 text-[11px] font-black uppercase leading-tight ${c.label}`}>{game.title}</p>

              {/* Points note */}
              <p className="mb-3 flex-1 text-[9px] uppercase tracking-[0.1em] text-zinc-400">{game.pointsNote}</p>

              {/* CTA */}
              <Link
                href={game.href}
                className={`rounded border px-2 py-1 text-center text-[9px] font-black uppercase tracking-[0.1em] transition ${c.cta}`}
              >
                {game.ctaLabel}
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
