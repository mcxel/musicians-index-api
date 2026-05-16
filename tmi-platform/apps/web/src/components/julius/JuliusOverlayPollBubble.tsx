"use client";

import { useMemo, useState } from "react";
import {
  createPoll,
  votePoll,
  closePoll,
  resolvePoll,
  applyPollResult,
  getPollTallies,
  type JuliusPollType,
} from "@/lib/julius/tmiJuliusOverlayPollEngine";

const POLL_TYPES: JuliusPollType[] = ["keep", "retire", "return", "premium", "free", "seasonal", "event-only"];

export default function JuliusOverlayPollBubble() {
  const [pollId, setPollId] = useState<string | null>(null);
  const [overlayId, setOverlayId] = useState("ovr-profile-neon-v1");
  const [issueId, setIssueId] = useState("issue-2026-01");
  const [pollType, setPollType] = useState<JuliusPollType>("keep");
  const [status, setStatus] = useState("No poll");
  const [closesAt, setClosesAt] = useState<number | null>(null);

  const countdown = useMemo(() => {
    if (!closesAt) return "—";
    const sec = Math.max(0, Math.floor((closesAt - Date.now()) / 1000));
    return `${sec}s`;
  }, [closesAt, status]);

  const tallies = pollId ? getPollTallies(pollId) : { yes: 0, no: 0, total: 0 };

  function onCreate() {
    const p = createPoll(overlayId, issueId, pollType, 60_000);
    setPollId(p.id);
    setClosesAt(p.closesAt);
    setStatus(`Poll created: ${p.id}`);
  }

  function onVote(choice: "yes" | "no") {
    if (!pollId) return setStatus("LOCKED: create poll first");
    const res = votePoll(pollId, "fan-demo", choice);
    setStatus(res.ok ? `Vote ${choice} submitted` : `Vote blocked: ${res.reason}`);
  }

  function onClose() {
    if (!pollId) return setStatus("LOCKED: create poll first");
    const res = closePoll(pollId);
    setStatus(res.ok ? "Poll closed" : `Close blocked: ${res.reason}`);
  }

  function onResolve() {
    if (!pollId) return setStatus("LOCKED: create poll first");
    const res = resolvePoll(pollId);
    setStatus(res.ok ? `Resolved: ${res.result} (yes ${res.yes} / no ${res.no})` : `Resolve blocked: ${res.reason}`);
  }

  function onApply() {
    if (!pollId) return setStatus("LOCKED: create poll first");
    const res = applyPollResult(pollId);
    setStatus(res.ok ? `Applied: ${res.action}` : `Apply blocked: ${res.reason}`);
  }

  return (
    <aside className="fixed bottom-5 right-5 z-50 w-[340px] rounded-2xl border border-fuchsia-300/35 bg-black/75 p-4 shadow-[0_0_44px_rgba(217,70,239,0.28)] backdrop-blur-md">
      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-fuchsia-100">Julius Poll Bubble</p>

      <div className="space-y-2">
        <input value={overlayId} onChange={(e) => setOverlayId(e.target.value)} className="w-full rounded border border-white/15 bg-black/45 px-2 py-1 text-xs text-white" />
        <input value={issueId} onChange={(e) => setIssueId(e.target.value)} className="w-full rounded border border-white/15 bg-black/45 px-2 py-1 text-xs text-white" />
        <select value={pollType} onChange={(e) => setPollType(e.target.value as JuliusPollType)} className="w-full rounded border border-white/15 bg-black/45 px-2 py-1 text-xs text-white">
          {POLL_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <button onClick={onCreate} className="rounded-full border border-cyan-300/50 px-2 py-1 text-[10px] font-black uppercase text-cyan-100">Create</button>
        <button onClick={() => onVote("yes")} className="rounded-full border border-emerald-300/50 px-2 py-1 text-[10px] font-black uppercase text-emerald-100">Vote Yes</button>
        <button onClick={() => onVote("no")} className="rounded-full border border-rose-300/50 px-2 py-1 text-[10px] font-black uppercase text-rose-100">Vote No</button>
        <button onClick={onClose} className="rounded-full border border-amber-300/50 px-2 py-1 text-[10px] font-black uppercase text-amber-100">Close</button>
        <button onClick={onResolve} className="rounded-full border border-fuchsia-300/50 px-2 py-1 text-[10px] font-black uppercase text-fuchsia-100">Resolve</button>
        <button onClick={onApply} className="rounded-full border border-violet-300/50 px-2 py-1 text-[10px] font-black uppercase text-violet-100">Apply</button>
      </div>

      <div className="mt-3 rounded-xl border border-white/15 bg-black/35 p-2 text-[10px] uppercase tracking-[0.12em] text-zinc-200">
        timer {countdown} · yes {tallies.yes} · no {tallies.no} · total {tallies.total}
      </div>

      <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-zinc-300">{status}</p>
    </aside>
  );
}
