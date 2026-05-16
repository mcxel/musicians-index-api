"use client";

import { useMemo, useState } from "react";
import { createOverlayDraft, submitOverlayDraft } from "@/lib/store/tmiOverlayCreatorEngine";
import type { TmiOverlayCategory, TmiOverlayRarity } from "@/lib/store/tmiOverlayMarketplaceEngine";

const SHAPES = ["halo-frame", "cypher-ring", "neon-grid", "pulse-bars"];
const NEONS = ["cyan", "fuchsia", "amber", "emerald", "violet"];
const ANIMS = ["pulse", "orbit", "scanline", "glitch-shift"];

export default function TmiOverlayBuilder({ creatorId = "creator-demo" }: { creatorId?: string }) {
  const [title, setTitle] = useState("My Neon Overlay");
  const [shape, setShape] = useState(SHAPES[0]);
  const [neon, setNeon] = useState(NEONS[0]);
  const [anim, setAnim] = useState(ANIMS[0]);
  const [rarity, setRarity] = useState<TmiOverlayRarity>("rare");
  const [category, setCategory] = useState<TmiOverlayCategory>("profile");
  const [status, setStatus] = useState("Draft not saved");
  const [lastDraftId, setLastDraftId] = useState<string | null>(null);

  const valid = useMemo(() => title.trim().length >= 4, [title]);

  function saveDraft() {
    if (!valid) return setStatus("LOCKED: NEEDS SETUP (title too short)");
    const draft = createOverlayDraft({
      creatorId,
      title: title.trim(),
      category,
      rarity,
      shapePreset: shape,
      neonPreset: neon,
      animationPreset: anim,
    });
    setLastDraftId(draft.id);
    setStatus(`Draft saved: ${draft.id}`);
  }

  function submitDraft() {
    if (!lastDraftId) return setStatus("LOCKED: save draft first");
    const res = submitOverlayDraft(creatorId, lastDraftId);
    setStatus(res.ok ? `Submitted: ${lastDraftId} (needs admin approval)` : `Submit blocked: ${res.reason}`);
  }

  return (
    <section className="rounded-2xl border border-cyan-300/30 bg-black/60 p-4 shadow-[0_0_36px_rgba(34,211,238,0.22)] backdrop-blur-sm">
      <h3 className="mb-3 text-sm font-black uppercase tracking-[0.14em] text-cyan-100">Overlay Builder</h3>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="space-y-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded border border-white/15 bg-black/50 px-2 py-1 text-xs text-white" />
          <select value={shape} onChange={(e) => setShape(e.target.value)} className="w-full rounded border border-white/15 bg-black/50 px-2 py-1 text-xs text-white">{SHAPES.map((x) => <option key={x}>{x}</option>)}</select>
          <select value={neon} onChange={(e) => setNeon(e.target.value)} className="w-full rounded border border-white/15 bg-black/50 px-2 py-1 text-xs text-white">{NEONS.map((x) => <option key={x}>{x}</option>)}</select>
          <select value={anim} onChange={(e) => setAnim(e.target.value)} className="w-full rounded border border-white/15 bg-black/50 px-2 py-1 text-xs text-white">{ANIMS.map((x) => <option key={x}>{x}</option>)}</select>
          <select value={rarity} onChange={(e) => setRarity(e.target.value as TmiOverlayRarity)} className="w-full rounded border border-white/15 bg-black/50 px-2 py-1 text-xs text-white">
            <option value="common">common</option><option value="rare">rare</option><option value="epic">epic</option><option value="legendary">legendary</option>
          </select>
          <select value={category} onChange={(e) => setCategory(e.target.value as TmiOverlayCategory)} className="w-full rounded border border-white/15 bg-black/50 px-2 py-1 text-xs text-white">
            <option value="profile">profile</option><option value="video">video</option><option value="venue">venue</option><option value="magazine">magazine</option><option value="billboard">billboard</option><option value="game">game</option><option value="seat">seat</option><option value="reaction">reaction</option><option value="transition">transition</option><option value="starfield-burst">starfield-burst</option><option value="mirror-light">mirror-light</option><option value="sponsor-badge">sponsor-badge</option><option value="cypher-battle">cypher-battle</option><option value="homepage-issue">homepage-issue</option><option value="lobby-wall">lobby-wall</option>
          </select>
          <div className="flex gap-2">
            <button onClick={saveDraft} className="rounded-full border border-cyan-300/55 px-3 py-1 text-[10px] font-black uppercase text-cyan-100">Save Draft</button>
            <button onClick={submitDraft} className="rounded-full border border-fuchsia-300/55 px-3 py-1 text-[10px] font-black uppercase text-fuchsia-100">Submit Draft</button>
          </div>
        </div>

        <div className="rounded-xl border border-white/15 bg-black/35 p-3">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-300">Front/Rear preview</p>
          <div className="relative mb-2 h-24 overflow-hidden rounded border border-white/15 bg-gradient-to-br from-cyan-500/10 to-fuchsia-500/10">
            <div className="absolute inset-0 animate-pulse" />
            <p className="relative z-10 p-2 text-[10px] uppercase text-white">Front · {shape} · {neon} · {anim}</p>
          </div>
          <div className="relative h-24 overflow-hidden rounded border border-white/15 bg-gradient-to-br from-fuchsia-500/10 to-cyan-500/10">
            <div className="absolute inset-0 animate-pulse" />
            <p className="relative z-10 p-2 text-[10px] uppercase text-white">Rear · {category} · {rarity}</p>
          </div>
          <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-zinc-200">{status}</p>
        </div>
      </div>
    </section>
  );
}
