"use client";

import { useState } from "react";
import { runAdminVoiceCommand, type TmiVoiceCommand } from "@/lib/admin/tmiAdminVoiceCommandEngine";
import type { TmiAdminRole } from "@/lib/admin/tmiAdminAccessGuard";

export default function AdminVoiceCommandBar({ role = "admin" }: { role?: TmiAdminRole }) {
  const [last, setLast] = useState<string>("No command yet");

  const run = (command: TmiVoiceCommand) => {
    const result = runAdminVoiceCommand(role, command, "manual-trigger");
    setLast(result.accepted ? `Accepted: ${command}` : `Rejected: ${result.reason}`);
  };

  return (
    <section className="rounded-2xl border border-fuchsia-300/35 bg-black/55 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-fuchsia-200">Voice Command Shell</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button className="rounded-full border border-fuchsia-300/60 bg-fuchsia-500/20 px-3 py-1 text-[10px] font-black uppercase text-fuchsia-100" onClick={() => run("jump-route")}>Jump Route</button>
        <button className="rounded-full border border-fuchsia-300/60 bg-fuchsia-500/20 px-3 py-1 text-[10px] font-black uppercase text-fuchsia-100" onClick={() => run("open-monitor")}>Open Monitor</button>
        <button className="rounded-full border border-fuchsia-300/60 bg-fuchsia-500/20 px-3 py-1 text-[10px] font-black uppercase text-fuchsia-100" onClick={() => run("zoom-feed")}>Zoom Feed</button>
      </div>
      <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-zinc-300">{last}</p>
    </section>
  );
}
