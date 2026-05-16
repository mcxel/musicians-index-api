"use client";

import { useState } from "react";
import { runAdminVoiceCommand, type TmiVoiceCommand } from "@/lib/admin/tmiAdminVoiceCommandEngine";
import type { TmiAdminRole } from "@/lib/admin/tmiAdminAccessGuard";

const COMMAND_MAP: Record<string, TmiVoiceCommand> = {
  "jump route": "jump-route",
  "open monitor": "open-monitor",
  "zoom feed": "zoom-feed",
  "summon big ace": "summon-big-ace",
};

export default function AdminTextCommandConsole({ role = "admin" }: { role?: TmiAdminRole }) {
  const [input, setInput] = useState("");
  const [log, setLog] = useState<string[]>([]);

  const submit = () => {
    const mapped = COMMAND_MAP[input.trim().toLowerCase()];
    if (!mapped) {
      setLog((prev) => [`Unknown command: ${input}`, ...prev].slice(0, 8));
      return;
    }
    const result = runAdminVoiceCommand(role, mapped, input);
    setLog((prev) => [`${result.accepted ? "ACCEPTED" : "REJECTED"}: ${input}${result.reason ? ` (${result.reason})` : ""}`, ...prev].slice(0, 8));
    setInput("");
  };

  return (
    <section className="rounded-2xl border border-cyan-300/35 bg-black/55 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">Text Command Console</p>
      <div className="mt-2 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full rounded-lg border border-white/15 bg-zinc-900/80 px-2 py-2 text-xs text-zinc-100 outline-none"
          placeholder="Type command (e.g., jump route)"
        />
        <button onClick={submit} className="rounded-lg border border-cyan-300/60 bg-cyan-500/20 px-3 py-2 text-[10px] font-black uppercase text-cyan-100">
          Run
        </button>
      </div>
      <div className="mt-2 space-y-1">
        {log.map((entry, i) => (
          <p key={`${entry}-${i}`} className="text-[10px] uppercase tracking-[0.12em] text-zinc-300">{entry}</p>
        ))}
      </div>
    </section>
  );
}
