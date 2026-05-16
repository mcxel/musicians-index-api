"use client";

import AdminCommandRail from "@/components/admin/AdminCommandRail";
import AdminVoiceCommandBar from "@/components/admin/AdminVoiceCommandBar";
import AdminTextCommandConsole from "@/components/admin/AdminTextCommandConsole";
import type { TmiAdminRole } from "@/lib/admin/tmiAdminAccessGuard";
import { getOverseerTilesForRole } from "@/lib/admin/tmiOverseerDeckEngine";
import Link from "next/link";

export default function AdminOverseerDeck({ role = "owner" }: { role?: TmiAdminRole }) {
  const tiles = getOverseerTilesForRole(role);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.18),rgba(217,70,239,0.14),rgba(6,182,212,0.12),#030712)] p-4 text-zinc-100">
      <div className="mx-auto grid w-full max-w-[1500px] gap-4 lg:grid-cols-[280px_1fr]">
        <AdminCommandRail />
        <section className="space-y-4 rounded-2xl border border-amber-300/35 bg-black/45 p-4">
          <header className="rounded-xl border border-fuchsia-300/35 bg-gradient-to-r from-fuchsia-500/15 via-amber-500/15 to-cyan-500/15 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-100">Administration Hub · Owner Command Deck</p>
            <h1 className="mt-1 text-2xl font-black uppercase tracking-tight text-zinc-100">Overseer</h1>
          </header>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {tiles.map((tile) => (
              <Link
                key={tile.id}
                href={tile.route}
                className="rounded-xl border border-cyan-300/30 bg-zinc-900/70 p-3 hover:border-cyan-300/60"
              >
                <p className="text-[10px] uppercase tracking-[0.16em] text-cyan-200">{tile.id}</p>
                <p className="mt-1 text-sm font-black uppercase text-zinc-100">{tile.label}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-zinc-400">{tile.route}</p>
              </Link>
            ))}
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <AdminVoiceCommandBar role={role} />
            <AdminTextCommandConsole role={role} />
          </div>
        </section>
      </div>
    </main>
  );
}
