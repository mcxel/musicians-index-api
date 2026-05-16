"use client";

import Link from "next/link";

const CHALLENGES = [
  { id: "f-1", title: "Answer 5 trivia prompts", reward: "+45 XP", href: "/fan/challenges" },
  { id: "f-2", title: "Vote in 2 battles", reward: "+30 XP", href: "/fan/challenges" },
  { id: "f-3", title: "Join 3 live rooms", reward: "+50 XP", href: "/fan/challenges" },
  { id: "f-4", title: "Discover 1 new artist", reward: "+20 XP", href: "/fan/challenges" },
];

export default function FanChallengeRail() {
  return (
    <section className="rounded-xl border border-emerald-300/30 bg-black/45 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-100">Fan Engagement Rail</p>
        <Link href="/fan/challenges" className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-200 hover:text-emerald-100">Challenges</Link>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {CHALLENGES.map((challenge) => (
          <Link key={challenge.id} href={challenge.href} className="flex items-center justify-between rounded-lg border border-emerald-300/25 bg-emerald-500/10 p-2 hover:border-emerald-100/50">
            <p className="text-[11px] font-black uppercase text-white">{challenge.title}</p>
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-100">{challenge.reward}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
