"use client";

import { getPerformerAudiencePerspective } from "@/lib/video/tmiPerformerAudiencePerspectiveEngine";
import { readMonitorState } from "@/lib/video/tmiLivePerformerFeedBridge";

export default function TmiPerformerMonitorWindow({
  performerId,
  roomId,
}: {
  performerId: string;
  roomId: string;
}) {
  const monitor = readMonitorState(performerId, roomId);
  const perspective = getPerformerAudiencePerspective(performerId, roomId);

  return (
    <section className="rounded-2xl border border-cyan-300/35 bg-black/55 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">Performer Monitor</p>
      <div className="mt-2 rounded-xl border border-white/10 bg-zinc-950/80 p-3">
        <p className="text-xs uppercase text-zinc-200">Mode: {monitor.mode}</p>
        <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-400">{monitor.reason}</p>
        <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-cyan-100">
          Audience visible: {perspective?.audienceVisible ? "yes" : "no"}
        </p>
        <p className="text-[10px] uppercase tracking-[0.14em] text-cyan-100">
          Active fans: {perspective?.activeFanCount ?? 0}
        </p>
        <p className="text-[10px] uppercase tracking-[0.14em] text-cyan-100">
          Reaction intensity: {perspective?.reactionIntensity ?? 0}
        </p>
      </div>
    </section>
  );
}
